'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const isNewUser = searchParams.get('isNewUser') === 'true';
        const userStr = searchParams.get('user');

        console.log('🔍 [Callback] Token:', !!token);
        console.log('🔍 [Callback] isNewUser:', isNewUser);
        console.log('🔍 [Callback] userStr:', !!userStr);
        console.log('🔍 [Callback] Todos searchParams:', Array.from(searchParams.entries()));

        if (!token || !userStr) {
          console.error('❌ [Callback] Erro: Token ou userStr vazio', { token, userStr });
          throw new Error(`Token ou usuário não fornecido (token: ${!!token}, user: ${!!userStr})`);
        }

        console.log('✅ [Callback] Fazendo parse do usuário...');
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('✅ [Callback] User parseado:', user);

        // Armazenar token e usuário
        console.log('💾 [Callback] Armazenando token e usuário na Store...');
        setToken(token);
        setUser(user);
        console.log('✅ [Callback] Token e usuário armazenados na Store');

        // Salvar informações do Google no localStorage para exibir no botão
        const googleUserData = {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          picture: user.picture || '' // Se disponível no backend
        };
        console.log('💾 [Callback] Salvando no localStorage:', googleUserData);
        localStorage.setItem('googleUser', JSON.stringify(googleUserData));

        // Disparar evento customizado para notificar outras abas/componentes
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'googleUser',
          newValue: JSON.stringify(googleUserData),
          url: window.location.href
        }));

        console.log('✅ Google userData salvo no localStorage e event disparado');

        // Mostrar toast apropriado
        if (isNewUser) {
          toast.success('Bem-vindo! Sua conta foi criada com sucesso!');
        } else {
          toast.success('Login realizado com sucesso!');
        }

        // Aguardar um pouco antes de redirecionar
        console.log('⏳ [Callback] Redirecionando em 500ms para:', user.role === 'admin' ? '/admin' : '/dashboard');
        setTimeout(() => {
          console.log('🚀 [Callback] Executando redirecionamento...');
          if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 500);
      } catch (error: any) {
        console.error('❌ [Callback] Erro ao processar callback:', error);
        console.error('❌ [Callback] Stack:', error.stack);
        toast.error('Erro ao processar autenticação: ' + error.message);
        setTimeout(() => {
          console.log('🔄 [Callback] Redirecionando para /login após erro');
          router.push('/login');
        }, 500);
      }
    };

    processCallback();
  }, [searchParams, router, setToken, setUser]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4a90e2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <p style={{
          color: '#666',
          fontSize: '1rem'
        }}>Processando autenticação...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
