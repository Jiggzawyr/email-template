import express, { Express } from 'express';
import dotenv from 'dotenv';
const template = require('./routes/template');
const email = require('./routes/email');

dotenv.config();

const app: Express = express();
const port: string | undefined = process.env.APP_PORT;

app.use(express.json());
app.use('/email-template/v1/templates', template)
app.use('/email-template/v1/emails', email)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});