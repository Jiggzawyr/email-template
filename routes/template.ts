import express, { NextFunction, Request, Response } from 'express';
import { pool } from '../configs/db';
import { EmailTemplate } from '../models/emailTemplate';
import { QueryResult } from 'pg';
import { BadRequestError } from '../models/badRequestError';
import { NotFoundError } from '../models/notFoundError';

const router = express.Router();

module.exports = router;

// Get all templates
router.get('/', async (req: Request, res: Response) => {
    const result: QueryResult<any> = await pool.query("SELECT * FROM dbo.email_template");
    res.status(200).json(result.rows)
})

// Get template
router.get('/:templateId', async (req: Request, res: Response, next: NextFunction) => {
    
    try{

        const templateId = req.params.templateId;
        if(/^[0-9]*$/.test(templateId) == false) throw new BadRequestError("Template id must be integer");
        const sql: string = "SELECT * FROM dbo.email_template WHERE email_template_id = $1";
        const result: QueryResult<any> = await pool.query(sql, [templateId]);
        if(result.rows.length == 0) throw new NotFoundError(`Template with id = ${templateId} does not exist`);
        res.status(200).json(result.rows[0])

    } catch (error: any) {
        next(error);
    }

})

// Insert new template
router.post('/', async (req: Request, res: Response, next: NextFunction) => {

    try {

        const description: string = req.body.description;
        if(!description) throw new BadRequestError("description cannot be empty");
        if(description.length > 50) throw new BadRequestError("description cannot be longer than 50 characters");

        const subjectTemplate: string = req.body.subjectTemplate;
        if(!subjectTemplate) throw new BadRequestError("subjectTemplate cannot be empty");
        if(subjectTemplate.length > 50) throw new BadRequestError("subjectTemplate cannot be longer than 100 characters");

        const bodyTemplate: string = req.body.bodyTemplate;
        if(!bodyTemplate) throw new BadRequestError("bodyTemplate cannot be empty");
        if(bodyTemplate.length > 50) throw new BadRequestError("bodyTemplate cannot be longer than 2000 characters");

        const sql: string = "INSERT INTO dbo.email_template(description, subject_template, body_template) VALUES ($1, $2, $3) RETURNING email_template_id;"
        const result: QueryResult<any> = await pool.query(sql,[ description, subjectTemplate, bodyTemplate ]);
        const emailTemplateId: number = result.rows[0]['email_template_id'];
        const emailTemplate: EmailTemplate = {
            emailTemplateId: emailTemplateId,
            description: description,
            subjectTemplate: subjectTemplate,
            bodyTemplate: bodyTemplate,
        }
        
        res.status(201).json(emailTemplate);

    } catch (error: any) {
        next(error);
    }

});