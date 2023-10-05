export interface Email {
    emailId: number;
    emailTemplateId: number;
    emailStatusId: number;
    errorDescription?: string;
    to: string;
    subject: string;
    body: string;
    createdAt: Date;
    scheduledAt?: Date;
    sentAt?: Date;
}
