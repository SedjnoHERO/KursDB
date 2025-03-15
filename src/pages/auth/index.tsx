import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@modules';
import { FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { Supabase } from '@api';
import { useAuth } from '@config';
import styles from './style.module.scss';

interface UserData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'user';
}

export const Auth = () => {
  const [step, setStep] = useState<'email' | 'registration'>('email');
  const [userData, setUserData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    role: 'user',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      toast.error('Некорректный email');
      return;
    }

    try {
      const { data, error } = await Supabase.from('PASSENGER')
        .select('Email, Role')
        .eq('Email', userData.email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Пользователь существует
        login(userData.email, data.Role);
        toast.success('Вход выполнен успешно');
      } else {
        // Пользователь не существует
        setStep('registration');
      }
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      setStep('registration');
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.firstName || !userData.lastName) {
      toast.error('Заполните имя и фамилию');
      return;
    }

    if (!userData.phone) {
      toast.error('Укажите номер телефона');
      return;
    }

    try {
      const { error } = await Supabase.from('PASSENGER').insert([
        {
          Email: userData.email,
          FirstName: userData.firstName,
          LastName: userData.lastName,
          Phone: userData.phone,
          Address: userData.address || null,
          Role: 'user',
        },
      ]);

      if (error) throw error;

      login(userData.email, 'user');
      toast.success('Регистрация успешна');
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      toast.error('Произошла ошибка при регистрации');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout headerType="minimal">
      <div className={styles.authPage}>
        <div className={styles.formContainer}>
          {step === 'email' ? (
            <>
              <h1>Вход в систему</h1>
              <p className={styles.subtitle}>
                Введите ваш email для входа или регистрации
              </p>
              <form onSubmit={handleEmailSubmit}>
                <div className={styles.inputGroup}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Ваш email"
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Продолжить
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>Регистрация</h1>
              <p className={styles.subtitle}>
                Заполните данные для создания аккаунта
              </p>
              <form onSubmit={handleRegistrationSubmit}>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.icon} />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Имя"
                    value={userData.firstName}
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
                    value={userData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaPhone className={styles.icon} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Телефон"
                    value={userData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaMapMarkerAlt className={styles.icon} />
                  <input
                    type="text"
                    name="address"
                    placeholder="Адрес"
                    value={userData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Зарегистрироваться
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
