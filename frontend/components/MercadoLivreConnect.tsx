import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MercadoLivreConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [mlUsername, setMlUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    checkMercadoLivreStatus();
    checkCallbackParams();
  }, []);

  const checkMercadoLivreStatus = async () => {
    try {
      // Construir URL do backend corretamente
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const backendUrl = apiUrl.startsWith('http') 
        ? apiUrl.replace('/api', '') 
        : typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.host}`
          : 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/oauth/mercado-livre/status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('ml_user') : null;
        setIsConnected(data.connected);
        setMlUsername(data.connected ? (data.mlUserId || storedUser) : null);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCallbackParams = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('ml_token');
    const user = params.get('ml_user');
    const error = params.get('error');

    if (error) {
      setOauthError('Erro ao conectar com Mercado Livre. Verifique suas credenciais OAuth.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token && user) {
      localStorage.setItem('ml_token', token);
      localStorage.setItem('ml_user', user);
      setIsConnected(true);
      setMlUsername(user);
      
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleConnect = () => {
    // Construir URL do backend corretamente
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const backendUrl = apiUrl.startsWith('http') 
      ? apiUrl.replace('/api', '') 
      : typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3001';
    
    console.log('[OAuth Debug] Backend URL:', backendUrl);
    console.log('[OAuth Debug] Redirecting to:', `${backendUrl}/api/oauth/mercado-livre/authorize`);
    
    window.location.href = `${backendUrl}/api/oauth/mercado-livre/authorize`;
  };

  const handleDisconnect = async () => {
    try {
      // Construir URL do backend corretamente
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const backendUrl = apiUrl.startsWith('http') 
        ? apiUrl.replace('/api', '') 
        : typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.host}`
          : 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/oauth/mercado-livre/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        localStorage.removeItem('ml_token');
        localStorage.removeItem('ml_user');
        setIsConnected(false);
        setMlUsername(null);
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  if (loading) {
    return <div>Verificando conexão...</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔗 Integração com Mercado Livre
      </h3>

      {oauthError && (
        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm">
            ❌ {oauthError}
          </p>
          <p className="text-red-700 dark:text-red-300 text-xs mt-2">
            Para usar OAuth, registre sua aplicação em: <a href="https://developers.mercadolibre.com.br/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">developers.mercadolibre.com.br</a>
          </p>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✅ Conectado como: <strong>{mlUsername}</strong>
            </p>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Desconectar do Mercado Livre
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">
              ℹ️ Status: Usando Dados Mock
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              As buscas de produtos estão usando dados simulados para teste. 
              <br />
              Para conectar com sua conta do Mercado Livre, registre uma aplicação OAuth em:
              <br />
              <a href="https://developers.mercadolibre.com.br/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                developers.mercadolibre.com.br
              </a>
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Registre uma aplicação OAuth no Mercado Livre para ativar"
          >
            Conectar com Mercado Livre (OAuth)
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <strong>Para Desenvolvedores:</strong> A busca de produtos funciona com dados mock. 
            O OAuth será ativado automaticamente quando você registrar uma aplicação válida.
          </div>
        </div>
      )}
    </div>
  );
}

