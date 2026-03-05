import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import AuthInitializer from '@/components/AuthInitializer';
import ThemeProvider from '@/components/ThemeProvider';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'SmartSale - Pesquisa de Produtos em E-commerce',
  description: 'Encontre os melhores preços de produtos em múltiplas plataformas de e-commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider />
        <AuthInitializer />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
