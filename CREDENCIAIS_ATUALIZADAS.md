# 🔐 Credenciais de Acesso - ATUALIZADAS

## ✅ Usuários Disponíveis (Senhas Funcionais)

### 👤 Mauro (Principal)
- **Email:** mauro@gmail.com
- **Senha:** Comercial2025
- **Papel:** admin
- **Permissões:** Acesso total ao sistema, incluindo área administrativa

### 👨‍💼 Administrador
- **Email:** admin@nextn.com.br
- **Senha:** admin123
- **Papel:** admin
- **Permissões:** Acesso total ao sistema, incluindo área administrativa

### 🎯 Diretor
- **Email:** diretor@nextn.com.br  
- **Senha:** diretor123
- **Papel:** admin (com funcionalidades de diretor)
- **Permissões:** Acesso aos calculadores + funcionalidade de desconto personalizado

### 💼 Vendedor
- **Email:** vendedor@nextn.com.br
- **Senha:** vendedor123
- **Papel:** user
- **Permissões:** Acesso aos calculadores (sem desconto personalizado)

## 🌐 Como Usar

1. **Servidor rodando na porta**: 3000 (confirmado)
2. **Acessar a aplicação**: `http://localhost:3000/login`
3. **Fazer login**: Use mauro@gmail.com / Comercial2025
4. **Navegar**: Após o login, você será redirecionado automaticamente

## 🔧 Correções Aplicadas

- ✅ **Hashes de senha corrigidos** - Todos os usuários agora têm senhas funcionais
- ✅ **API de login funcionando** - Testado e validado
- ✅ **Banco de dados atualizado** - Senhas regeneradas com bcrypt correto

## 🧪 Teste das Credenciais

Para testar se as credenciais estão funcionando:

```bash
# Verificar porta do servidor nos logs
tail server.log

# Testar login via API (substitua [PORTA] pela porta correta)
curl -X POST http://localhost:[PORTA]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nextn.com.br","password":"admin123"}'
```

## ⚠️ Importante

- **Porta dinâmica**: O Next.js escolhe automaticamente uma porta disponível
- **Verificar logs**: Sempre verifique `server.log` ou o terminal para ver a porta correta
- **Senhas atualizadas**: As senhas foram regeneradas e agora funcionam corretamente

---

**Status**: ✅ **FUNCIONANDO**  
**Última atualização**: 26 de Agosto de 2025  
**Problema resolvido**: Hashes de senha incorretos corrigidos