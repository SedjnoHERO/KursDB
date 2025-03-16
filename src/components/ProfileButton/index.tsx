import { useState, useEffect, useRef } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
      <button
        ref={buttonRef}
        className={styles.profileButton}
        onClick={handleProfileClick}
      >
        <FaUserCircle />
      </button>
      {isProfileMenuOpen && (
        <div ref={menuRef} className={styles.profileMenu}>
          <div className={styles.userInfo}>
            <span>{user?.email}</span>
            <span className={styles.role}>
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
          {user?.role === 'admin' ? (
            <>
              <button onClick={() => handleNavigate('/')}>Главный экран</button>
              <button onClick={() => handleNavigate('/admin')}>
                Админ панель
              </button>
            </>
          ) : (
            <button onClick={() => handleNavigate('/profile')}>Профиль</button>
          )}
          <button onClick={handleLogout}>Выйти</button>
        </div>
      )}
    </div>
  );
};
