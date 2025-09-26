INSERT INTO tenants (name, slug) VALUES ('Unimed Bots', 'unimed');

INSERT INTO users (tenant_id, name, email, role)
VALUES (1, 'Kelven Silva', 'kelven@unimed.local', 'admin');

INSERT INTO contacts (tenant_id, name, phone, channel, consent_optin, tags)
VALUES
(1, 'Cliente 1', '+5599999999999', 'whatsapp', 1, JSON_ARRAY('lead','SP')),
(1, 'Cliente 2', '+5588888888888', 'whatsapp', 1, JSON_ARRAY('lead','RJ'));

INSERT INTO templates (tenant_id, channel, name, body, variables, approved, category)
VALUES
(1,'whatsapp','boas_vindas','Olá {{nome}}, tudo bem? Podemos te enviar novidades?', JSON_ARRAY('nome'), 1, 'marketing');
