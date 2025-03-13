import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { toast } from 'sonner';
import styles from './style.module.scss';

type AuthType = 'login' | 'register';

export const Auth = () => {
  const [authType, setAuthType] = useState<AuthType>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authType === 'register') {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Пароли не совпадают');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Пароль должен быть не менее 6 символов');
        return;
      }

      if (
        !/^[A-Za-zА-Яа-яЁё\s-]+$/.test(formData.firstName) ||
        !/^[A-Za-zА-Яа-яЁё\s-]+$/.test(formData.lastName)
      ) {
        toast.error('Имя и фамилия должны содержать только буквы');
        return;
      }
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Некорректный email');
      return;
    }

    try {
      // Здесь будет логика аутентификации
      toast.success(
        authType === 'login' ? 'Вход выполнен' : 'Регистрация успешна',
      );
      navigate('/');
    } catch (error) {
      toast.error('Произошла ошибка');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.toggleButtons}>
          <button
            className={`${styles.toggleButton} ${authType === 'login' ? styles.active : ''}`}
            onClick={() => setAuthType('login')}
          >
            Вход
          </button>
          <button
            className={`${styles.toggleButton} ${authType === 'register' ? styles.active : ''}`}
            onClick={() => setAuthType('register')}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {authType === 'register' && (
            <>
              <div className={styles.inputGroup}>
                <FaUser className={styles.icon} />
                <input
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <FaUser className={styles.icon} />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className={styles.showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Скрыть' : 'Показать'}
            </button>
          </div>

          {authType === 'register' && (
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <Button
            variant="primary"
            label={authType === 'login' ? 'Войти' : 'Зарегистрироваться'}
            className={styles.submitButton}
          />
        </form>
      </div>
    </div>
  );
};
