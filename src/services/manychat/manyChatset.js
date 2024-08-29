
import axios from 'axios';
import config from '../../config/index.js';
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
