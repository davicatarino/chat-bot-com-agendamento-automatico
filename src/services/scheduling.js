import { oauth2Client } from './autheticationGoogle.js';
import { google } from 'googleapis';
import moment from 'moment-timezone';

// Função para calcular horários livres nos próximos 7 dias
export async function handleScheduling(req, res) {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log('Dados recebidos:', req.body);
    const userName = req.body.Name;
    const userEmail = req.body.Email;
    const userHour = req.body.Horario;

    function addOneHourToISO(isoString) {
      const dateTime = moment.utc(isoString);
      dateTime.add(1, 'hours');
      return dateTime.toISOString();
    }

    const newHour = addOneHourToISO(userHour);

    var event = {
      summary: userName,
      description: 'Reunião agendada pela Julia IA.',
      start: {
        dateTime: userHour,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: newHour,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [
        { email: 'davi.catarino@hotmail.com' },
        { email: userEmail }
      ],
      reminders: {
        useDefault: true,
      },
    };

    // Inserir o evento no Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Evento criado:', response.data);

    // Enviar resposta ao cliente
    res.status(200).send({
      message: 'Evento criado com sucesso',
      event: response.data,
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).send({
      message: 'Erro ao criar evento',
      error: error.message,
    });
  }
}
