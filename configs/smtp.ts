var nodemailer = require('nodemailer');
import { config } from './config';

const transportConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
    }
}

export const transporter = nodemailer.createTransport(transportConfig);

