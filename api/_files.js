const axios = require('axios');
const BOT_TOKEN = process.env.BOT_TOKEN || '8470259022:AAEvcxMTV1xLmQyz2dcxwr94RbLsdvJGiqg';
const CHAT_ID   = process.env.CHAT_ID   || '6142816761';

const prefix = (type) => `📦${type}|`;

export const save = (type, obj) =>
  axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: prefix(type) + JSON.stringify(obj),
    parse_mode: 'HTML'
  });

export const load = async (type) => {
  const { data } = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1&limit=100`);
  return data.result
    .map(u => u.message?.text)
    .filter(Boolean)
    .filter(t => t.startsWith(prefix(type)))
    .map(t => JSON.parse(t.replace(prefix(type), '')));
};
