import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  FaPlane,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowLeft,
} from 'react-icons/fa';
import { Layout } from '@modules';
import { useAuth } from '@config';
import { TableAPI, Supabase } from '@api';
import styles from './style.module.scss';
import { toast } from 'sonner';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

interface FlightWithAirplane {
  AIRPLANE: {
    Capacity: number;
  };
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

      <div className={styles.totalPrice}>
        <h3>Итого к оплате:</h3>
        <p>{formatPrice(ticket.price)}</p>
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
  const [availableSeats, setAvailableSeats] = useState<number>(0);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const isExistingTicket = searchParams.get('status') !== null;

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

  useEffect(() => {
    const fetchFlightData = async () => {
      if (!id) return;

      try {
        // Получаем информацию о самолете и его вместимости
        const { data: flightData } = await Supabase.from('FLIGHT')
          .select(
            `
            AIRPLANE:AirplaneID (
              Capacity
            )
          `,
          )
          .eq('FlightID', id)
          .single<FlightWithAirplane>();

        if (!flightData?.AIRPLANE?.Capacity) {
          console.error(
            'Не удалось получить информацию о вместимости самолета',
          );
          return;
        }

        // Получаем количество проданных билетов
        const { data: soldTickets } = await Supabase.from('TICKET')
          .select('TicketID')
          .eq('FlightID', id)
          .not('Status', 'eq', 'cancelled');

        const totalCapacity = flightData.AIRPLANE.Capacity;
        const soldSeats = soldTickets?.length || 0;
        setAvailableSeats(totalCapacity - soldSeats);
      } catch (error) {
        console.error('Error fetching flight data:', error);
      }
    };

    if (!isExistingTicket) {
      fetchFlightData();
    }
  }, [id, isExistingTicket]);

  const ticket: TicketInfo = {
    id: id,
    from: searchParams.get('from') || 'Не указан',
    to: searchParams.get('to') || 'Не указан',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    duration: '1ч 30м',
    price: Number(searchParams.get('price')) || 0,
    availableSeats: availableSeats,
    airline: searchParams.get('airline') || 'Не указана',
    aircraft: searchParams.get('aircraft') || 'Не указан',
  };

  const ticketStatus = searchParams.get('status');
  const seatNumber = searchParams.get('seatNumber');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !id) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    try {
      // Получаем данные пассажира
      const { data: passenger } = await Supabase.from('PASSENGER')
        .select('PassengerID')
        .eq('Email', user.email)
        .single();

      if (!passenger) {
        toast.error('Пассажир не найден');
        return;
      }

      // Получаем информацию о занятых местах
      const { data: existingTickets } = await Supabase.from('TICKET')
        .select('SeatNumber')
        .eq('FlightID', id)
        .not('Status', 'eq', 'cancelled');

      // Получаем вместимость самолета
      const { data: flightData } = await Supabase.from('FLIGHT')
        .select(
          `
          AIRPLANE:AirplaneID (
            Capacity
          )
        `,
        )
        .eq('FlightID', id)
        .single<FlightWithAirplane>();

      if (!flightData?.AIRPLANE?.Capacity) {
        toast.error('Не удалось получить информацию о рейсе');
        return;
      }

      const capacity = flightData.AIRPLANE.Capacity;
      const occupiedSeats = new Set(
        existingTickets?.map(t => t.SeatNumber) || [],
      );

      // Находим первое свободное место
      let seatNumber = '';
      for (let i = 1; i <= capacity; i++) {
        const seat = i.toString().padStart(2, '0');
        if (!occupiedSeats.has(seat)) {
          seatNumber = seat;
          break;
        }
      }

      if (!seatNumber) {
        toast.error('Нет свободных мест на рейс');
        return;
      }

      // Создаем новый билет
      const { data: ticket, error } = await Supabase.from('TICKET')
        .insert({
          PassengerID: passenger.PassengerID,
          FlightID: id,
          Status: 'booked',
          Price: Number(searchParams.get('price')) || 0,
          PurchaseDate: new Date().toISOString(),
          SeatNumber: seatNumber,
        })
        .select()
        .single();

      if (error) throw error;

      if (ticket) {
        toast.success('Билет успешно забронирован');
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Error booking ticket:', error);
      toast.error('Ошибка при бронировании билета');
    }
  };

  return (
    <Layout>
      <div className={styles.ticketPage}>
        <div className={styles.contentContainer}>
          <div className={styles.ticketDetail}>
            <div className={styles.ticketInfo}>
              {isExistingTicket && (
                <Link to="/profile" className={styles.backButton}>
                  <FaArrowLeft />
                  Назад
                </Link>
              )}
              <h1>Информация о {isExistingTicket ? 'билете' : 'рейсе'}</h1>

              <div className={styles.mainInfo}>
                <RouteInfo from={ticket.from} to={ticket.to} />
                <FlightDetails ticket={ticket} />
              </div>
              {!isExistingTicket && <AdditionalInfo ticket={ticket} />}
              {isExistingTicket && (
                <div className={styles.ticketStatus}>
                  <h2>Статус билета</h2>
                  <div
                    className={`${styles.status} ${styles[ticketStatus || '']}`}
                  >
                    {ticketStatus === 'booked' && 'Забронирован'}
                    {ticketStatus === 'checked-in' && 'Оплачен'}
                    {ticketStatus === 'canceled' && 'Отменен'}
                  </div>
                  {seatNumber && (
                    <p className={styles.seatNumber}>
                      Место в самолете: {seatNumber}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isExistingTicket && (
              <BookingForm
                formData={formData}
                ticket={ticket}
                onSubmit={handleSubmit}
                onChange={handleInputChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
