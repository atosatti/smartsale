'use client';

import React, { useEffect, useState } from 'react';
import { Chrome, LogOut } from 'lucide-react';

interface GoogleSignInButtonProps {
  text?: string;
  className?: string;
  disabled?: boolean;
}

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export default function GoogleSignInButton({ 
  text = 'Entrar com Google', 
  className = '',
  disabled = false 
}: GoogleSignInButtonProps) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('🔍 GoogleSignInButton: useEffect iniciado');
    setMounted(true);

    if (typeof window === 'undefined') return;

    // Verificar localStorage
    try {
      console.log('📦 Verificando localStorage...');
      const storedUser = localStorage.getItem('googleUser');
      console.log('👤 googleUser do localStorage:', storedUser);
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('✅ Usuário encontrado:', user);
          setGoogleUser(user);
          return;
        } catch (parseError) {
          console.warn('❌ Erro ao fazer parse:', parseError);
          localStorage.removeItem('googleUser');
        }
      } else {
        console.log('ℹ️ Nenhum usuário armazenado - mostre o botão de login');
      }
    } catch (error) {
      console.warn('❌ Erro ao acessar localStorage:', error);
    }

    // Listener para mudanças no localStorage (quando retorna de outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 StorageEvent detectado:', e.key);
      if (e.key === 'googleUser') {
        if (e.newValue) {
          try {
            const user = JSON.parse(e.newValue);
            console.log('✅ Usuário atualizado:', user);
            setGoogleUser(user);
          } catch (parseError) {
            console.warn('❌ Erro ao parsear:', parseError);
          }
        } else {
          console.log('🚪 Usuário removido');
          setGoogleUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleGoogleLogin = () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || apiUrl.replace(/\/api\/?$/, '');
      window.location.href = `${backendUrl}/api/auth/google/authorize`;
    } catch (error) {
      console.error('Erro ao iniciar login Google:', error);
    }
  };

  const handleGoogleLogout = () => {
    try {
      localStorage.removeItem('googleUser');
      setGoogleUser(null);
      console.log('✅ Usuário desconectado');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Botão padrão durante SSR
  if (!mounted) {
    return (
      <button
        disabled={disabled}
        className={`
          w-full
          flex items-center justify-center gap-2
          px-4 py-2.5
          bg-white border border-gray-300
          rounded-lg
          font-medium text-gray-700
          hover:bg-gray-50 hover:border-gray-400
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <Chrome size={18} />
        {text}
      </button>
    );
  }

  // Se usuário está logado no Google
  if (googleUser) {
    return (
      <div 
        className={`
          w-full
          bg-white border border-gray-300
          rounded-lg
          overflow-hidden
          ${className}
        `}
      >
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
          type="button"
        >
          {/* Foto de Perfil */}
          {googleUser.picture && (
            <img 
              src={googleUser.picture} 
              alt={googleUser.name}
              className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              loading="lazy"
            />
          )}
          
          {/* Informações do Usuário */}
          <div className="flex flex-col flex-1 min-w-0 text-left">
            <span className="text-sm text-gray-700 font-normal">
              Entrar como
            </span>
            <span className="text-base font-medium text-gray-900 truncate">
              {googleUser.name}
            </span>
            <span className="text-sm text-gray-600 truncate">
              {googleUser.email}
            </span>
          </div>

          {/* Google Logo SVG */}
          <svg 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 48 48" 
            className="w-6 h-6 flex-shrink-0"
            aria-hidden="true"
          >
            <g>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </g>
          </svg>
        </button>
        
        {/* Logout Button */}
        <div className="border-t border-gray-300">
          <button
            onClick={handleGoogleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium flex items-center justify-center gap-2"
            type="button"
          >
            <LogOut size={16} />
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  // Se usuário não está logado - mostrar botão de login
  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled}
      className={`
        w-full
        flex items-center justify-center gap-2
        px-4 py-2.5
        bg-white border border-gray-300
        rounded-lg
        font-medium text-gray-700
        hover:bg-gray-50 hover:border-gray-400
        hover:shadow-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${className}
      `}
    >
      <Chrome size={18} />
      {text}
    </button>
  );
}
