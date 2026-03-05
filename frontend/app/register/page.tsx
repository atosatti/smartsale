'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.register(formData);
      toast.success('Conta criada com sucesso!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-centered">
      <div className="page-wrapper">
        <div className="page-content d-flex flex-column">
          <div className="flex-grow-1 d-flex flex-column justify-content-center py-6">
            <div className="container-tight p-4">
              <div className="text-center mb-4">
                <h2 className="navbar-brand navbar-brand-autodark">SmartSale</h2>
              </div>

              <form className="card card-md" onSubmit={handleSubmit}>
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Criar uma nova conta</h2>

                  <div className="row row-cols-2 g-3 mb-3">
                    <div className="col">
                      <label className="form-label">Nome</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-control"
                        placeholder="Seu nome"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Sobrenome</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-control"
                        placeholder="Seu sobrenome"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="seu-email@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Senha</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                    <small className="form-hint">Mínimo 8 caracteres</small>
                  </div>

                  <div className="form-footer">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                  </div>

                  <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                  </div>

                  <GoogleSignInButton 
                    text="Registrar com Google"
                    disabled={loading}
                  />
                </div>
              </form>

              <div className="text-center text-muted mt-3">
                Já tem conta? <Link href="/login">Faça login</Link>
              </div>

              {/* Footer Links */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                fontSize: '0.85rem',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #eee'
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
        </div>
      </div>
    </div>
  );
}
