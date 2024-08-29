import config from '../../config/index.js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config(); // Configura as variáveis de ambiente

// Obtenha o diretório atual usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, 'token.json');

// Configura o cliente OAuth2 do Google com as credenciais das variáveis de ambiente
const oauth2Client = new google.auth.OAuth2(
  process.env.GGClient_ID,
  process.env.GGClient_KEY,
  process.env.GG_redirect
);

function storeToken(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}

function loadToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(token);
  }
}

loadToken();

export { oauth2Client };

// Rota para iniciar o fluxo OAuth2 do Google
export async function auth(req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Solicita acesso offline para receber um token de atualização
    scope: 'https://www.googleapis.com/auth/calendar', 
  });
  res.redirect(url);
}

// Rota para lidar com o callback do OAuth2
export async function redirect(req, res) {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error("Couldn't get token", err);
      res.send('Error');
      return;
    }
    oauth2Client.setCredentials(tokens);
    storeToken(tokens);
    res.redirect("http://localhost:3000/chat/freebusy");
  });
}

function refreshToken() {
  oauth2Client.refreshAccessToken((err, tokens) => {
    if (err) {
      console.error('Error refreshing access token', err);
    } else {
      oauth2Client.setCredentials(tokens);
      storeToken(tokens);
    }
  });
}

export { refreshToken };
