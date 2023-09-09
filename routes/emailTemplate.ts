import express, { Request, Response } from 'express';
import { pool } from '../db';
import { EmailTemplate } from '../models/emailTemplate';

const router = express.Router();

module.exports = router;

// Get all templates
router.get('/', async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM dbo.email_template");
    res.status(200).json(result.rows)
})

// Insert new template
router.post('/', async (req: Request, res: Response) => {
    let emailTemplate: EmailTemplate = req.body;
    const result = await pool.query(
        "INSERT INTO dbo.email_template(description, subject_template, body_template) VALUES ($1, $2, $3) RETURNING email_template_id; ",
        [ emailTemplate.description, emailTemplate.subjectTemplate, emailTemplate.bodyTemplate ]
    );
    emailTemplate.emailTemplateId = result.rows[0]['email_template_id'];
    res.status(201).json(emailTemplate);
})