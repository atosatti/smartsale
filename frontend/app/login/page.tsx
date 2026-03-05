'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.requiresTwoFA) {
        localStorage.setItem('tempToken', response.data.tempToken);
        router.push('/verify-2fa');
      } else {
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Login realizado com sucesso!');
        
        // Redireciona admin para /admin, usuários normais para /dashboard
        if (response.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#4a90e2',
            margin: '0 0 0.5rem 0'
          }}>SmartSale</h1>
          <p style={{
            color: '#666',
            fontSize: '0.9rem',
            margin: 0
          }}>Pesquisa de produtos em e-commerce</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#333'
          }}>Entrar na sua conta</h2>

          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333',
              fontSize: '0.95rem'
            }}>Email</label>
            <input
              type="email"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4a90e2';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333',
              fontSize: '0.95rem'
            }}>Senha</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4a90e2';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Forgot Password Link */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
            <a href="/forgot-password" style={{
              color: '#4a90e2',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Esqueceu a senha?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#357abd';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#4a90e2';
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            gap: '0.75rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
            <span style={{ color: '#999', fontSize: '0.85rem' }}>OU</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          </div>

          {/* Google Sign In Button */}
          <GoogleSignInButton 
            text="Entrar com Google"
            className="w-full"
            disabled={loading}
          />
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.95rem',
          marginBottom: '1.5rem'
        }}>
          Não tem uma conta? <Link href="/register" style={{
            color: '#4a90e2',
            fontWeight: '600',
            textDecoration: 'none'
          }}>Registre-se</Link>
        </div>

        {/* Footer Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          borderTop: '1px solid #eee',
          paddingTop: '1.5rem'
        }}>
          <Link href="/terms" style={{
            color: '#666',
            textDecoration: 'none'
          }}>
            Termos de Serviço
          </Link>
          <Link href="/privacy" style={{
            color: '#666',
            textDecoration: 'none'
          }}>
            Política de Privacidade
          </Link>
          <Link href="/about" style={{
            color: '#666',
            textDecoration: 'none'
          }}>
            Sobre
          </Link>
        </div>
      </div>
    </div>
  );
}
