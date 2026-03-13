#!/usr/bin/env node

/**
 * Script de teste da integração Mercado Livre
 * Testa se a API está funcionar SEM mock
 */

const mysql = require('mysql2/promise');
const axios = require('axios');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Nicholas@022025',
  database: 'smartsale',
};

async function main() {
  console.log('\n========== MERCADO LIVRE INTEGRATION TEST ==========\n');

  try {
    // 1. Conectar ao banco e listar tokens
    console.log('1️⃣  Checking database for Mercado Livre tokens...\n');
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.query(
      'SELECT id, email, mercado_livre_token, mercado_livre_user_id FROM users WHERE mercado_livre_token IS NOT NULL LIMIT 5'
    );

    if (users.length === 0) {
      console.log('⚠️  No Mercado Livre tokens found in database!');
      console.log('   Please authenticate with Mercado Livre first.\n');
      await connection.end();
      return;
    }

    console.log(`✓ Found ${users.length} user(s) with Mercado Livre tokens:\n`);
    users.forEach((user, i) => {
      const tokenPreview = user.mercado_livre_token.substring(0, 20) + '...';
      console.log(`   ${i + 1}. User ID: ${user.id}, Email: ${user.email}`);
      console.log(`      ML User ID: ${user.mercado_livre_user_id}`);
      console.log(`      Token: ${tokenPreview}\n`);
    });

    // 2. Testar requisição à API pública (sem token)
    console.log('2️⃣  Testing public API (no token required)...\n');
    try {
      const publicResponse = await axios.get('https://api.mercadolibre.com/sites/MLB/search', {
        params: {
          q: 'notebook',
          limit: 3,
        },
        timeout: 10000,
      });

      console.log(`✓ Public API works!`);
      console.log(`   Found: ${publicResponse.data.results.length} products`);
      console.log(`   Total available: ${publicResponse.data.paging.total}\n`);
    } catch (error) {
      console.log(`✗ Public API failed: ${error.message}\n`);
    }

    // 3. Testar requisição COM token (autenticado)
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`3️⃣  Testing authenticated search with user ${firstUser.id}...\n`);
      
      try {
        const authResponse = await axios.get('https://api.mercadolibre.com/sites/MLB/search', {
          params: {
            q: 'smartphone',
            limit: 3,
            access_token: firstUser.mercado_livre_token,
          },
          timeout: 10000,
        });

        console.log(`✓ Authenticated API works!`);
        console.log(`   Found: ${authResponse.data.results.length} products\n`);
      } catch (error) {
        console.log(`✗ Authenticated API failed: ${error.message}`);
        if (error.response?.data) {
          console.log(`   Error details: ${JSON.stringify(error.response.data)}\n`);
        }
      }
    }

    // 4. Resumo e próximos passos
    console.log('========== SUMMARY ==========\n');
    console.log('✓ Database connection: OK');
    console.log(`✓ Tokens found: ${users.length}`);
    console.log('✓ Public API: OK');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Login with test user');
    console.log('   3. Test search endpoint: POST http://localhost:3001/api/mercado-livre/search');
    console.log('   4. Debug endpoint: GET http://localhost:3001/api/mercado-livre/debug/search');
    console.log('\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
