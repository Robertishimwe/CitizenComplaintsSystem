import { env } from './environment';

export const pindoConfig = {
  apiToken: env.PINDO_API_TOKEN,
  senderId: env.PINDO_SENDER_ID,
  baseUrl: 'https://api.pindo.io/v1', // Pindo API base URL
  smsSingleUrl: '/sms/',
  smsBulkUrl: '/sms/bulk',
};

// You might create a Pindo client instance here if it's more complex
// For now, just exporting the config values.
// Example for a simple client (you'd abstract this into a service later):
/*
import axios from 'axios';

export const pindoClient = axios.create({
  baseURL: pindoConfig.baseUrl,
  headers: {
    Authorization: `Bearer ${pindoConfig.apiToken}`,
    'Content-Type': 'application/json',
  },
});
*/