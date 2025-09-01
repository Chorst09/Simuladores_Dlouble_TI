#!/bin/bash

echo "🧪 Testando conexão com o banco de dados..."

# Verificar se o container está rodando
if ! docker ps | grep -q "prevendassemlogin_simuladores_final-main-db-1"; then
    echo "❌ Container do banco não está rodando!"
    echo "Execute: docker-compose up -d db"
    exit 1
fi

# Testar conexão e verificar se as colunas existem
echo "🔍 Verificando estrutura da tabela proposals..."

docker exec prevendassemlogin_simuladores_final-main-db-1 psql -U postgres -d nextn_db -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proposals' 
ORDER BY ordinal_position;
"

echo ""
echo "✅ Teste de banco concluído!"