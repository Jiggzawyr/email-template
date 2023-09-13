import express, { Request, Response } from 'express';
import { pool } from '../db';
import { EmailTemplate } from '../models/emailTemplate';
import { QueryResult } from 'pg';
import { Exception } from '../models/exception';

const router = express.Router();

module.exports = router;

// Get all templates
router.get('/', async (req: Request, res: Response) => {
    const result: QueryResult<any> = await pool.query("SELECT * FROM dbo.email_template");
    res.status(200).json(result.rows)
})

// Insert new template
router.post('/', async (req: Request, res: Response) => {
    try {
        const description: string = req.body.description;
        if(!description) throw Error("description cannot be empty");
        if(description.length > 50) throw Error("description cannot be longer than 50 characters");
        const subjectTemplate: string = req.body.subjectTemplate;
        if(!subjectTemplate) throw Error("subjectTemplate cannot be empty");
        if(subjectTemplate.length > 50) throw Error("subjectTemplate cannot be longer than 100 characters");
        const bodyTemplate: string = req.body.bodyTemplate;
        if(!bodyTemplate) throw Error("bodyTemplate cannot be empty");
        if(bodyTemplate.length > 50) throw Error("bodyTemplate cannot be longer than 2000 characters");
        const result: QueryResult<any> = await pool.query(
            "INSERT INTO dbo.email_template(description, subject_template, body_template) VALUES ($1, $2, $3) RETURNING email_template_id; ",
            [ description, subjectTemplate, bodyTemplate ]
        );
        const emailTemplateId: number = result.rows[0]['email_template_id'];
        const emailTemplate: EmailTemplate = {
            emailTemplateId: emailTemplateId,
            description: description,
            subjectTemplate: subjectTemplate,
            bodyTemplate: bodyTemplate,
        }
        res.status(201).json(emailTemplate);
    } catch (error: any) {
        const exception: Exception = {
            code: 400,
            status: "BAD REQUEST",
            message: error.message,
        }
        res.status(400).json(exception);
    }
});