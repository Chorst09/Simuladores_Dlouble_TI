#!/bin/bash

echo "🧪 Testando cenários de erro na API de propostas..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local description="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${YELLOW}Testando: $description${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:3002$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            "http://localhost:3002$endpoint")
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status correto: $http_code${NC}"
    else
        echo -e "${RED}❌ Status incorreto: esperado $expected_status, recebido $http_code${NC}"
    fi
    
    echo "Resposta: $body"
}

# Verificar se o servidor está rodando
echo "Verificando se o servidor está rodando..."
if ! curl -s http://localhost:3002 > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando. Execute 'npm run dev' primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Servidor está rodando${NC}"

# Teste 1: Requisição sem token de autenticação
test_endpoint "Requisição sem token" "POST" "/api/proposals" '{"test": "data"}' "401"

# Teste 2: Requisição com dados inválidos
test_endpoint "Dados inválidos (sem client_data)" "POST" "/api/proposals" '{"products": []}' "401"

# Teste 3: Requisição com JSON malformado
test_endpoint "JSON malformado" "POST" "/api/proposals" '{"invalid": json}' "400"

# Teste 4: Requisição vazia
test_endpoint "Requisição vazia" "POST" "/api/proposals" '' "400"

# Teste 5: Endpoint inexistente
test_endpoint "Endpoint inexistente" "GET" "/api/proposals/nonexistent" '' "404"

echo -e "\n${GREEN}🎉 Testes de cenários de erro concluídos!${NC}"