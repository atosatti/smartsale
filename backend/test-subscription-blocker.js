/**
 * Teste do Middleware de Bloqueio de Assinatura Expirada
 * Verifica se buscas são bloqueadas após current_period_end
 */

const BASE_URL = 'http://localhost:3001/api';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Token JWT do usuário 3 (para testes)
 * NOTA: Usar um token válido gerado pelo /api/auth/login
 */
let USER3_TOKEN = '';

async function login() {
  console.log('\n🔐 Fazendo login como user 3...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user3@teste.com',
        password: 'User3@123',
      }),
    });

    if (!response.ok) throw new Error(`Login failed: ${response.status}`);
    const data = await response.json();
    USER3_TOKEN = data.token;
    console.log('✅ Login bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.message);
    return false;
  }
}

async function testSearchWithActive() {
  console.log('\n📍 Teste 1: Busca com assinatura ATIVA (deve permitir)');
  try {
    const response = await fetch(`${BASE_URL}/products/search?query=notebook`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${USER3_TOKEN}`,
      },
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ PASSOU - Busca permitida com assinatura ativa');
      testResults.passed++;
    } else if (response.status === 403) {
      const error = await response.json();
      console.log(`❌ FALHOU - Recebeu bloqueio: ${error.message}`);
      testResults.failed++;
    } else {
      console.log(`⚠️  Status inesperado: ${response.status}`);
      testResults.failed++;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    testResults.failed++;
  }
}

async function testSearchExpired(futureDate) {
  console.log(`\n📍 Teste 2: Busca com assinatura EXPIRADA (must block)`);
  console.log(`   Data de expiração: ${futureDate}`);
  
  try {
    // Aqui precisamos simular uma assinatura com data no passado
    // Para isso, vamos atualizar o DB
    const response = await fetch(`${BASE_URL}/admin/test-expire-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${USER3_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        futureDate: futureDate,
      }),
    });

    if (response.ok) {
      console.log('   Assinatura atualizada para expirada');
      
      // Agora testa a busca
      const searchResponse = await fetch(`${BASE_URL}/products/search?query=notebook`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${USER3_TOKEN}`,
        },
      });

      console.log(`   Status da busca: ${searchResponse.status}`);
      
      if (searchResponse.status === 403) {
        const error = await searchResponse.json();
        console.log(`✅ PASSOU - Acesso bloqueado: ${error.message}`);
        console.log(`   Mensagem: ${error.message}`);
        testResults.passed++;
      } else if (searchResponse.status === 200) {
        console.log('❌ FALHOU - Busca foi permitida mesmo com assinatura expirada!');
        testResults.failed++;
      } else {
        console.log(`⚠️  Status inesperado: ${searchResponse.status}`);
        testResults.failed++;
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    testResults.failed++;
  }
}

async function testMercadoLivreSearchExpired() {
  console.log(`\n📍 Teste 3: Busca Mercado Livre com assinatura EXPIRADA (must block)`);
  
  try {
    const response = await fetch(`${BASE_URL}/mercado-livre/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${USER3_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'notebook',
        category: 'computação',
      }),
    });

    console.log(`   Status da busca: ${response.status}`);
    
    if (response.status === 403) {
      const error = await response.json();
      console.log(`✅ PASSOU - Acesso bloqueado: ${error.message}`);
      testResults.passed++;
    } else if (response.status === 200) {
      console.log('❌ FALHOU - Busca Mercado Livre foi permitida mesmo com assinatura expirada!');
      testResults.failed++;
    } else {
      console.log(`⚠️  Status inesperado: ${response.status}`);
      testResults.failed++;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    testResults.failed++;
  }
}

async function run() {
  console.log('=================================================');
  console.log('🧪 Teste do Middleware de Bloqueio de Assinatura');
  console.log('=================================================');

  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('\n❌ Não foi possível fazer login. Aborte o teste.');
    process.exit(1);
  }

  // Criar data no passado (30 dias atrás)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 30);
  
  console.log(`\n📅 Data para teste de expiração: ${pastDate.toISOString()}`);

  // Executar testes
  await testSearchWithActive();
  await testSearchExpired(pastDate.toISOString());
  await testMercadoLivreSearchExpired();

  // Relatório final
  console.log('\n=================================================');
  console.log('📊 Resultado dos Testes:');
  console.log(`   ✅ Passou: ${testResults.passed}`);
  console.log(`   ❌ Falhou: ${testResults.failed}`);
  console.log('=================================================\n');

  process.exit(testResults.failed === 0 ? 0 : 1);
}

run();
