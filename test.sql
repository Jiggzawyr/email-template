TRUNCATE dbo.email_template;

INSERT INTO dbo.email_template(description, subject_template, body_template)
VALUES 
('Test template 1', 'Subject with param: $PARAM1$', 'Body with params: $PARAM1$, $PARAM2$');