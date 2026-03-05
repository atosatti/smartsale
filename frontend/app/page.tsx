'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import MetronicLayout from '@/components/MetronicLayout';
import SearchBox from '@/components/SearchBox';
import ResultsList from '@/components/ResultsList';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionar para dashboard se já está autenticado
  useEffect(() => {
    if (mounted && token) {
      router.push('/dashboard');
    }
  }, [mounted, token, router]);

  // Evitar erro de hidratação - renderizar apenas após montagem
  if (!mounted) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SmartSale</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
          Carregando...
        </p>
      </div>
    );
  }

  // Se tem token, não renderizar página inicial
  if (token) {
    return null;
  }

  return (
    <>
      {token ? (
        <MetronicLayout>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bem-vindo, {user?.firstName}!</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Pesquise produtos em múltiplas plataformas de e-commerce
            </p>

            {/* Search Section */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Pesquisar Produto</h3>
              <SearchBox />
            </div>

            {/* Results Section */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Resultados</h3>
              <ResultsList />
            </div>
          </div>
        </MetronicLayout>
      ) : (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          {/* Hero Section */}
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SmartSale</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
            Encontre os melhores preços de produtos em múltiplas plataformas de e-commerce
          </p>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto 3rem' }}>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Múltiplas Plataformas</h3>
              <p style={{ color: '#666' }}>
                Compare preços em Mercado Livre, Amazon, Shopee e muito mais
              </p>
            </div>

            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Fácil de Usar</h3>
              <p style={{ color: '#666' }}>
                Interface intuitiva e rápida para suas pesquisas
              </p>
            </div>

            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Planos Flexíveis</h3>
              <p style={{ color: '#666' }}>
                Escolha o plano que melhor se adequa às suas necessidades
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginRight: '1rem',
              }}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                backgroundColor: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Registrar
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
