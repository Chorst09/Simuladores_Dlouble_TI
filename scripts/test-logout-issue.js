// Simular o problema de logout automático

// Simular localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Simular fetch
global.fetch = async (url, options = {}) => {
  console.log(`🌐 Fetch: ${options.method || 'GET'} ${url}`);
  
  if (url.includes('/api/auth/login')) {
    // Simular resposta de login bem-sucedido
    return {
      ok: true,
      status: 200,
      json: async () => ({
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTYyMzc3MDgsImV4cCI6MTc1Njg0MjUwOH0.UEEuqwhTpwGKE1rOBhh6K3PhUGzOJ7Rq0EnwCnmAk0I'
      })
    };
  }
  
  if (url.includes('/api/auth/me')) {
    const authHeader = options.headers?.Authorization;
    console.log('   Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token não fornecido' })
      };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Simular verificação de token (simplificada)
    if (token.length < 50) {
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token inválido' })
      };
    }
    
    // Simular resposta bem-sucedida
    return {
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        }
      })
    };
  }
  
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  };
};

// Simular AuthContext
class AuthContextSimulator {
  constructor() {
    this.user = null;
    this.isLoading = true;
    this.callCount = 0;
  }

  async refreshUser() {
    this.callCount++;
    console.log(`\n[AuthContext] refreshUser chamado (${this.callCount}x)`);
    
    try {
      const token = localStorage.getItem('auth-token');
      console.log('[AuthContext] Token encontrado:', !!token);
      
      if (!token) {
        console.log('[AuthContext] Sem token, definindo user como null');
        this.user = null;
        this.isLoading = false;
        return;
      }

      console.log('[AuthContext] Fazendo chamada para /api/auth/me');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[AuthContext] Resposta recebida:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] Usuário carregado:', data.user.name, data.user.role);
        this.user = data.user;
      } else {
        console.log('[AuthContext] Token inválido, removendo...', response.status);
        const errorData = await response.json();
        console.log('[AuthContext] Erro:', errorData.error);
        localStorage.removeItem('auth-token');
        this.user = null;
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao buscar usuário:', error);
      localStorage.removeItem('auth-token');
      this.user = null;
    } finally {
      console.log('[AuthContext] Finalizando refreshUser, setIsLoading(false)');
      this.isLoading = false;
    }
  }

  async login(email, password) {
    console.log('[AuthContext] Login iniciado para:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[AuthContext] Resposta do login:', response.status);

      if (response.ok) {
        console.log('[AuthContext] Login bem-sucedido, salvando token');
        localStorage.setItem('auth-token', data.token);
        
        console.log('[AuthContext] Chamando refreshUser após login');
        await this.refreshUser();
        
        return { success: true };
      } else {
        console.log('[AuthContext] Erro no login:', data.error);
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      console.error('[AuthContext] Erro no login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  async logout() {
    console.log('[AuthContext] Logout iniciado');
    localStorage.removeItem('auth-token');
    this.user = null;
  }
}

async function testLogoutIssue() {
  console.log('🔍 Testando problema de logout automático\n');

  const auth = new AuthContextSimulator();

  // 1. Simular inicialização (useEffect)
  console.log('1. Simulando inicialização do componente...');
  await auth.refreshUser();
  console.log('   Estado após inicialização:', { user: auth.user?.name, isLoading: auth.isLoading });

  // 2. Simular login
  console.log('\n2. Simulando login...');
  const loginResult = await auth.login('test@example.com', 'password');
  console.log('   Resultado do login:', loginResult);
  console.log('   Estado após login:', { user: auth.user?.name, isLoading: auth.isLoading });

  // 3. Simular múltiplas chamadas refreshUser (como se fosse um loop)
  console.log('\n3. Simulando múltiplas chamadas refreshUser...');
  for (let i = 0; i < 3; i++) {
    await auth.refreshUser();
    console.log(`   Após chamada ${i + 1}:`, { user: auth.user?.name, isLoading: auth.isLoading });
  }

  console.log('\n📊 Resumo:');
  console.log('   Total de chamadas refreshUser:', auth.callCount);
  console.log('   Estado final do usuário:', auth.user?.name || 'null');
  console.log('   Token no localStorage:', !!localStorage.getItem('auth-token'));
}

testLogoutIssue();