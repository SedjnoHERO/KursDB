import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Проверяем наличие данных пользователя при загрузке
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (email && role) {
      setUser({ email, role: role as 'admin' | 'user' });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: string) => {
    setUser({ email, role: role as 'admin' | 'user' });
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);

    // Получаем сохраненный путь или используем дефолтный
    const from = location.state?.from?.pathname || '/';

    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate(from);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
