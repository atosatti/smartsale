'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import MetronicLayout from '@/components/MetronicLayout';

export default function Setup2FA() {
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, token: authToken } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authToken) {
      router.push('/login');
    }
  }, [authToken, router, mounted]);

  if (!mounted || !authToken) {
    return (
      <MetronicLayout>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div>
      </MetronicLayout>
    );
  }

  const colors = {
    cardBg: isDarkMode ? '#252835' : '#ffffff',
    border: isDarkMode ? '#404050' : '#ddd',
    text: isDarkMode ? '#e0e0e0' : '#333',
    lightText: isDarkMode ? '#999' : '#666',
    inputBg: isDarkMode ? '#1a1a27' : '#f8f9fa',
    alertBg: isDarkMode ? '#404050' : '#e7f3ff',
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const response = await authAPI.setup2FA();
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setStep(2);
      toast.success('QR Code gerado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await authAPI.confirm2FA(secret, token);
      toast.success('2FA ativado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Token inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MetronicLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#3699FF',
            margin: '0 0 0.5rem 0'
          }}>
            🔒 Autenticação de Dois Fatores
          </h1>
          <p style={{ color: colors.lightText, margin: 0 }}>
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>

        {/* 2FA Setup Card */}
        <div style={{
          backgroundColor: colors.cardBg,
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}>
          {step === 1 ? (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: colors.text,
              }}>
                Passo 1: Preparar Autenticador
              </h3>

              <p style={{
                color: colors.lightText,
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}>
                A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
                Você precisará de um aplicativo autenticador como Google Authenticator, Microsoft Authenticator ou Authy.
              </p>

              {/* Alert Box */}
              <div style={{
                backgroundColor: colors.alertBg,
                padding: '1rem',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#505060' : '#b3d9ff'}`,
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
              }}>
                <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                <div>
                  <p style={{ color: colors.text, fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    Aplicativos Recomendados
                  </p>
                  <p style={{ color: colors.lightText, margin: 0, fontSize: '0.9rem' }}>
                    Google Authenticator, Microsoft Authenticator ou Authy
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#3699FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2a7fd9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3699FF';
                }}
              >
                {loading ? '⏳ Gerando...' : '📱 Gerar QR Code'}
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: colors.text,
              }}>
                Passo 2: Escanear e Verificar
              </h3>

              {qrCode && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <p style={{
                    color: colors.lightText,
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                  }}>
                    Escaneie este código QR com seu autenticador
                  </p>
                  <img
                    src={qrCode}
                    alt="QR Code para 2FA"
                    style={{
                      display: 'inline-block',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      maxWidth: '300px',
                    }}
                  />
                </div>
              )}

              {/* Secret Key Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: colors.text,
                }}>
                  Chave Secreta (Backup)
                </label>
                <input
                  type="text"
                  value={secret}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    cursor: 'text',
                  }}
                />
                <p style={{
                  color: colors.lightText,
                  fontSize: '0.85rem',
                  margin: '0.5rem 0 0 0',
                }}>
                  Guarde esta chave em um local seguro para recuperação
                </p>
              </div>

              {/* Token Input */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: colors.text,
                }}>
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    fontSize: '1.2rem',
                    letterSpacing: '0.2em',
                    textAlign: 'center',
                  }}
                />
                <p style={{
                  color: colors.lightText,
                  fontSize: '0.85rem',
                  margin: '0.5rem 0 0 0',
                }}>
                  Digite o código de 6 dígitos do seu autenticador
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setToken('');
                  }}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#6C757D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a6268';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6C757D';
                  }}
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || token.length !== 6}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#1BC5BD',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading || token.length !== 6 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                    opacity: loading || token.length !== 6 ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!(loading || token.length !== 6)) {
                      e.currentTarget.style.backgroundColor = '#179a91';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1BC5BD';
                  }}
                >
                  {loading ? '⏳ Verificando...' : '✓ Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MetronicLayout>
  );
}
