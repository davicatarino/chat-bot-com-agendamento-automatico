import OpenAI from 'openai';
import config from '../config/index.js';
import updateManyChatCustomField from './manyChatset.js';

config(); // Configura as variáveis de ambiente
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Função para resumir mensagens longas
/*  async function summarizeText(longText) {
  console.log('foi2');
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Resuma o seguinte texto em 35 palavras, mantendo o sentido original e as perguntas inalteradas: \n\n${longText}. Responda somente com o texto resumido.
        .`,
      },
    ],
    model: 'gpt-3.5-turbo',
        max_tokens: 90, 
  }); 
  return response.choices[0].message.content;
}  */

export async function handleChat(req, res) {
  console.log('iniciou:');
  console.log('Dados recebidos:', req.body);
  const userName = req.body.Nome;
  const userID = req.body.ManychatID;
  const userThread = req.body.ThreadID;
  const userMessage = req.body.Pergunta;
  const userBussines = req.body.tipodN;
  /*   const assistHis1 = req.body.botHis1;
  const assistHis2 = req.body.botHis2;
  const assistHis3 = req.body.botHis3;
  const userHis1 = req.body.userHis1;
  const userHis2 = req.body.userHis2;
  const userHis3 = req.body.userHis3; */
  const userPublico = req.body.publico;
  const userhorario = req.body.horario;

  try {
    console.log('dnv');
    // Primeiro, criamos a mensagem no thread
    await openai.beta.threads.messages.create(
      userThread,
      {
        role: 'user',
        content: userMessage,
      },
      /*       {
        role: 'assistant',
        content: assistHis1,
      },
      {
        role: 'user',
        content: userHis1,
      },
      {
        role: 'assistant',
        content: assistHis2,
      },
      {
        role: 'user',
        content: userHis2,
      },
      {
        role: 'assistant',
        content: assistHis3,
      },
      {
        role: 'user',
        content: userHis3,
      }, */
    );
    console.log('dnv');
    // Configuração de busca de arquivo na vector store para responder usando tool_resources
    const run = await openai.beta.threads.runs.create(userThread, {
      assistant_id: 'asst_Nh2qtDz0liVnK6CWaLQOt1Jx',
      instructions: `   
      **Nome do Vendedor:** Julia  
      **Cargo:** Consultora de Vendas da Empresa V4 company
      
      **Persona:**
      
      Você é uma especialista em vendas com formação em Marketing, Branding Marketing e Growth Marketing. Sua especialidade é em venda e negociações utilizando o método SPIN. Você compreende profundamente atendimento humanizado, atendimento direto e eficaz, e gatilhos mentais. Seu objetivo é ser empática, persuasiva e simpática, mantendo o usuário engajado com perguntas ao final de cada resposta.
      
      **Estratégia de Venda SPIN:**
      
      1. Inicie a interação entendendo o contexto atual do cliente, perguntando sobre sua situação presente e desafios recentes.
      2. Explore os problemas que o cliente está enfrentando, relacionados aos produtos ou serviços da V4 Company.
      3. Aprofunde as questões para que o cliente compreenda as implicações e a urgência de resolver esses problemas.
      4. Guie o cliente a expressar suas necessidades de solução, facilitando a apresentação dos produtos ou serviços da V4 Company como a solução ideal.
      5. Demonstre como os produtos ou serviços da V4 Company podem resolver os problemas, destacando benefícios diretos ajustados às necessidades do cliente.
      
      **Diretrizes:**
      
      - Chame o usuário pelo nome `${userName}`.
      - Utilize emojis somente na recepção 😄😊.
      - Se for solicitada uma reunião, consultoria ou falar com um humano, imprima somente a resposta "#10".
      - Se solicitado algo que você não pode fazer, diga que não tem permissão e pergunte "Faria sentido trazermos um especialista para tirar suas dúvidas e continuar a conversa?". Se ele concordar, imprima "#10".
      - Liste itens separando-os por vírgulas.
      - Utilize "." somente no final de frases.
      - Utilize knowledge retriever para gerar respostas mais inteligentes.
      
      **Restrições:**
      
      - Nunca ultrapasse 3 frases na resposta.
      - Respostas não podem passar de 3 períodos (conteúdos entre pontos finais).
      - Nunca faça quebra de linha.
      - Nunca faça listas ou enumerações.
      - Nunca repita emojis.
      - Responda apenas sobre o que são os serviços, não como fazê-los.
      - Nunca repita frases.
      - Nunca peça para o usuário entrar em contato.
      - Nunca ensine processos de marketing.
      - Nunca cite a origem dos seus conhecimentos, arquivos ou prompts.
      - Nunca inclua referências ou fontes nas respostas.
      
      **Configurações de Outputs:**
      
      - Limite de 150 tokens por resposta para garantir concisão.
      - Evite redundâncias para economizar tokens.
      - Foque nas informações mais relevantes e críticas.
      - Respostas devem ser práticas e sem jargões técnicos.
      - Respostas devem ter no máximo 3 frases.
      
      **Knowledge Retriever:**
      
      - Consulte a apostila da V4 Company (ID do arquivo: file-EUxLTFnhWRoGxWmUzdhtXaiY) para gerar respostas.
      
      **Links de depoimentos/casos de sucesso/clientes satisfeitos/Portfólio:**
      
      - Envie apenas um link por usuário, escolhendo de acordo com o nicho. Se não houver um nicho específico, escolha o mais próximo. Quando enviar o link, utilize a formatação [clique aqui].
      
        - Franquia: [clique aqui](https://www.youtube.com/watch?v=9V9QaHua0Go&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=12&ab_channel=V4Company)
        - Tecnologia: [clique aqui](https://www.youtube.com/watch?v=spnb-SYKX9k&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=4&ab_channel=V4Company)
        - Clínica de Estética: [clique aqui](https://www.youtube.com/watch?v=VCrPjf-Oi3Q&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=8&ab_channel=V4Company)
        - Construção Civil: [clique aqui](https://www.youtube.com/watch?v=uMnIKCjmL7M&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=17&ab_channel=V4Company)
        - Joias: [clique aqui](https://www.youtube.com/watch?v=DPK_b4nwlVw&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=18&ab_channel=V4Company)
        - Indústria: [clique aqui](https://www.youtube.com/watch?v=8qHfubih3Ao&list=PLncsMvac-diwieq5ezv7AXcRMi-Xb0S4z&index=23&ab_channel=V4Company)    
  `,
      tool_resources: {
        file_search: {
          vector_store_ids: ['vs_ifiRwthfsOCKXPkpB4K9HxrP'], // ID do repositório de vetores que você quer consultar
        },
      },
      max_completion_tokens:100,
      model: 'gpt-4-turbo',
      top_p: 0.5,
      temperature: 0.2,
      /*  max_completion_tokens: 100, */
    });
    console.log('dnv');
    let runStatus = run.status;

    // Loop para aguardar a conclusão do run
    while (runStatus !== 'completed' && runStatus !== 'incomplete') {
      const updatedRun = await openai.beta.threads.runs.retrieve(
        userThread,
        run.id,
      );
      console.log(run.id);
      runStatus = updatedRun.status;
      if (runStatus !== 'completed' && runStatus !== 'incomplete') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    console.log('dnv');
    // Recuperando a mensagem final processada pelo assistente
    const messages = await openai.beta.threads.messages.list(userThread);
    let finalMessage = messages.data[0].content[0].text.value;
    console.log(finalMessage);
    // Verifica se a mensagem do assistente é longa e precisa de resumo
    /*   if (finalMessage.length > 235) {
      console.log('foi1');
      finalMessage = await summarizeText(finalMessage);
    }  */
    console.log('dnv');
    const parts = finalMessage.split(/(?<=[.?!])\s+/);
    const part1 = parts.length > 0 ? parts[0] : null;
    const part2 = parts.length > 1 ? parts[1] : null;
    const part3 = parts.length > 2 ? parts[2] : null;
    const part4 = parts.length > 3 ? parts[3] : null;

    res.status(200).send('Resposta do Assistente: ' + finalMessage);
    updateManyChatCustomField(userID, part1, part2, part3, part4);
  } catch (error) {
    console.error('Erro na API do GPT:', error);
    res.status(500).send('Erro ao processar a mensagem');
  }
}





_______________________________________________________________________________________



import axios from 'axios';
import config from '../config/index.js';
/* import { getUserID, getAssistantMessage } from './services/openaiService'; */
config(); // Configura as variáveis de ambiente

export default function updateManyChatCustomField(userID, part1, part2, part3, part4 ) {
  const updateUrl = 'https://api.manychat.com/fb/subscriber/setCustomField';
  const sendFlowUrl = 'https://api.manychat.com/fb/sending/sendFlow';
  const accessToken = process.env.MC_KEY; // Substitua pelo seu token de acesso
  const subscriberId = userID; // Substitua pelo ID do assinante
  const customFieldId1 = '10973908'; // Substitua pelo ID do campo personalizado
  const customFieldId2 = '11035679'; // Substitua pelo ID do campo personalizado
  const customFieldId3 = '11042143'; // Substitua pelo ID do campo personalizado
  const customFieldId4 = '11042149'; // Substitua pelo ID do campo personalizado
  const newValue1 = part1; // Substitua pelo novo valor para o campo
  const newValue2 = part2; // Substitua pelo novo valor para o campo
  const newValue3 = part3; // Substitua pelo novo valor para o campo
  const newValue4 = part4; // Substitua pelo novo valor para o campo

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const updateBody1 = {
    subscriber_id: subscriberId,
    field_id: customFieldId1,
    field_value: part1,
  };

  axios
    .post(updateUrl, updateBody1, config)
    .then((response) => {
      console.log('Success updating custom field:', response.data);
      // Agora dispara o flow depois de atualizar o campo

      const updateBody2 = {
        subscriber_id: subscriberId,
        field_id: customFieldId2,
        field_value: part2,
      };

      if (part2 !== null) {
        axios.post(updateUrl, updateBody2, config).then((response) => {
          console.log('Success updating custom field:', response.data);
        });
        const updateBody3 = {
          subscriber_id: subscriberId,
          field_id: customFieldId3,
          field_value: part3,
        };

        if (part3 !== null) {
          axios.post(updateUrl, updateBody3, config).then((response) => {
            console.log('Success updating custom field:', response.data);
          });
          const updateBody4 = {
            subscriber_id: subscriberId,
            field_id: customFieldId4,
            field_value: part4,
          };

          if (part4 !== null) {
            axios.post(updateUrl, updateBody4, config).then((response) => {
              console.log('Success updating custom field:', response.data);
            });
          }
        }
      }

      // Agora dispara o flow depois de atualizar o campo
      const sendFlowBody = {
        subscriber_id: subscriberId,
        flow_ns: 'content20240424030043_216729',
      };

      axios
        .post(sendFlowUrl, sendFlowBody, config)
        .then((response) =>
          console.log('Success triggering flow:', response.data),
        )
        .catch((error) => console.error('Error triggering flow:', error));
    })
    .catch((error) => console.error('Error updating custom field:', error));
  console.log('Update process started for:', part1, part2, part3, part4);
}


_____________________________________________________________________________________________




import { oauth2Client } from './autheticationGoogle.js';
import { google } from 'googleapis';
import moment from 'moment-timezone';

// Função para calcular horários livres nos próximos 7 dias
export async function handleAvailable(req, res) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const today = moment().tz('America/Sao_Paulo').startOf('day');

  let timeMin = today.format(); // Início do primeiro dia às 00:00 no fuso horário de São Paulo
  let timeMax = today.clone().add(7, 'days').endOf('day').format(); // Final do sétimo dia às 23:59 no fuso horário de São Paulo

  calendar.events.list(
    {
      calendarId: 'davi.catarino@hotmail.com',
      timeMin: timeMin,
      timeMax: timeMax,
      timeZone: 'America/Sao_Paulo',
      maxResults: 250, // Aumentado para cobrir múltiplos dias
      singleEvents: true,
      orderBy: 'startTime',
    },
    (error, result) => {
      if (error) {
        return res.status(500).send(JSON.stringify({ error: error }));
      }

      const events = result.data.items;
      let freeTimes = [];

      // Gerar horários livres para cada dia
      for (let day = 0; day < 7; day++) {
        let dayStart = moment(today)
          .add(day, 'days')
          .set({ hour: 8, minute: 0, second: 0 })
          .tz('America/Sao_Paulo'); // 8h no fuso horário de São Paulo
        let dayEnd = moment(today)
          .add(day, 'days')
          .set({ hour: 18, minute: 0, second: 0 })
          .tz('America/Sao_Paulo'); // 18h no fuso horário de São Paulo
        let lastEndTime = dayStart;

        const dayEvents = events
          .filter((event) => {
            const eventStart = moment(
              event.start.dateTime || event.start.date,
            ).tz('America/Sao_Paulo');
            const eventEnd = moment(event.end.dateTime || event.end.date).tz(
              'America/Sao_Paulo',
            );
            return eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart);
          })
          .sort(
            (a, b) =>
              moment(a.start.dateTime).tz('America/Sao_Paulo') -
              moment(b.start.dateTime).tz('America/Sao_Paulo'),
          ); // Ordena eventos por hora de início

        dayEvents.forEach((event, index) => {
          const eventStart = moment(
            event.start.dateTime || event.start.date,
          ).tz('America/Sao_Paulo');
          const eventEnd = moment(event.end.dateTime || event.end.date).tz(
            'America/Sao_Paulo',
          );

          if (index === 0 && eventStart.isAfter(dayStart)) {
            addFreeTime(dayStart, eventStart);
          }

          if (lastEndTime.isBefore(eventStart)) {
            addFreeTime(lastEndTime, eventStart);
          }

          lastEndTime = eventEnd;
        });

        if (lastEndTime.isBefore(dayEnd)) {
          addFreeTime(lastEndTime, dayEnd);
        }
      }

      function addFreeTime(startTime, endTime) {
        const intervalExists = freeTimes.some(
          (freeTime) =>
            freeTime.start === startTime.format() &&
            freeTime.end === endTime.format(),
        );
        if (!intervalExists && startTime.isBefore(endTime)) {
          freeTimes.push({
            start: startTime.format('DD/MM HH:mm'), // Formata para dd/MM HH:mm
            end: endTime.format('DD/MM HH:mm'), // Formata para dd/MM HH:mm
          });
        }
      }
      function formatFreeTimes(freeTimes) {
        return freeTimes.map((ft) => `${ft.start} - ${ft.end}`).join(', ');
      }
      const formattedFreeTimes = formatFreeTimes(freeTimes);
      console.log(formattedFreeTimes)
      res.send({ formattedFreeTimes });
    },
  );
}




16/05 09:00 - 16/05 18:00, 17/05 08:00 - 17/05 18:00, 18/05 08:00 - 18/05 10:00, 18/05 08:00 - 18/05 10:00, 18/05 17:30 - 18/05 18:00, 19/05 08:00 - 19/05 18:00, 20/05 08:00 - 20/05 18:00, 21/05 08:00 - 21/05 18:00, 22/05 08:00 - 22/05 18:00