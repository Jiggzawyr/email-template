import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

export const config = {
  db: { 
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT!),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
};
