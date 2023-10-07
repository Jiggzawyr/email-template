import express, { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../configs/db';
import { transporter } from '../configs/smtp';
import { NotFoundError } from '../models/notFoundError';
import { BadRequestError } from '../models/badRequestError';
import { Email } from '../models/email';
import { prepareTemplate } from '../utils/mailUtil';

const router = express.Router();

module.exports = router;

// Send email
router.post('/', async (req: Request, res: Response, next: NextFunction) => {

    try {

        // Get template
        const templateId: number = req.body.templateId;
        if(!templateId) throw Error("templateId is required")
        const sql: string = `SELECT subject_template, body_template FROM dbo.email_template WHERE email_template_id = $1`;
        const template: QueryResult<any> = await pool.query(sql, [templateId]);
        if(template.rows.length == 0) throw new NotFoundError(`Template with id = ${templateId} does not exist`);
        let subjectTemplate: string = template.rows[0]['subject_template'];
        let bodyTemplate: string = template.rows[0]['body_template'];

        // Prepare email
        if(!Array.isArray(req.body.subjectParams)) throw new BadRequestError("subjectParams must be a list");
        const subject = prepareTemplate(subjectTemplate, req.body.subjectParams);
        if(!Array.isArray(req.body.bodyParams)) throw new BadRequestError("bodyParams must be a list")
        const body = prepareTemplate(bodyTemplate, req.body.bodyParams);

        const to: string = req.body.to;
        if(!to) throw new BadRequestError("to cannot be empty")

        // Send email
        let mailOptions = {
            from: 'emailtemplate@nookcrew.com',
            to: to,
            subject: subject,
            text: body,
        };

        let emailStatus: number = 2; // 2 - SENT
        let errorDescription: string | undefined = undefined;

        try {
            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            emailStatus = 3; // 3 - ERROR
            errorDescription = error.message
        }

        // Insert email into DB
        const currentDate = new Date();

        const sqlQueryEmail: string = `
            INSERT INTO dbo.email(email_template_id, email_status_id, error_description, \"to\", subject, body, created_at, sent_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING email_id
        `;
        const sqlParamsEmail: any[] = [ templateId, emailStatus, errorDescription, to, subject, body, currentDate, currentDate ]

        const result: QueryResult<any>  = await pool.query(sqlQueryEmail, sqlParamsEmail);
        const emailId: number = result.rows[0]['email_id'];

        // Prepare response
        const email: Email = {
            emailId: emailId,
            emailTemplateId: templateId,
            emailStatusId: emailStatus,
            errorDescription: errorDescription,
            to: to,
            subject: subject,
            body: body,
            createdAt: currentDate,
            sentAt: currentDate,
        }
        
        res.status(201).json(email);

    } catch (error: any) {
        next(error);
    }

});

// Get email
router.get('/:emailId', async (req: Request, res: Response, next: NextFunction) => {
    
    try{

        const emailId = req.params.emailId;
        if(/^[0-9]*$/.test(emailId) == false) throw new BadRequestError("Email id must be integer");
        const sql: string = `SELECT * FROM dbo.email WHERE email_id = $1`;
        const result: QueryResult<any> = await pool.query(sql, [emailId]);
        if(result.rows.length == 0) throw new NotFoundError(`Email with id = ${emailId} does not exist`);

        // Prepare response
        const email: Email = {
            emailId: result.rows[0]["email_id"],
            emailTemplateId: result.rows[0]["email_template_id"],
            emailStatusId: result.rows[0]["email_status_id"],
            errorDescription: result.rows[0]["error_description"],
            to: result.rows[0]["to"],
            subject: result.rows[0]["subject"],
            body: result.rows[0]["body"],
            createdAt: result.rows[0]["created_at"],
            scheduledAt: result.rows[0]["scheduled_at"],
            sentAt: result.rows[0]["sent_at"],
        }

        res.status(200).json(email)

    } catch (error: any) {
        next(error);
    }

});

// Schedule email
router.post('/schedule', async (req: Request, res: Response, next: NextFunction) => {

    try {

        // Get template
        const templateId: number = req.body.templateId;
        if(!templateId) throw Error("templateId is required")
        const sql: string = "SELECT subject_template, body_template FROM dbo.email_template WHERE email_template_id = $1";
        const template: QueryResult<any> = await pool.query(sql, [templateId]);
        if(template.rows.length == 0) throw new NotFoundError(`Template with id = ${templateId} does not exist`);
        let subjectTemplate: string = template.rows[0]['subject_template'];
        let bodyTemplate: string = template.rows[0]['body_template'];

        // Prepare email
        if(!Array.isArray(req.body.subjectParams)) throw Error("subjectParams must be a list");
        const subject = prepareTemplate(subjectTemplate, req.body.subjectParams);
        if(!Array.isArray(req.body.bodyParams)) throw Error("bodyParams must be a list")
        const body = prepareTemplate(bodyTemplate, req.body.bodyParams);

        const to: string = req.body.to;

        const scheduledAt = new Date(req.body.scheduleAt);
        if (isNaN(scheduledAt.getTime())) throw new BadRequestError("scheduleAt must be valid date")

        // Insert email into DB
        const currentDate = new Date();

        const sqlQueryEmail: string = `
            INSERT INTO dbo.email(email_template_id, email_status_id, \"to\", subject, body, created_at, scheduled_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING email_id
        `;
        const sqlParamsEmail: any[] = [ templateId, 1, to, subject, body, currentDate, scheduledAt ]

        const result: QueryResult<any>  = await pool.query(sqlQueryEmail, sqlParamsEmail);
        const emailId: number = result.rows[0]['email_id'];

        // Prepare response
        const email: Email = {
            emailId: emailId,
            emailTemplateId: templateId,
            emailStatusId: 1,
            to: to,
            subject: subject,
            body: body,
            createdAt: currentDate,
            scheduledAt: scheduledAt,
        }
        
        res.status(201).json(email);

    } catch (error: any) {
        next(error);
    }

});