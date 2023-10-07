export interface Email {
    emailId: number;
    emailTemplateId: number;
    emailStatusId: number;
    errorDescription?: string | null;
    to: string;
    subject: string;
    body: string;
    createdAt: Date;
    scheduledAt?: Date | null;
    sentAt?: Date | null;
}
