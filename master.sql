DROP TABLE IF EXISTS dbo.email_body_param;
DROP TABLE IF EXISTS dbo.email_subject_param;
DROP TABLE IF EXISTS dbo.email;
DROP TABLE IF EXISTS dbo.email_status;
DROP TABLE IF EXISTS dbo.email_template;

DROP SCHEMA IF EXISTS dbo;

DROP DATABASE IF EXISTS email_template;

--

CREATE DATABASE email_template;

CREATE SCHEMA dbo;

CREATE TABLE dbo.email_template(
	email_template_id SERIAL PRIMARY KEY,
	description VARCHAR ( 50 ),
	subject_template VARCHAR ( 100 ),
	body_template VARCHAR ( 2000 )
);

CREATE TABLE dbo.email_status(
	email_status_id SMALLINT PRIMARY KEY,
	email_status_name VARCHAR ( 20 )
);

INSERT INTO dbo.email_status(email_status_id, email_status_name) VALUES 
(1, 'FOR SENDING'),
(2, 'SENT'),
(3, 'ERROR');

CREATE TABLE dbo.email(
	email_id SERIAL PRIMARY KEY,
	email_template_id SERIAL REFERENCES dbo.email_template ON DELETE RESTRICT,
	email_status_id SMALLINT REFERENCES dbo.email_status ON DELETE RESTRICT,
	error_description VARCHAR ( 2000 ),
	"to" VARCHAR ( 2000 ),
	subject VARCHAR ( 200 ),
	body VARCHAR ( 4000 ),
	created_at TIMESTAMP,
	scheduled_at TIMESTAMP,
	sent_at TIMESTAMP
);


