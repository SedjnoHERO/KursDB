import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  FaPlane,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { Layout } from '@modules';
import { useAuth } from '@config';
import { TableAPI } from '@api';
import styles from './style.module.scss';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passengers: number;
}

interface TicketInfo {
  id: string | undefined;
  from: string;
  to: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  availableSeats: number;
  airline: string;
  aircraft: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-BY', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const RouteInfo: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <div className={styles.route}>
    <div className={styles.city}>
      <FaMapMarkerAlt />
      <div>
        <h3>{from}</h3>
        <p>Город отправления</p>
      </div>
    </div>

    <div className={styles.flightIcon}>
      <FaPlane />
    </div>

    <div className={styles.city}>
      <FaMapMarkerAlt />
      <div>
        <h3>{to}</h3>
        <p>Город прибытия</p>
      </div>
    </div>
  </div>
);

const FlightDetails: React.FC<{ ticket: TicketInfo }> = ({ ticket }) => (
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
        <p>{formatPrice(ticket.price)}</p>
      </div>
    </div>
  </div>
);

const AdditionalInfo = ({ ticket }: { ticket: TicketInfo }) => (
  <div className={styles.additionalInfo}>
    <h2>Детали рейса</h2>
    <p>Авиакомпания: {ticket.airline}</p>
    <p>Модель самолета: {ticket.aircraft}</p>
    <p>Свободных мест: {ticket.availableSeats}</p>
  </div>
);

const BookingForm = ({
  formData,
  ticket,
  onSubmit,
  onChange,
}: {
  formData: BookingFormData;
  ticket: TicketInfo;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className={styles.bookingForm}>
    <h2>Забронировать билет</h2>
    <form onSubmit={onSubmit}>
      <div className={styles.formGroup}>
        <label>Имя</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Фамилия</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Телефон</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChange}
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
          onChange={onChange}
          required
        />
      </div>

      <div className={styles.totalPrice}>
        <h3>Итого к оплате:</h3>
        <p>{formatPrice(ticket.price * formData.passengers)}</p>
      </div>

      <button type="submit" className={styles.submitButton}>
        Забронировать
      </button>
    </form>
  </div>
);

export const TicketDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passengers: 1,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const passengers = await TableAPI.fetchData('PASSENGER');
        const userPassenger = passengers.find(p => p.Email === user.email);

        if (userPassenger) {
          setFormData(prev => ({
            ...prev,
            firstName: userPassenger.FirstName || '',
            lastName: userPassenger.LastName || '',
            email: userPassenger.Email || user.email || '',
            phone: userPassenger.Phone || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const ticket: TicketInfo = {
    id: id,
    from: searchParams.get('from') || 'Не указан',
    to: searchParams.get('to') || 'Не указан',
    date: new Date(searchParams.get('date') || '').toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: new Date(searchParams.get('date') || '').toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: '1ч 30м',
    price: Number(searchParams.get('price')) || 0,
    availableSeats: 45,
    airline: searchParams.get('airline') || 'Не указана',
    aircraft: searchParams.get('aircraft') || 'Не указан',
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
                <RouteInfo from={ticket.from} to={ticket.to} />
                <FlightDetails ticket={ticket} />
              </div>

              <AdditionalInfo ticket={ticket} />
            </div>

            <BookingForm
              formData={formData}
              ticket={ticket}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
