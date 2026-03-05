'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function Verify2FA() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken: setAuthToken, setUser } = useAuthStore();

  useEffect(() => {
    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempToken = localStorage.getItem('tempToken');
      if (!tempToken) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        router.push('/login');
        return;
      }

      const response = await authAPI.verify2FA(tempToken, token);
      
      setAuthToken(response.data.token);
      setUser(response.data.user);
      localStorage.removeItem('tempToken');
      
      toast.success('2FA verificado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao verificar 2FA');
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
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#3699FF',
            margin: '0 0 0.5rem 0'
          }}>
            🔒
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            margin: '0 0 0.5rem 0'
          }}>
            Autenticação de Dois Fatores
          </h2>
          <p style={{
            color: '#666',
            fontSize: '0.95rem',
            margin: 0
          }}>
            Digite o código de 6 dígitos do seu autenticador
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem'
            }}>
              Código de Verificação
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                color: '#333',
                fontSize: '1.5rem',
                letterSpacing: '0.2em',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
            <p style={{
              color: '#666',
              fontSize: '0.85rem',
              margin: '0.5rem 0 0 0'
            }}>
              {token.length}/6 dígitos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || token.length !== 6}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: token.length === 6 && !loading ? '#3699FF' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: token.length === 6 && !loading ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (token.length === 6 && !loading) {
                e.currentTarget.style.backgroundColor = '#2a7fd9';
              }
            }}
            onMouseLeave={(e) => {
              if (token.length === 6 && !loading) {
                e.currentTarget.style.backgroundColor = '#3699FF';
              }
            }}
          >
            {loading ? '⏳ Verificando...' : '✓ Verificar'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#666',
            fontSize: '0.9rem',
            margin: 0
          }}>
            Problemas para fazer login?{' '}
            <Link href="/login" style={{
              color: '#3699FF',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
