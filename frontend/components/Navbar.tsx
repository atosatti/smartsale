'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          SmartSale
        </Link>

        <div className="flex gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/search" className="hover:text-blue-600">
                Pesquisar
              </Link>
              <Link href="/plans" className="hover:text-blue-600">
                Planos
              </Link>
              <Link href="/subscription" className="hover:text-blue-600">
                📋 Minha Assinatura
              </Link>
              <Link href="/help" className="hover:text-blue-600 flex items-center gap-1">
                <span>📚 Ajuda</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm">{user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Registrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
