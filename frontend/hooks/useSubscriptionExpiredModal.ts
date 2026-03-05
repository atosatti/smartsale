import { useState, useCallback } from 'react';

/**
 * Hook customizado para gerenciar modal de assinatura expirada
 * Encapsula a lógica de verificação e abertura do modal
 */
export function useSubscriptionExpiredModal() {
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /**
   * Verifica se um erro é de assinatura expirada (403)
   * Se for, abre o modal e retorna true
   * Caso contrário, retorna false
   */
  const handleSubscriptionError = useCallback((error: any): boolean => {
    if (error?.response?.status === 403 && error?.response?.data?.action === 'upgrade_plan') {
      setShowExpiredModal(true);
      return true;
    }
    return false;
  }, []);

  return {
    showExpiredModal,
    setShowExpiredModal,
    handleSubscriptionError,
  };
}
