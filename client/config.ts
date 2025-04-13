// config.ts
export const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP || '192.168.0.1';
export const CLIENT_IP = process.env.NEXT_PUBLIC_SERVER_IP || '192.168.0.1';
export const CLIENT_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || '3000';
export const SERVER_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || '3001';
export const SERVER_URL = `https://${SERVER_IP}:${SERVER_PORT}`;
export const CLIENT_URL = `https://${CLIENT_IP}:${CLIENT_PORT}`;
