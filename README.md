# Email Template

This project that allows you to create email templates which you can use for sending emails.

## Description

Email Template allows you to create email templates with parameters.
Templates can be used to send emails where parameters are replaced with actual values.
All templates and emails are stored and can be viewed afterwards.

## Getting Started

### Installing

* Clone this repository
* Add .env file in project root directory with following content (use your parameters for DB and SMTP)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_NAME=email_template

SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=user.mailgun.org
SMTP_PASSWORD=password

APP_PORT=8080
```

* Create database using `master.sql`

### Executing program

* Run command `npm install`
* Run command `npm run dev`
* Import `Email Template.postman_collection.json` file into Postman