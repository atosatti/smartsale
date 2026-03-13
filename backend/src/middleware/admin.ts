import { Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from './auth.js';
import pool from '../config/database.js';

/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser utilizado após o authMiddleware
 */
export const adminMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user?.id) {return res.status(401).json({ error: 'Not authenticated' });
    }// Consulta o banco de dados para verificar o role do usuário
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = (users as any[])[0];

    if (!user) {return res.status(404).json({ error: 'User not found' });
    }if (user.role !== 'admin') {return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      });
    }

    // Adiciona o role ao objeto de usuário para uso posterior
    (req.user as any).role = user.role;next();
  } catch (error) {
    console.error('[ADMIN] Admin middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Helper para verificar permissão de admin em uma rota sem usar middleware
 */
export const checkAdminRole = async (userId: number): Promise<boolean> => {
  try {
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};
