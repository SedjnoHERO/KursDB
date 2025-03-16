import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@modules';
import { FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { Supabase } from '@api';
import { useAuth } from '@config';
import styles from './style.module.scss';
import { patterns, formatPhone } from '@config';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  passportSeries?: string;
  passportNumber?: string;
  role: 'user';
}

export const Auth = () => {
  const [step, setStep] = useState<'email' | 'registration'>('email');
  const [userData, setUserData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    passportSeries: '',
    passportNumber: '',
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    let formattedValue = value;

    switch (name) {
      case 'phone':
        const numbers = value.replace(/\D/g, '').slice(0, 12);
        formattedValue = formatPhone(numbers);

        console.log('Введенный номер:', formattedValue);
        console.log('Номер без форматирования:', value.replace(/\D/g, ''));
        break;
      case 'passportSeries':
        formattedValue = value.toUpperCase().slice(0, 2);
        break;
      case 'passportNumber':
        formattedValue = value.replace(/\D/g, '').slice(0, 7);
        break;
      case 'firstName':
      case 'lastName':
        formattedValue = value.replace(/[^А-Яа-яЁё\s-]/g, '');
        break;
    }

    setUserData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateField = (
    name: string,
    value: string | undefined,
  ): string | undefined => {
    if (!value) return 'Поле обязательно для заполнения';

    switch (name) {
      case 'phone':
        return patterns.phone.test(value)
          ? undefined
          : 'Неверный формат телефона';
      case 'passportSeries':
        return patterns.passportSeries.test(value)
          ? undefined
          : 'Серия паспорта должна содержать 2 буквы';
      case 'passportNumber':
        return patterns.passportNumber.test(value)
          ? undefined
          : 'Номер паспорта должен содержать 7 цифр';
      case 'firstName':
      case 'lastName':
        return patterns.name.test(value)
          ? undefined
          : 'Имя должно содержать только буквы, пробелы и дефисы';
      case 'email':
        return patterns.email.test(value) ? undefined : 'Некорректный email';
      default:
        return undefined;
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем все поля
    const errors: { [key: string]: string } = {};
    Object.keys(userData).forEach(key => {
      const error = validateField(key, userData[key as keyof UserData]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    try {
      const { error } = await Supabase.from('PASSENGER').insert([
        {
          Email: userData.email,
          FirstName: userData.firstName,
          LastName: userData.lastName,
          Phone: userData.phone,
          Gender: userData.gender,
          DateOfBirth: userData.dateOfBirth,
          PassportSeries: userData.passportSeries,
          PassportNumber: userData.passportNumber,
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
                    placeholder="+375 (##) 123-45-67"
                    value={userData.phone}
                    onChange={handleInputChange}
                    required
                    maxLength={19}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Male">Мужской</option>
                    <option value="Female">Женский</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={userData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="passportSeries"
                    placeholder="Серия паспорта"
                    value={userData.passportSeries}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="passportNumber"
                    placeholder="Номер паспорта"
                    value={userData.passportNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setStep('email')}
                  >
                    Назад
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
