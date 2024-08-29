import openai from './openAiCLient.js';
import { VerificationRunStatus } from './verificationStatus.js';
import updateManyChatCustomField from '../manychat/manyChatset.js';
import assistantFunctions from './assistantFunctions.js';

export async function handleChat(req, res) {
  console.log('Iniciou handleChat:');
  console.log('Dados recebidos:', req.body);
  const {
    Nome: userName,
    ManychatID: userID,
    ThreadID: userThread,
    Pergunta: userMessage,
  } = req.body;

  try {
    console.log('Criando mensagem no thread');
    await openai.beta.threads.messages.create(userThread, {
      role: 'user',
      content: userMessage,
    });
    console.log('Mensagem criada no thread');
    console.log(userMessage);

    console.log('Configurando busca na vector store');
    const run = await openai.beta.threads.runs.create(userThread, {
      assistant_id: 'asst_Nh2qtDz0liVnK6CWaLQOt1Jx',
      additional_instructions: `Os clientes da v4 company gostam de mensagens práticas e breves, faça comentários sobre as informações que o usuário passar antes de fazer perguntas. Você tem a função de pesquisar vídeos de um playlist de casos de sucesso da v4 company.Chame o usuário pelo nome ${userName}.`,
      additional_messages: [
        {
          role: 'user',
          content: 'Olá, eu prefiro respostas e frases curtas.',
        },
        {
          role: 'assistant',
          content: 'Claro, te ajudarei hoje com respostas fáceis e práticas.',
        },
        {
          role: 'user',
          content: 'gosto de respostas calorosas',
        },
        {
          role: 'assistant',
          content: 'Claro, vou ser sempre positiva e animada.',
        },
      ],
      tools: assistantFunctions,
    });

    console.log('Run criado:', run);

    const runId = run.id;
    let runStatus = run.status;

    console.log(`Run ID: ${runId}, Status inicial do run: ${runStatus}`);

    const finalRunStatus = await VerificationRunStatus(
      userThread,
      runId,
      runStatus,
    );
    console.log('Status final do run:', finalRunStatus);

    const messages = await openai.beta.threads.messages.list(userThread);
    console.log('Mensagens no thread:', messages);

    const lastMessage = messages.data[0].content.text;
    console.log('_____--------- ', lastMessage);
    let finalMessage = lastMessage.replace(/【.*?†.*?】/g, '');

    console.log('Texto da última mensagem no thread:', lastMessage);
    console.log('Mensagem final processada:', finalMessage);

    const parts = finalMessage.split(/(?<=[.?!])\s+/);

    const filteredParts = parts.filter(part => part && part.trim() !== '');

    const part1 = filteredParts.length > 0 ? filteredParts[0] : null;
    const part2 = filteredParts.length > 1 ? filteredParts[1] : null;
    const part3 = filteredParts.length > 2 ? filteredParts[2] : null;
    const part4 = filteredParts.length > 3 ? filteredParts[3] : null;

    res.status(200).send('Resposta do Assistente: ' + finalMessage);
    console.log('Resposta enviada para ManyChat');
    updateManyChatCustomField(userID, part1, part2, part3, part4);

  } catch (error) {
    console.error('Erro na API do GPT:', error);
    res.status(500).send('Erro ao processar a mensagem');
  }
}
