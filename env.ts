import { readFileSync } from 'node:fs';
export const DB_PATH = process.env.DB_PATH || '/db/db.sqlite';
export const FROM_EMAIL = process.env.FROM_EMAIL || 'email@example.com';
export const SERVER_NAME = process.env.SERVER_NAME || 'localhost';
export const FILES_PATH = process.env.FILES_PATH || '/files';

if (process.env.EMAIL_KEY_FILE === undefined) {
  throw new Error('EMAIL_KEY_FILE is not set');
}

if (process.env.PEPPER_FILE === undefined) {
  throw new Error('PEPPER_FILE is not set');
}

export const EMAIL_KEY = readFileSync(
  process.env.EMAIL_KEY_FILE,
  'utf8'
).trim();
export const PEPPER = readFileSync(process.env.PEPPER_FILE, 'utf8').trim();
