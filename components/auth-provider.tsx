'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, RegisterData, LoginData, User, saveToken, removeToken, getToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // ✅ Alias para compatibilidad
  login: (email: string, password: string) => Promise<void>; // ✅ Firma correcta
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  isCliente: () => boolean;
  isParticipante: () => boolean;
  isAdministrador: () => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      
      // ✅ Guardar token
      saveToken(response.access_token);
      
      // ✅ Guardar email para la página de verificación
      if (response.email_verified === false) {
        localStorage.setItem('pending_verification_email', data.email);
        
        // ✅ Redirigir a página de verificación pendiente
        router.push('/email-verification-pending');
      } else {
        // Si por alguna razón ya está verificado, ir al dashboard
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw new Error(error.message || 'Error al registrar usuario');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data: LoginData = { email, password };
      const response = await authApi.login(data);
      
      // ✅ Verificar si el email está verificado
      if (response.email_verified === false) {
        // Guardar email para la página de verificación
        localStorage.setItem('pending_verification_email', email);
        
        // Redirigir a página de verificación pendiente
        router.push('/email-verification-pending');
        throw new Error('Por favor verifica tu email antes de iniciar sesión');
      }
      
      // ✅ Email verificado - Continuar con login normal
      saveToken(response.access_token);
      setUser(response.user);
      
      // Limpiar email pendiente si existía
      localStorage.removeItem('pending_verification_email');
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // ✅ Si el error es por email no verificado, ya se manejó arriba
      if (error.message?.includes('verifica tu email')) {
        throw error; // Re-lanzar para que el componente de login lo muestre
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      removeToken();
      localStorage.removeItem('pending_verification_email');
      setUser(null);
      router.push('/login');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Helpers de roles
  const isCliente = () => {
    return user?.roles?.some(role => role.nombre === 'cliente') ?? false;
  };

  const isParticipante = () => {
    return user?.roles?.some(role => role.nombre === 'participante') ?? false;
  };

  const isAdministrador = () => {
    return user?.roles?.some(role => role.nombre === 'administrador') ?? false;
  };

  const hasRole = (roleName: string) => {
    return user?.roles?.some(role => role.nombre === roleName) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading, // ✅ Alias para compatibilidad
        login,
        register,
        logout,
        updateUser,
        isCliente,
        isParticipante,
        isAdministrador,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};