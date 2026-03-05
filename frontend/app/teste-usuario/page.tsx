import CreateTestUser from '@/components/CreateTestUser';
import { redirect } from 'next/navigation';

export default function TestUserPage() {
  // Verify user is logged in (client-side)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Usuário de Teste Mercado Livre
          </h1>
          <p className="text-lg text-gray-600">
            Configure um usuário de teste para contornar restrições de API
          </p>
        </div>
        
        <CreateTestUser />

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">ℹ️ Por que usar usuário de teste?</h2>
          <ul className="space-y-3 text-blue-800">
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Contorna restrições de proxy (ngrok PolicyAgent)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Permite testar funcionalidades de API sem limites</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Acesso isolado que não afeta sua conta principal</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Todas as buscas usarão automaticamente o usuário configurado</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
