import openai from './OpenAIClient.js';
import getVideoLinks from '../google/getVideos.js';

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

export default handleFunctionCall;
