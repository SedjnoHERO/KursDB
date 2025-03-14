import { FlightCard } from '../FlightCard';
import styles from './style.module.scss';

interface PopularProps {
  flights: Array<{
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
  }>;
}

export const Popular = ({ flights }: PopularProps) => {
  return (
    <section className={styles.popular}>
      <h2 className={styles.title}>Популярные направления</h2>
      <div className={styles.container}>
        {flights.map(flight => (
          <div key={flight.FlightID} className={styles.flightCard}>
            <FlightCard flight={flight} />
          </div>
        ))}
      </div>
    </section>
  );
};
