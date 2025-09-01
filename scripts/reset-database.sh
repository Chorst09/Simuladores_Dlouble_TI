#!/bin/bash

echo "🗄️ Resetando banco de dados..."

# Parar containers
echo "⏹️ Parando containers..."
docker-compose down

# Remover volume do banco (isso apaga todos os dados!)
echo "🗑️ Removendo dados antigos do banco..."
docker volume rm $(docker-compose config --volumes) 2>/dev/null || true

# Iniciar apenas o banco
echo "🚀 Iniciando banco de dados..."
docker-compose up -d db

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco estar pronto..."
sleep 15

echo "✅ Banco de dados resetado com sucesso!"
echo ""
echo "O banco foi recriado com as novas colunas:"
echo "  - director_discount"
echo "  - negotiation_rounds" 
echo "  - current_round"
echo "  - proposal_number"
echo ""
echo "Para iniciar a aplicação:"
echo "  npm run dev"