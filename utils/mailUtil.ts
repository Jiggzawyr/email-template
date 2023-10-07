import { QueryResult } from "pg";
import { pool } from "../configs/db";
import { Email } from "../models/email";
import { transporter } from "../configs/smtp";

const env = process.env;

export function prepareTemplate(template: string, params: any[]): string {
    params.forEach((param: { name: string, value: string}) => {
        if(!param.name) throw Error("template param must have a name")
        if(!param.value) throw Error("template param must have a value")
        template = template.replace('$' + param.name + '$', param.value);
    });
    return template;
};

export async function sendScheduledMails(){

    console.log("*****Send Scheduled Mails - START*****");

    try {

        const mailsPerCycle: number = parseInt(env.CRON_MAILS_PER_CYCLE!);
        let cnt: number = 0;
    
        while( cnt < mailsPerCycle){
    
            console.log("cnt: " + cnt);

            // Get scheduled email
            const sql: string = " \
                SELECT * \
                FROM dbo.email \
                WHERE email_status_id = 1 AND scheduled_at < NOW() \
                ORDER BY scheduled_at ASC, email_id ASC \
                LIMIT 1 \
            ";
            const result: QueryResult<any> = await pool.query(sql);
            if(result.rows.length == 0) {
                console.log("NO SCHEDULED MAILS FOUND");
                break;
            };
            
            // Prepare email
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

            // Send email
            let mailOptions = {
                from: 'emailtemplate@nookcrew.com',
                to: email.to,
                subject: email.subject,
                text: email.body,
            };
    
            try {
                await transporter.sendMail(mailOptions);
                email.emailStatusId = 2; // 2 - SENT
                email.errorDescription = null;
                email.sentAt = new Date();
                console.log("MAIL SENT")
            } catch (error: any) {
                email.emailStatusId = 3; // 3 - ERROR
                email.errorDescription = error.message;
                email.sentAt = null;
                console.log("ERROR SENDING MAIL")
            }
    
            // Update email in DB
            const sqlUpdate: string = `
                UPDATE dbo.email 
                SET email_status_id = $1, error_description = $2, sent_at = $3
                WHERE email_id = $4
            `;
            const sqlParams: any[] = [ email.emailStatusId, email.errorDescription, email.sentAt, email.emailId ];
            await pool.query(sqlUpdate, sqlParams);
    
            cnt++;
        }

    } catch (error: any) {
        console.log(error.message)
    }

    console.log("*****Send Scheduled Mails - END*****");
}