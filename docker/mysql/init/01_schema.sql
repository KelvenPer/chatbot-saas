-- Charset & timezone
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = 'America/Sao_Paulo';

CREATE TABLE tenants (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  role ENUM('admin','operator','analyst') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_tenant_email (tenant_id, email),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE contacts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160),
  phone VARCHAR(32) NOT NULL,              -- E.164 (+55...)
  channel ENUM('whatsapp','telegram','sms','email') NOT NULL DEFAULT 'whatsapp',
  email VARCHAR(160),
  tags JSON,
  consent_optin TINYINT(1) NOT NULL DEFAULT 0,
  timezone VARCHAR(64) DEFAULT 'America/Sao_Paulo',
  origin VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_contact (tenant_id, phone, channel),
  KEY idx_contacts_tags (tags(1024)),
  CONSTRAINT fk_contacts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE segments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  filter_json JSON NOT NULL,               -- critérios dinâmicos
  estimated_size INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_segment_name (tenant_id, name),
  CONSTRAINT fk_segments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE templates (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('whatsapp','telegram','sms','email') NOT NULL,
  name VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,                      -- pode conter {{variaveis}}
  variables JSON,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  category ENUM('marketing','utility','auth','otp') DEFAULT 'marketing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_template (tenant_id, channel, name),
  CONSTRAINT fk_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE campaigns (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  owner_user_id BIGINT UNSIGNED,
  name VARCHAR(160) NOT NULL,
  channel ENUM('whatsapp','telegram','sms','email') NOT NULL,
  template_id BIGINT UNSIGNED,
  schedule_at DATETIME NULL,
  status ENUM('draft','queued','running','paused','finished','failed') NOT NULL DEFAULT 'draft',
  ab_test JSON NULL,                       -- variações (copy/horário/CTA)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_campaigns_status (status),
  CONSTRAINT fk_campaigns_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_campaigns_owner FOREIGN KEY (owner_user_id) REFERENCES users(id),
  CONSTRAINT fk_campaigns_template FOREIGN KEY (template_id) REFERENCES templates(id)
) ENGINE=InnoDB;

CREATE TABLE campaign_targets (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  campaign_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  status ENUM('queued','sent','delivered','read','replied','failed') NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(191),
  attempt TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_target (campaign_id, contact_id),
  KEY idx_targets_status (status),
  CONSTRAINT fk_targets_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  CONSTRAINT fk_targets_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
) ENGINE=InnoDB;

CREATE TABLE conversations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('whatsapp','telegram','sms','email') NOT NULL,
  state ENUM('LEAD_NOVO','QUALIFICANDO','AGENDADO','CONVERTIDO','PAUSADO') NOT NULL DEFAULT 'LEAD_NOVO',
  last_message_at DATETIME NULL,
  owner_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_conv_contact (contact_id),
  KEY idx_conv_state (state),
  CONSTRAINT fk_conv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_conv_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
  CONSTRAINT fk_conv_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE media (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  type ENUM('image','audio','video','document') NOT NULL,
  original_name VARCHAR(255),
  s3_key VARCHAR(512) NOT NULL,
  url_external VARCHAR(512),
  size_bytes BIGINT UNSIGNED,
  hash_sha256 CHAR(64),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_media_type (type),
  CONSTRAINT fk_media_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  direction ENUM('out','in') NOT NULL,
  type ENUM('text','image','audio','video','document') NOT NULL DEFAULT 'text',
  body TEXT NULL,                          -- para texto/legenda
  media_id BIGINT UNSIGNED NULL,
  provider_message_id VARCHAR(191),
  status ENUM('queued','sent','delivered','read','failed') DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_msg_conv (conversation_id, created_at),
  KEY idx_msg_status (status),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  CONSTRAINT fk_msg_media FOREIGN KEY (media_id) REFERENCES media(id)
) ENGINE=InnoDB;

CREATE TABLE quick_replies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  channel ENUM('whatsapp','telegram','sms','email') NULL,
  triggers JSON,                           -- palavras/regex/intent
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qr_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE rules (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  condition_json JSON NOT NULL,            -- {regex,intent,horario,etapa}
  action_json JSON NOT NULL,               -- {enviar_template,marcar_tag,handoff}
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rules_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;

CREATE TABLE events_audit (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_entity (entity, entity_id, created_at),
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB;
