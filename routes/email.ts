import express, { Request, Response } from 'express';
import { Exception } from '../models/exception';
import { QueryResult } from 'pg';
import { pool } from '../db';
import { transporter } from '../smtp';

const router = express.Router();

module.exports = router;

// Send email
router.post('/', async (req: Request, res: Response) => {
    try {
        // Get template
        const templateId: number = req.body.templateId;
        if(!templateId) throw Error("templateId is required")
        const template: QueryResult<any> = 
            await pool.query("SELECT subject_template, body_template FROM dbo.email_template WHERE email_template_id = $1", [templateId]);
        if(template.rows.length == 0) throw Error(`Template wiht with id = ${templateId} does not exist`);
        let subjectTemplate: string = template.rows[0]['subject_template'];
        let bodyTemplate: string = template.rows[0]['body_template'];

        // Send email
        if(!Array.isArray(req.body.subjectParams)) throw Error("subjectParams must be a list");
        const subject = prepareTemplate(subjectTemplate, req.body.subjectParams);
        if(!Array.isArray(req.body.bodyParams)) throw Error("bodyParams must be a list")
        const body = prepareTemplate(bodyTemplate, req.body.bodyParams);

        const to: String = req.body.to;
        let mailOptions = {
            from: 'emailtemplate@nookcrew.com',
            to: to,
            subject: subject,
            text: body,
        };

        await transporter.sendMail(mailOptions);
    
        // Insert email into DB

        const queryStringEmail: string = 
            " INSERT INTO dbo.email(email_template_id, email_status_id, \"to\", subject, body, created_at, sent_at) " +
            " VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ";
        const queryParamsEmail: any[] = [ templateId, 2, to, subject, body ]

        await pool.query(queryStringEmail, queryParamsEmail);

        res.status(200).json({
            status: "Mail sent"
        })
    } catch (error: any) {
        const exception: Exception = {
            code: 400,
            status: "BAD REQUEST",
            message: error.message,
        }
        res.status(400).json(exception);
    }

});

function prepareTemplate(template: string, params: any[]): string {
    params.forEach((param: { name: string, value: string}) => {
        if(!param.name) throw Error("template param must have a name")
        if(!param.value) throw Error("template param must have a value")
        template = template.replace('$' + param.name + '$', param.value);
    });
    return template;
}