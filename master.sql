DROP DATABASE IF EXISTS email_template;
CREATE DATABASE email_template;

DROP SCHEMA IF EXISTS dbo;
CREATE SCHEMA dbo;

DROP TABLE IF EXISTS dbo.email_template;
CREATE TABLE dbo.email_template(
	email_template_id SERIAL PRIMARY KEY,
	description VARCHAR ( 50 ),
	subject_template VARCHAR ( 100 ),
	body_template VARCHAR ( 2000 )
)

