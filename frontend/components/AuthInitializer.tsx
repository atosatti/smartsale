'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/services';

export default function AuthInitializer() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) return;

      try {
        // Buscar dados do usuário atual usando o token
        const response = await authAPI.getCurrentUser();
        const userData = response.data.user;
        
        // Tentar obter data de criação do perfil completo
        try {
          const profileResponse = await authAPI.getProfile();
          if (profileResponse.data.user?.createdAt) {
            userData.createdAt = profileResponse.data.user.createdAt;
          }
        } catch (error) {
          console.warn('Could not fetch full profile info:', error);
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initializeAuth();
  }, [token, setUser]);

  return null;
}
