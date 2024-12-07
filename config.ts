import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Optionally log to ensure it's working
console.log('Environment variables loaded from .env');
