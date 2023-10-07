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
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
  },
  cron: {
    interval: env.CRON_INTERVAL,
    mailsPerCycle: parseInt(env.CRON_MAILS_PER_CYCLE!),
  },
};
