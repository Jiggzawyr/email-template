import express, { Express } from 'express';
import dotenv from 'dotenv';
const template = require('./routes/emailTemplate');

dotenv.config();

const app: Express = express();
const port: string | undefined = process.env.APP_PORT;

// parse application/json
app.use(express.json());

app.use('/email-template/v1/templates', template)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});