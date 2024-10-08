import OpenAI from 'openai';
import config from '../config/index.js';
import updateManyChatCustomField from './manychat/manyChatset.js';
import getVideoLinks from './google/getVideos.js';
/*  // Configura as variáveis de ambiente */

config();
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});
global.getVideoLinks = getVideoLinks;

/*assistant function declaration  */

const assistantFunctions = [
  {
    type: 'function',
    function: {
      name: 'get_video_links',
      description: 'Busca links de vídeos do YouTube',
      parameters: {
        type: 'object',
        properties: {
          business_niche: {
            type: 'string',
            description:
              'O nicho de negócios, e.g. marketing digital, fitness, culinária',
          },
          limit: {
            type: 'integer',
            description: 'O número de links de vídeo a serem recuperados',
            default: 1,
          },
        },
        required: ['business_niche'],
      },
    },
  },
];

/* call assistant function  */

async function handleFunctionCall(toolCalls) {
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    let output;

    console.log(`Chamando função: ${functionName} com argumentos:`, args);

    if (functionName === 'get_video_links') {
      const videos = await getVideoLinks(args.limit || 50);
      const prompt =
        `Filtre os vídeos abaixo e escolha os que são relevantes para o nicho de negócios: "${args.business_niche}".\n\n` +
        videos
          .map(
            (video) =>
              `Title: ${video.title}\nDescription: ${video.description}\nURL: ${video.url}\n`,
          )
          .join('\n');

      const assistantResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      output = assistantResponse.choices[0].message.content;
    }

    console.log(`Output da função ${functionName}:`, output);

    toolOutputs.push({
      tool_call_id: toolCall.id,
      output,
    });
  }

  return toolOutputs;
}

/* run status verification */
export async function VerificationRunStatus(userThread, runId, runStatus) {
  while (runStatus !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const runStatusObject = await openai.beta.threads.runs.retrieve(
      userThread,
      runId,
    );
    runStatus = runStatusObject.status;

    console.log(`Status do run: ${runStatus}`);

    if (runStatus === 'requires_action') {
      console.log('Run requer ação');
      const toolCalls =
        runStatusObject.required_action.submit_tool_outputs.tool_calls;
      console.log('Chamadas de ferramenta requeridas:', toolCalls);
      const toolOutputs = await handleFunctionCall(toolCalls);
      console.log('Outputs das ferramentas:', toolOutputs);
      await openai.beta.threads.runs.submitToolOutputs(userThread, runId, {
        tool_outputs: toolOutputs,
      });
      console.log('Tool outputs submetidos');
    }

    if (['failed', 'cancelled', 'expired'].includes(runStatus)) {
      console.log(
        `Run status is '${runStatus}'. Unable to complete the request.`,
      );
      break;
    }
  }
  return runStatus;
}

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

    /*   const assistantMessage = run.final_message.content;
        const finalResponse = await openai.beta.threads.messages.list(userThread, {
      limit: 1,
      direction: 'desc',
    });

    const assistantMessage = finalResponse.data[0].content[0].text.value;
    console.log('Mensagem final do assistente:', assistantMessage); */
    const messages = await openai.beta.threads.messages.list(userThread);
    console.log('Mensagens no thread:', messages);
    
    // Supondo que `messages.data` seja uma lista de objetos, e cada objeto tenha uma propriedade `content`
    const lastMessage = messages.data[0].content.text;
    console.log('_____--------- ', lastMessage)
    // A estrutura de `lastMessage.content` pode variar, então vamos garantir que estamos acessando corretamente:
  
    
    let finalMessage = lastMessage.replace(/【.*?†.*?】/g, '');
    
    console.log('Texto da última mensagem no thread:', lastMessage);
    console.log('Mensagem final processada:', finalMessage);
    
    const parts = finalMessage.split(/(?<=[.?!])\s+/);
    
    // Filtrar partes nulas ou vazias antes de enviar para o ManyChat
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
