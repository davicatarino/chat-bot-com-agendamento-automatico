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
            description: 'O nicho de negócios, e.g. marketing digital, fitness, culinária',
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

export default assistantFunctions;
