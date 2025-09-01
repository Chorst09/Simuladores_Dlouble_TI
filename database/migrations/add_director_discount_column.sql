-- Migração para adicionar coluna director_discount à tabela proposals
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar coluna director_discount à tabela proposals
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS director_discount JSONB;

-- Comentário para documentar o propósito da coluna
COMMENT ON COLUMN proposals.director_discount IS 'Dados do desconto aplicado por diretor, incluindo percentual, motivo, quem aplicou e quando';

-- Índice para melhorar performance em consultas que filtram por desconto de diretor
CREATE INDEX IF NOT EXISTS idx_proposals_director_discount 
ON proposals USING GIN (director_discount) 
WHERE director_discount IS NOT NULL;