import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';

interface FlightCardProps {
  flight: {
    id: number;
    FlightID: string;
    DepartureCity: string;
    ArrivalCity: string;
    DepartureAirport: string;
    ArrivalAirport: string;
    DepartureDate: string;
    Duration: string;
    Price: number;
    AvailableSeats: number;
  };
}

export const FlightCard = ({ flight }: FlightCardProps) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-BY', {
      style: 'currency',
      currency: 'BYN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleClick = () => {
    navigate(`/flights/${flight.id}`);
  };

  return (
    <div className={styles.flightCard} onClick={handleClick}>
      <div className={styles.cities}>
        <span className={styles.city}>{flight.DepartureCity}</span>
        <FaArrowRight className={styles.arrow} />
        <span className={styles.city}>{flight.ArrivalCity}</span>
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <FaCalendarAlt />
          {formatDate(flight.DepartureDate)}
        </div>
        <div className={styles.row}>
          <FaClock />В пути: {flight.Duration}
        </div>
        <div className={styles.row}>
          <FaMoneyBillWave />
          {formatPrice(flight.Price)}
        </div>
        <div className={styles.row}>
          <span className={styles.seats}>
            Свободно мест: {flight.AvailableSeats}
          </span>
        </div>
      </div>

      <button className={styles.bookButton}>Забронировать</button>
    </div>
  );
};
