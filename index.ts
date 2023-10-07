import express, { Express } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './utils/errorHandler';
const template = require('./routes/template');
const email = require('./routes/email');
import cron from "node-cron";
import { sendScheduledMails } from './utils/mailUtil';

dotenv.config();

const app: Express = express();
const port: string | undefined = process.env.APP_PORT;

app.use(express.json());
app.use('/email-template/v1/templates', template)
app.use('/email-template/v1/emails', email)
  app.use(errorHandler)

const interval: string = process.env.CRON_INTERVAL || "*/2 * * * *";

cron.schedule(interval, function () {
  sendScheduledMails();
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});