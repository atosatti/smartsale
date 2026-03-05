import { useState } from 'react';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/store/themeStore';

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  planName,
  onCancelSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  onCancelSuccess: () => void;
}) {
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'feedback' | 'details'>('confirm');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [improvements, setImprovements] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);

  // Cores dinâmicas para dark mode
  const colors = {
    overlay: 'rgba(0, 0, 0, 0.5)',
    modal: isDarkMode ? '#1e293b' : '#fff',
    textPrimary: isDarkMode ? '#e0e0e0' : '#333',
    textSecondary: isDarkMode ? '#999' : '#666',
    border: isDarkMode ? '#404050' : '#ddd',
    warning: isDarkMode ? '#ff9800' : '#ffb74d',
    warningBg: isDarkMode ? '#331a00' : '#fff3e0',
    button: isDarkMode ? '#2d3748' : '#f0f0f0',
    buttonHover: isDarkMode ? '#4a5568' : '#e0e0e0',
    selected: isDarkMode ? '#1e3a8a' : '#e7f3ff',
    selectedBorder: isDarkMode ? '#3b82f6' : '#007bff',
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/payments/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason || 'Sem motivo informado',
          details: details || '',
          improvements: improvements || '',
          wouldReturn: wouldReturn,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao cancelar assinatura');
      }

      toast.success('Assinatura será cancelada ao final do período de faturamento!');
      setLoading(false);
      onCancelSuccess();
      onClose();
      setStep('confirm');
      setReason('');
      setDetails('');
      setImprovements('');
      setWouldReturn(null);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
    >
      <div
        style={{
          backgroundColor: colors.modal,
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          border: `1px solid ${colors.border}`,
        }}
      >
        {step === 'confirm' ? (
          <>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#d32f2f' }}>
              ⚠️ Cancelar Assinatura
            </h2>
            <p style={{ marginBottom: '1.5rem', color: colors.textSecondary, lineHeight: '1.6' }}>
              Você está prestes a cancelar seu plano <strong style={{ color: colors.textPrimary }}>
                {planName}
              </strong>.
            </p>
            <div
              style={{
                backgroundColor: colors.warningBg,
                border: `1px solid ${colors.warning}`,
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: colors.textPrimary,
              }}
            >
              <strong>O que acontecerá:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                <li>Sua assinatura será cancelada imediatamente</li>
                <li>Você perderá acesso aos recursos premium</li>
                <li>Você poderá se inscrever novamente a qualquer momento</li>
                <li>Reembolsos não estão disponíveis</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: colors.button,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = colors.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button;
                }}
              >
                Continuar com Meu Plano
              </button>
              <button
                onClick={() => setStep('feedback')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#b71c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                }}
              >
                Cancelar Assinatura
              </button>
            </div>
          </>
        ) : step === 'feedback' ? (
          <>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: colors.textPrimary }}>
              Por que você está cancelando?
            </h2>
            <p style={{ marginBottom: '1rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              Nos ajude a melhorar - sua opinião é importante
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              {[
                { value: 'too_expensive', label: '💰 Muito caro' },
                { value: 'not_using', label: '😴 Não estou usando' },
                { value: 'found_alternative', label: '🔄 Encontrei alternativa' },
                { value: 'poor_quality', label: '⭐ Qualidade insatisfatória' },
                { value: 'technical_issues', label: '🐛 Problemas técnicos' },
                { value: 'other', label: '📝 Outro motivo' },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    border: `2px solid ${
                      reason === option.value ? colors.selectedBorder : colors.border
                    }`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: reason === option.value ? colors.selected : colors.modal,
                    color: colors.textPrimary,
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep('confirm')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: colors.button,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = colors.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button;
                }}
              >
                Voltar
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={loading || !reason}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading || !reason ? 'not-allowed' : 'pointer',
                  opacity: loading || !reason ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading && reason) e.currentTarget.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }}
              >
                Próximo
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: colors.textPrimary }}>
              Detalhes e Sugestões
            </h2>
            <p style={{ marginBottom: '1rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              Ajude-nos a melhorar respondendo algumas perguntas adicionais
            </p>

            {/* Textarea - Detalhes */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textPrimary, fontWeight: 'bold' }}>
                Pode elaborar mais sobre seu motivo?
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Digite seus comentários aqui..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  backgroundColor: colors.modal,
                  color: colors.textPrimary,
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Textarea - Sugestões */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textPrimary, fontWeight: 'bold' }}>
                O que poderíamos melhorar?
              </label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Suas sugestões são valiosas..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  backgroundColor: colors.modal,
                  color: colors.textPrimary,
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Radio - Voltaria */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textPrimary, fontWeight: 'bold' }}>
                Você voltaria a usar o SmartSale no futuro?
              </label>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={wouldReturn === true}
                    onChange={() => setWouldReturn(true)}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  />
                  <span style={{ color: colors.textPrimary }}>👍 Sim</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={wouldReturn === false}
                    onChange={() => setWouldReturn(false)}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  />
                  <span style={{ color: colors.textPrimary }}>👎 Não</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep('feedback')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: colors.button,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = colors.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button;
                }}
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#b71c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                }}
              >
                {loading ? 'Processando...' : 'Confirmar Cancelamento'}
              </button>
            </div>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: colors.textSecondary, textAlign: 'center' }}>
              ℹ️ Sua assinatura permanecerá ativa até o final do período de faturamento.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
