import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPlane,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { Layout } from '@modules';
import styles from './style.module.scss';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passengers: number;
}

export const TicketDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passengers: 1,
  });

  // Здесь будет запрос к API для получения данных билета
  const ticket = {
    id: id,
    from: 'Москва',
    to: 'Санкт-Петербург',
    date: '2024-04-01',
    time: '10:00',
    duration: '1ч 30м',
    price: 3500,
    availableSeats: 45,
    airline: 'Аэрофлот',
    aircraft: 'Boeing 737',
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log('Форма отправлена:', formData);
  };

  return (
    <Layout>
      <div className={styles.ticketPage}>
        <div className={styles.contentContainer}>
          <div className={styles.ticketDetail}>
            <div className={styles.ticketInfo}>
              <h1>Информация о рейсе</h1>

              <div className={styles.mainInfo}>
                <div className={styles.route}>
                  <div className={styles.city}>
                    <FaMapMarkerAlt />
                    <div>
                      <h3>{ticket.from}</h3>
                      <p>Город отправления</p>
                    </div>
                  </div>

                  <div className={styles.flightIcon}>
                    <FaPlane />
                  </div>

                  <div className={styles.city}>
                    <FaMapMarkerAlt />
                    <div>
                      <h3>{ticket.to}</h3>
                      <p>Город прибытия</p>
                    </div>
                  </div>
                </div>

                <div className={styles.details}>
                  <div className={styles.detail}>
                    <FaCalendarAlt />
                    <div>
                      <h4>Дата</h4>
                      <p>{ticket.date}</p>
                    </div>
                  </div>

                  <div className={styles.detail}>
                    <FaClock />
                    <div>
                      <h4>Время вылета</h4>
                      <p>{ticket.time}</p>
                    </div>
                  </div>

                  <div className={styles.detail}>
                    <FaClock />
                    <div>
                      <h4>Длительность</h4>
                      <p>{ticket.duration}</p>
                    </div>
                  </div>

                  <div className={styles.detail}>
                    <FaMoneyBillWave />
                    <div>
                      <h4>Стоимость</h4>
                      <p>{ticket.price} ₽</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.additionalInfo}>
                <h2>Детали рейса</h2>
                <p>Авиакомпания: {ticket.airline}</p>
                <p>Тип самолета: {ticket.aircraft}</p>
                <p>Свободных мест: {ticket.availableSeats}</p>
              </div>
            </div>

            <div className={styles.bookingForm}>
              <h2>Забронировать билет</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Имя</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Фамилия</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Количество пассажиров</label>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    max={ticket.availableSeats}
                    value={formData.passengers}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.totalPrice}>
                  <h3>Итого к оплате:</h3>
                  <p>{ticket.price * formData.passengers} ₽</p>
                </div>

                <button type="submit" className={styles.submitButton}>
                  Забронировать
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
