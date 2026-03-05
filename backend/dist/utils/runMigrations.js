import db from '../config/database.js';
/**
 * Executa migrações do banco de dados
 * Cria/atualiza colunas necessárias
 */
export async function runMigrations() {
    try { // Verificar se coluna já existe antes de adicionar
        const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = ?
    `;
        // Adicionar mercado_livre_token
        try {
            const [tokenExists] = await db.query(checkColumnQuery, ['mercado_livre_token']);
            if (!tokenExists || tokenExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_token VARCHAR(1000) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_token:', error.message);
        }
        // Adicionar mercado_livre_user_id
        try {
            const [userIdExists] = await db.query(checkColumnQuery, ['mercado_livre_user_id']);
            if (!userIdExists || userIdExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_user_id VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_user_id:', error.message);
        }
        // Adicionar mercado_livre_refresh_token
        try {
            const [refreshExists] = await db.query(checkColumnQuery, ['mercado_livre_refresh_token']);
            if (!refreshExists || refreshExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_refresh_token VARCHAR(1000) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_refresh_token:', error.message);
        }
        // Adicionar mercado_livre_token_expires_at
        try {
            const [expiresExists] = await db.query(checkColumnQuery, ['mercado_livre_token_expires_at']);
            if (!expiresExists || expiresExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_token_expires_at TIMESTAMP NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_token_expires_at:', error.message);
        }
        // Adicionar mercado_livre_test_token (para usuários de teste)
        try {
            const [testTokenExists] = await db.query(checkColumnQuery, ['mercado_livre_test_token']);
            if (!testTokenExists || testTokenExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_test_token VARCHAR(1000) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_test_token:', error.message);
        }
        // Adicionar mercado_livre_test_user_id
        try {
            const [testUserIdExists] = await db.query(checkColumnQuery, ['mercado_livre_test_user_id']);
            if (!testUserIdExists || testUserIdExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_test_user_id VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_test_user_id:', error.message);
        }
        // Adicionar mercado_livre_test_nickname (centralizado)
        try {
            const [testNicknameExists] = await db.query(checkColumnQuery, ['mercado_livre_test_nickname']);
            if (!testNicknameExists || testNicknameExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_test_nickname VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_test_nickname:', error.message);
        }
        // Adicionar mercado_livre_test_password (centralizado)
        try {
            const [testPasswordExists] = await db.query(checkColumnQuery, ['mercado_livre_test_password']);
            if (!testPasswordExists || testPasswordExists.length === 0) {
                await db.query(`
          ALTER TABLE users 
          ADD COLUMN mercado_livre_test_password VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            console.error('[Migration] Erro ao verificar/adicionar mercado_livre_test_password:', error.message);
        }
        // Adicionar colunas para test users na tabela oauth_tokens
        const checkColumnQueryOAuth = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'oauth_tokens' AND COLUMN_NAME = ?
    `;
        // Adicionar test_user_id (centralizado no oauth_tokens)
        try {
            const [testUserIdOAuthExists] = await db.query(checkColumnQueryOAuth, ['test_user_id']);
            if (!testUserIdOAuthExists || testUserIdOAuthExists.length === 0) {
                await db.query(`
          ALTER TABLE oauth_tokens 
          ADD COLUMN test_user_id VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            if (error.code !== 'ER_BAD_FIELD_ERROR' && !error.message.includes('already exists')) {
                console.error('[Migration] Erro ao verificar/adicionar oauth_tokens.test_user_id:', error.message);
            }
        }
        // Adicionar test_nickname (centralizado no oauth_tokens)
        try {
            const [testNicknameOAuthExists] = await db.query(checkColumnQueryOAuth, ['test_nickname']);
            if (!testNicknameOAuthExists || testNicknameOAuthExists.length === 0) {
                await db.query(`
          ALTER TABLE oauth_tokens 
          ADD COLUMN test_nickname VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            if (error.code !== 'ER_BAD_FIELD_ERROR' && !error.message.includes('already exists')) {
                console.error('[Migration] Erro ao verificar/adicionar oauth_tokens.test_nickname:', error.message);
            }
        }
        // Adicionar test_password (centralizado no oauth_tokens)
        try {
            const [testPasswordOAuthExists] = await db.query(checkColumnQueryOAuth, ['test_password']);
            if (!testPasswordOAuthExists || testPasswordOAuthExists.length === 0) {
                await db.query(`
          ALTER TABLE oauth_tokens 
          ADD COLUMN test_password VARCHAR(255) NULL
        `);
            }
            else { }
        }
        catch (error) {
            if (error.code !== 'ER_BAD_FIELD_ERROR' && !error.message.includes('already exists')) {
                console.error('[Migration] Erro ao verificar/adicionar oauth_tokens.test_password:', error.message);
            }
        }
    }
    catch (error) {
        console.error('[Migration] Erro crítico:', error);
    }
}
//# sourceMappingURL=runMigrations.js.map