'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, AlertCircle, CheckCircle } from 'lucide-react';

interface TestUser {
  id: number;
  nickname: string;
  password: string;
  site_status: string;
}

interface CreateTestUserProps {
  isDarkMode?: boolean;
}

export default function CreateTestUser({ isDarkMode = false }: CreateTestUserProps) {
  const [loading, setLoading] = useState(true);
  const [testUser, setTestUser] = useState<TestUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadTestUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        console.log('[CreateTestUser] Buscando test-user-info...');
        const response = await fetch('http://localhost:3001/api/oauth/mercado-livre/test-user-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        console.log('[CreateTestUser] Response status:', response.status);
        const text = await response.text();
        console.log('[CreateTestUser] Response body:', text);

        if (response.ok) {
          try {
            const data = JSON.parse(text);
            if (data.hasTestUser && data.testUser) {
              setTestUser(data.testUser as TestUser);
              // Apenas log, sem toastr de sucesso
              console.log('[CreateTestUser] Test user carregado:', data.testUser);
            }
          } catch (e) {
            console.error('[CreateTestUser] Erro ao parse JSON:', e);
          }
        } else {
          console.error('[CreateTestUser] Response error:', response.status, text);
        }
      } catch (err) {
        console.error('[CreateTestUser] Erro ao carregar:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTestUser();
  }, []);

  const createTestUser = async () => {
    setLoading(true);
    setError(null);
    setTestUser(null);

    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch('http://localhost:3001/api/oauth/mercado-livre/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Erro ao criar usuário de teste');
      }

      const data = await response.json();
      setTestUser(data.testUser);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const authenticateTestUser = async () => {
    if (!nickname || !password) {
      setError('Por favor, preencha nickname e senha');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch('http://localhost:3001/api/oauth/mercado-livre/authenticate-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Erro ao autenticar usuário de teste');
      }

      const data = await response.json();
      setAuthSuccess(true);
      setNickname('');
      setPassword('');
      
      // Mostrar sucesso por 3 segundos
      setTimeout(() => {
        setShowAuthForm(false);
        setAuthSuccess(false);
        setTestUser(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full">
      {loading && !testUser && (
        <div className={`border rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <p className={isDarkMode ? 'text-blue-200' : 'text-blue-700'}>⏳ Carregando informações do usuário de teste...</p>
        </div>
      )}

      {error && (
        <div className={`border rounded-lg p-4 mb-6 flex gap-3 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>Erro</h3>
            <p className={isDarkMode ? 'text-red-200' : 'text-red-700'}>{error}</p>
          </div>
        </div>
      )}

      {!testUser ? (
        <button
          onClick={createTestUser}
          disabled={loading}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'}`}
        >
          {loading ? 'Criando...' : 'Criar Usuário de Teste'}
        </button>
      ) : (
        <div className={`border rounded-lg p-6 ${isDarkMode ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className={`flex gap-3 mb-6 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">⚠️ IMPORTANTE!</h3>
              <p>
                Salve essas credenciais agora. A senha não pode ser recuperada!
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          {!showAuthForm && !authSuccess && (
            <button
              onClick={() => setShowAuthForm(true)}
              className={`w-full mb-6 font-semibold py-3 px-4 rounded-lg transition-colors text-lg ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              ➜ Usar este usuário para buscas
            </button>
          )}

          <div className="space-y-4">
            {/* ID do Usuário */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ID do Usuário
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUser.id}
                  readOnly
                  className={`flex-1 px-4 py-2 border rounded-lg font-mono text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
                <button
                  onClick={() => copyToClipboard(String(testUser.id), 'id')}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  title="Copiar para área de transferência"
                >
                  <Copy className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
              {copied === 'id' && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Copiado!</p>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Apelido (Nickname)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUser.nickname}
                  readOnly
                  className={`flex-1 px-4 py-2 border rounded-lg font-mono text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
                <button
                  onClick={() => copyToClipboard(testUser.nickname, 'nickname')}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  title="Copiar para área de transferência"
                >
                  <Copy className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
              {copied === 'nickname' && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Copiado!</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Senha (Salve com segurança!)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUser.password}
                  readOnly
                  className={`flex-1 px-4 py-2 border rounded-lg font-mono text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
                <button
                  onClick={() => copyToClipboard(testUser.password, 'password')}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  title="Copiar para área de transferência"
                >
                  <Copy className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
              {copied === 'password' && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Copiado!</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <input
                type="text"
                value={testUser.site_status}
                readOnly
                className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>

          <div className={`mt-6 rounded-lg p-4 text-sm ${isDarkMode ? 'bg-gray-800/50 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'}`}>
            <p className="font-semibold mb-2">Como usar:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use o apelido (nickname) para fazer login no Mercado Livre</li>
              <li>Esta é uma conta de teste isolada do seu perfil principal</li>
              <li>Você pode criar até 10 usuários de teste por conta</li>
              <li>Usuários de teste expiram após 60 dias de inatividade</li>
            </ul>
          </div>

          {authSuccess && (
            <div className={`mt-6 border rounded-lg p-4 flex gap-3 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>✓ Autenticação bem-sucedida!</h3>
                <p className={isDarkMode ? 'text-green-200' : 'text-green-700'}>
                  O usuário de teste foi configurado. Suas buscas agora usarão este usuário.
                </p>
              </div>
            </div>
          )}

          {showAuthForm && (
            <div className={`mt-6 rounded-lg p-4 border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>Configurar Usuário de Teste</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Apelido (Nickname)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={testUser.nickname}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {error && (
                  <div className={`border rounded-lg p-3 flex gap-2 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                    <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={authenticateTestUser}
                    disabled={authLoading}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'}`}
                  >
                    {authLoading ? 'Autenticando...' : 'Autenticar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthForm(false);
                      setError(null);
                    }}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setTestUser(null);
              setError(null);
            }}
            className={`w-full mt-6 font-semibold py-2 px-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Criar outro usuário de teste
          </button>
        </div>
      )}
    </div>
  );
}
