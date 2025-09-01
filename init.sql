-- Criação das tabelas para o sistema de usuários

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões (opcional, para controle de sessões)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);

-- Tabela para tokens de redefinição de senha
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE UNIQUE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

-- Inserir usuários padrão
-- Admin (senha: admin123)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@nextn.com.br', 
    '$2b$10$EHkjDNlQFxKYx/Ljczq1u.AEeEU/TnioOG9er16dBQjGKmeErktxi', 
    'Administrador', 
    'admin'
);

-- Diretor (senha: diretor123)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'diretor@nextn.com.br', 
    '$2b$10$Jy6/nt4px.wGum04FZQXTe5AjH4uYaH6udWz6BeUClHpOJ79Oqoqm', 
    'Diretor', 
    'admin'
);

-- Vendedor (senha: vendedor123)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'vendedor@nextn.com.br', 
    '$2b$10$z5niqB0EMrV1xnA1EnLLsOcPy5wcDQcSC/XDzOQCjzU2Fye/uN2Zy', 
    'Vendedor', 
    'user'
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de configurações do sistema
CREATE TABLE settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Meu App NextN'),
('maintenance_mode', 'false');

-- Trigger para a tabela de configurações
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de propostas
DROP TABLE IF EXISTS proposals;
CREATE TABLE proposals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_data JSONB NOT NULL,
    account_manager_data JSONB NOT NULL,
    products JSONB NOT NULL,
    total_setup NUMERIC(10, 2) NOT NULL,
    total_monthly NUMERIC(10, 2) NOT NULL,
    director_discount JSONB,
    negotiation_rounds JSONB DEFAULT '[]'::jsonb,
    current_round INTEGER DEFAULT 1,
    proposal_number TEXT,
    status VARCHAR(50) DEFAULT 'Salva',
    type VARCHAR(50) DEFAULT 'GENERAL',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela de propostas
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_type ON proposals(type);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_director_discount 
ON proposals USING GIN (director_discount) 
WHERE director_discount IS NOT NULL;

-- Trigger para a tabela de propostas
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();