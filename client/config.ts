// config.ts
export const SERVER_IP = process.env.SERVER_IP || '192.168.98.215';
export const CLIENT_IP = process.env.CLIENT_IP || '192.168.98.215';
export const CLIENT_PORT = process.env.CLIENT_PORT || '3000';
export const SERVER_PORT = process.env.SERVER_PORT || '3001';
export const SERVER_URL = `https://default-server-production.up.railway.app`;
export const CLIENT_URL = `https://${CLIENT_IP}:${CLIENT_PORT}`;
