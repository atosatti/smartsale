'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  planId: string;
  planName: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({
  planId,
  planName,
  amount,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showInvoiceData, setShowInvoiceData] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'pf' | 'pj'>('pj');
  const [isDark, setIsDark] = useState(false);
  
  // Detectar dark mode
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);

    // Observar mudanças de tema
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setIsDark(isDarkNow);
    });

    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  const [invoiceData, setInvoiceData] = useState({
    personType: 'pj',
    fullName: '',
    cpf: '',
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
    
    return true;
  };

  // Função para formatar CPF (123.456.789-10)
  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  };

  // Função para validar CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 0; i < 4; i++) {
      sum += parseInt(cleaned[i]) * (5 - i);
    }
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleaned[i + 4]) * (9 - i);
    }
    
    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;
    
    if (remainder !== parseInt(cleaned[12])) return false;
    
    sum = 0;
    for (let i = 0; i < 5; i++) {
      sum += parseInt(cleaned[i]) * (6 - i);
    }
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleaned[i + 5]) * (9 - i);
    }
    
    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;
    
    if (remainder !== parseInt(cleaned[13])) return false;
    
    return true;
  };

  // Função para formatar CNPJ (12.345.678/0001-90)
  const formatCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe não carregou corretamente');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Criar pagamento via API
      const response = await fetch(`${apiUrl}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          planName,
          amount: Math.round(amount), // amount já deve estar em cents
          email,
          name,
          invoiceData: showInvoiceData ? { ...invoiceData, personType: invoiceType } : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', response.status, errorData);
        toast.error(`Erro ${response.status}: Verifique o console`);
        setLoading(false);
        return;
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        toast.error('Erro ao criar pagamento');
        setLoading(false);
        return;
      }

      // Confirmar pagamento
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name, email },
        },
      });

      if (result.error) {
        toast.error(`Erro: ${result.error.message}`);
        setLoading(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Chamar API backend para confirmar pagamento e atualizar banco
        const confirmResponse = await fetch(`${apiUrl}/payments/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            planId,
            planName,
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.text();
          console.error('Erro ao confirmar:', confirmResponse.status, errorData);
          
          // Tentar parsear como JSON para melhor erro
          let errorMessage = 'Erro ao atualizar plano no servidor';
          try {
            const errorJson = JSON.parse(errorData);
            errorMessage = errorJson.error || errorMessage;
          } catch (e) {
            errorMessage = `Erro ${confirmResponse.status}: ${errorData}`;
          }
          
          toast.error(errorMessage);
          setLoading(false);
          return;
        }

        const confirmData = await confirmResponse.json();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: isDark ? '#1f2937' : 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      }}>
        <h2 style={{ 
          marginBottom: '0.5rem', 
          fontSize: '1.5rem',
          color: isDark ? '#f3f4f6' : '#000'
        }}>
          Assinar {planName}
        </h2>
        <p style={{ 
          color: isDark ? '#9ca3af' : '#666', 
          marginBottom: '1.5rem' 
        }}>
          Valor: <strong>R$ {amount.toFixed(2)}/mês</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: isDark ? '#f3f4f6' : '#000'
            }}>
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: isDark ? '#374151' : '#fff',
                color: isDark ? '#f3f4f6' : '#000',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: isDark ? '#f3f4f6' : '#000'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: isDark ? '#374151' : '#fff',
                color: isDark ? '#f3f4f6' : '#000',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: isDark ? '#f3f4f6' : '#000'
            }}>
              Dados do Cartão
            </label>
            <div style={{
              padding: '0.75rem',
              border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
              borderRadius: '4px',
              backgroundColor: isDark ? '#374151' : '#fff',
            }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '1rem',
                      color: isDark ? '#f3f4f6' : '#424242',
                      backgroundColor: isDark ? '#374151' : '#fff',
                      '::placeholder': {
                        color: isDark ? '#9ca3af' : '#aaa',
                      },
                    },
                    invalid: {
                      color: '#c23030',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Invoice Data Section */}
          <div style={{ marginBottom: '1.5rem', borderTop: `1px solid ${isDark ? '#4b5563' : '#ddd'}`, paddingTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowInvoiceData(!showInvoiceData)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isDark ? '#374151' : '#f8f9fa',
                border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.95rem',
                color: isDark ? '#f3f4f6' : '#000',
              }}
            >
              📄 Dados para Fatura (Opcional)
              <span>{showInvoiceData ? '▼' : '▶'}</span>
            </button>

            {showInvoiceData && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: isDark ? '#374151' : '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#666', marginBottom: '1rem' }}>
                  Preencha estes dados apenas se deseja uma fatura
                </p>

                {/* Tipo de Pessoa */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    color: isDark ? '#f3f4f6' : '#000'
                  }}>
                    Tipo de Pessoa
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceType('pf');
                        setInvoiceData({
                          ...invoiceData,
                          personType: 'pf',
                          companyName: '',
                          cnpj: '',
                        });
                      }}
                      style={{
                        padding: '0.75rem',
                        border: invoiceType === 'pf' ? '2px solid #007bff' : `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                        borderRadius: '4px',
                        backgroundColor: invoiceType === 'pf' ? '#e7f3ff' : (isDark ? '#1f2937' : '#fff'),
                        cursor: 'pointer',
                        fontWeight: invoiceType === 'pf' ? 'bold' : 'normal',
                        color: invoiceType === 'pf' ? '#007bff' : (isDark ? '#f3f4f6' : '#666'),
                        transition: 'all 0.2s',
                      }}
                    >
                      👤 Pessoa Física
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceType('pj');
                        setInvoiceData({
                          ...invoiceData,
                          personType: 'pj',
                          fullName: '',
                          cpf: '',
                        });
                      }}
                      style={{
                        padding: '0.75rem',
                        border: invoiceType === 'pj' ? '2px solid #007bff' : `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                        borderRadius: '4px',
                        backgroundColor: invoiceType === 'pj' ? '#e7f3ff' : (isDark ? '#1f2937' : '#fff'),
                        cursor: 'pointer',
                        fontWeight: invoiceType === 'pj' ? 'bold' : 'normal',
                        color: invoiceType === 'pj' ? '#007bff' : (isDark ? '#f3f4f6' : '#666'),
                        transition: 'all 0.2s',
                      }}
                    >
                      🏢 Pessoa Jurídica
                    </button>
                  </div>
                </div>

                {/* Campos Pessoa Física */}
                {invoiceType === 'pf' && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: isDark ? '#f3f4f6' : '#000'
                      }}>
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: João Silva Santos"
                        value={invoiceData.fullName}
                        onChange={(e) => setInvoiceData({ ...invoiceData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#f3f4f6' : '#000',
                        }}
                        disabled={loading}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: isDark ? '#f3f4f6' : '#000'
                      }}>
                        CPF {invoiceData.cpf && !validateCPF(invoiceData.cpf) && <span style={{ color: '#d32f2f' }}>❌ Inválido</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 123.456.789-10"
                        value={invoiceData.cpf}
                        onChange={(e) => setInvoiceData({ ...invoiceData, cpf: formatCPF(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: invoiceData.cpf && !validateCPF(invoiceData.cpf) ? '2px solid #d32f2f' : `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#f3f4f6' : '#000',
                        }}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                {/* Campos Pessoa Jurídica */}
                {invoiceType === 'pj' && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: isDark ? '#f3f4f6' : '#000'
                      }}>
                        Razão Social
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Minha Empresa Ltda"
                        value={invoiceData.companyName}
                        onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#f3f4f6' : '#000',
                        }}
                        disabled={loading}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: isDark ? '#f3f4f6' : '#000'
                      }}>
                        CNPJ {invoiceData.cnpj && !validateCNPJ(invoiceData.cnpj) && <span style={{ color: '#d32f2f' }}>❌ Inválido</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 12.345.678/0001-90"
                        value={invoiceData.cnpj}
                        onChange={(e) => setInvoiceData({ ...invoiceData, cnpj: formatCNPJ(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: invoiceData.cnpj && !validateCNPJ(invoiceData.cnpj) ? '2px solid #d32f2f' : `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#f3f4f6' : '#000',
                        }}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    color: isDark ? '#f3f4f6' : '#000'
                  }}>
                    Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rua Principal, 123"
                    value={invoiceData.address}
                    onChange={(e) => setInvoiceData({ ...invoiceData, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      backgroundColor: isDark ? '#374151' : '#fff',
                      color: isDark ? '#f3f4f6' : '#000',
                    }}
                    disabled={loading}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      color: isDark ? '#f3f4f6' : '#000'
                    }}>
                      Cidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={invoiceData.city}
                      onChange={(e) => setInvoiceData({ ...invoiceData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: isDark ? '#374151' : '#fff',
                        color: isDark ? '#f3f4f6' : '#000',
                      }}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      color: isDark ? '#f3f4f6' : '#000'
                    }}>
                      Estado
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: SP"
                      maxLength={2}
                      value={invoiceData.state}
                      onChange={(e) => setInvoiceData({ ...invoiceData, state: e.target.value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: isDark ? '#374151' : '#fff',
                        color: isDark ? '#f3f4f6' : '#000',
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    color: isDark ? '#f3f4f6' : '#000'
                  }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 01310-100"
                    value={invoiceData.zipCode}
                    onChange={(e) => setInvoiceData({ ...invoiceData, zipCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      backgroundColor: isDark ? '#374151' : '#fff',
                      color: isDark ? '#f3f4f6' : '#000',
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <p style={{
            fontSize: '0.875rem',
            color: isDark ? '#9ca3af' : '#666',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            🔒 Seu cartão é processado de forma segura pelo Stripe
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: isDark ? '#4b5563' : '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                color: isDark ? '#f3f4f6' : '#000',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: !stripe || loading ? 'not-allowed' : 'pointer',
                opacity: !stripe || loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StripeCheckout({
  planId,
  planName,
  amount,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        planId={planId}
        planName={planName}
        amount={amount}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
