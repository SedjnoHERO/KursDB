import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@config';
import styles from './style.module.scss';

interface ProfileButtonProps {
  variant?: 'default' | 'admin' | 'minimal';
}

export const ProfileButton = ({ variant = 'default' }: ProfileButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleNavigate = (path: string) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
  };

  if (!isAuthenticated) {
    return (
      <button
        className={`${styles.authButton} ${styles[variant]}`}
        onClick={() => navigate('/auth')}
      >
        Войти
      </button>
    );
  }

  return (
    <div className={`${styles.profileContainer} ${styles[variant]}`}>
      <button className={styles.profileButton} onClick={handleProfileClick}>
        <FaUserCircle />
      </button>
      {isProfileMenuOpen && (
        <div className={styles.profileMenu}>
          <div className={styles.userInfo}>
            <span>{user?.email}</span>
            <span className={styles.role}>
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
          <button onClick={() => handleNavigate('/profile')}>Профиль</button>
          {user?.role === 'admin' && (
            <button onClick={() => handleNavigate('/admin')}>
              Админ панель
            </button>
          )}
          <button onClick={handleLogout}>Выйти</button>
        </div>
      )}
    </div>
  );
};
