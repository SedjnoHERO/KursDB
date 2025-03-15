import React, { useState } from 'react';
import { Layout } from '@modules';
import {
  FaUser,
  FaTicketAlt,
  FaEdit,
  FaCreditCard,
  FaTimes,
} from 'react-icons/fa';
import styles from './style.module.scss';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
}

interface Ticket {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  status: 'booked' | 'paid' | 'cancelled';
}

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    birthDate: '1990-01-01',
    address: 'г. Москва, ул. Примерная, д. 1',
  });

  // Моковые данные для билетов
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      from: 'Москва',
      to: 'Санкт-Петербург',
      date: '2024-04-01',
      time: '10:00',
      price: 3500,
      status: 'booked',
    },
    {
      id: '2',
      from: 'Санкт-Петербург',
      to: 'Сочи',
      date: '2024-05-15',
      time: '15:30',
      price: 7800,
      status: 'paid',
    },
  ]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Здесь будет логика сохранения в API
    console.log('Сохранено:', profile);
  };

  const handleTicketAction = (ticketId: string, action: 'pay' | 'cancel') => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: action === 'pay' ? 'paid' : 'cancelled' }
          : ticket,
      ),
    );
  };

  return (
    <Layout>
      <div className={styles.profilePage}>
        <div className={styles.contentContainer}>
          <div className={styles.profileSection}>
            <div className={styles.header}>
              <h1>
                <FaUser /> Личный кабинет
              </h1>
              <button
                className={styles.editButton}
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
              >
                {isEditing ? 'Сохранить' : 'Редактировать'}
                <FaEdit />
              </button>
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.infoGrid}>
                <div className={styles.infoGroup}>
                  <label>Имя</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.firstName}</p>
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <label>Фамилия</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.lastName}</p>
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.email}</p>
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <label>Телефон</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.phone}</p>
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <label>Дата рождения</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={profile.birthDate}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.birthDate}</p>
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <label>Адрес</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <p>{profile.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.ticketsSection}>
            <h2>
              <FaTicketAlt /> Мои билеты
            </h2>
            <div className={styles.ticketsList}>
              {tickets.map(ticket => (
                <div key={ticket.id} className={styles.ticketCard}>
                  <div className={styles.ticketInfo}>
                    <div className={styles.route}>
                      <h3>
                        {ticket.from} → {ticket.to}
                      </h3>
                      <p>
                        {ticket.date} в {ticket.time}
                      </p>
                    </div>
                    <div className={styles.price}>
                      <p>{ticket.price} ₽</p>
                      <span className={styles[ticket.status]}>
                        {ticket.status === 'booked' && 'Забронирован'}
                        {ticket.status === 'paid' && 'Оплачен'}
                        {ticket.status === 'cancelled' && 'Отменен'}
                      </span>
                    </div>
                  </div>
                  {ticket.status === 'booked' && (
                    <div className={styles.ticketActions}>
                      <button
                        className={styles.payButton}
                        onClick={() => handleTicketAction(ticket.id, 'pay')}
                      >
                        <FaCreditCard /> Оплатить
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleTicketAction(ticket.id, 'cancel')}
                      >
                        <FaTimes /> Отменить
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
