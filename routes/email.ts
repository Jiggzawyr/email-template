import express, { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../configs/db';
import { transporter } from '../configs/smtp';
import { NotFoundError } from '../models/notFoundError';
import { BadRequestError } from '../models/badRequestError';

const router = express.Router();

module.exports = router;

// Send email
router.post('/', async (req: Request, res: Response, next: NextFunction) => {

    try {

        // Get template
        const templateId: number = req.body.templateId;
        if(!templateId) throw Error("templateId is required")
        const sql: string = "SELECT subject_template, body_template FROM dbo.email_template WHERE email_template_id = $1";
        const template: QueryResult<any> = await pool.query(sql, [templateId]);
        if(template.rows.length == 0) throw new NotFoundError(`Template with id = ${templateId} does not exist`);
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

        const sqlQueryEmail: string = 
            " INSERT INTO dbo.email(email_template_id, email_status_id, \"to\", subject, body, created_at, sent_at) " +
            " VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ";
        const sqlParamsEmail: any[] = [ templateId, 2, to, subject, body ]

        await pool.query(sqlQueryEmail, sqlParamsEmail);

        res.status(200).json({
            status: "Mail sent"
        })

    } catch (error: any) {
        next(error);
    }

});

// Get email
router.get('/:emailId', async (req: Request, res: Response, next: NextFunction) => {
    
    try{

        const emailId = req.params.emailId;
        if(/^[0-9]*$/.test(emailId) == false) throw new BadRequestError("Email id must be integer");
        const sql: string = "SELECT * FROM dbo.email WHERE email_id = $1";
        const result: QueryResult<any> = await pool.query(sql, [emailId]);
        if(result.rows.length == 0) throw new NotFoundError(`Email with id = ${emailId} does not exist`);
        res.status(200).json(result.rows[0])

    } catch (error: any) {
        next(error);
    }

})

function prepareTemplate(template: string, params: any[]): string {
    params.forEach((param: { name: string, value: string}) => {
        if(!param.name) throw Error("template param must have a name")
        if(!param.value) throw Error("template param must have a value")
        template = template.replace('$' + param.name + '$', param.value);
    });
    return template;
}