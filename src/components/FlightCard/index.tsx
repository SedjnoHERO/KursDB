import { useEffect, useState } from 'react';
import { Supabase } from '@api';
import { Link } from 'react-router-dom';
import styles from './style.module.scss';

interface FlightCardProps {
  limit?: number;
  amount?: 1 | 3 | 5;
}

interface Flight {
  id: number;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  airline_name: string;
  aircraft_name: string;
}

interface RawFlight {
  FlightID: number;
  FlightNumber: string;
  DepartureTime: string;
  ArrivalTime: string;
  departureAirport: {
    City: string;
  };
  arrivalAirport: {
    City: string;
  };
  airplane: {
    Model: string;
    airline: {
      Name: string;
    };
  };
  tickets: {
    Price: number;
  }[];
}

const FlightCardSkeleton = () => (
  <div className={`${styles.card} ${styles.skeleton}`}>
    <div className={styles.mainInfo}>
      <div className={styles.cities}>
        <span className={styles.skeletonText}></span>
        <span className={styles.skeletonText}></span>
      </div>
      <div className={styles.times}>
        <span className={styles.skeletonText}></span>
        <span className={styles.skeletonText}></span>
      </div>
    </div>
    <div className={styles.additionalInfo}>
      <div className={styles.transport}>
        <span className={styles.skeletonText}></span>
        <span className={styles.skeletonText}></span>
      </div>
      <div className={styles.price}>
        <span className={styles.skeletonText}></span>
      </div>
    </div>
  </div>
);

export const FlightCard = ({ limit, amount = 3 }: FlightCardProps) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFlights();
  }, [limit]);

  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await Supabase.from('FLIGHT')
        .select(
          `
          FlightID,
          FlightNumber,
          DepartureTime,
          ArrivalTime,
          departureAirport:AIRPORT!DepartureAirportID(City),
          arrivalAirport:AIRPORT!ArrivalAirportID(City),
          airplane:AIRPLANE(
            Model,
            airline:AIRLINE(Name)
          ),
          tickets:TICKET(Price)
        `,
        )
        .limit(limit || 10);

      if (error) throw error;
      if (data) {
        const formattedFlights = (data as unknown as RawFlight[]).map(
          flight => ({
            id: flight.FlightID,
            departure_city: flight.departureAirport?.City || '',
            arrival_city: flight.arrivalAirport?.City || '',
            departure_time: flight.DepartureTime,
            arrival_time: flight.ArrivalTime,
            price: Math.min(...(flight.tickets?.map(t => t.Price) || [0])),
            airline_name: flight.airplane?.airline?.Name || '',
            aircraft_name: flight.airplane?.Model || '',
          }),
        );
        setFlights(formattedFlights);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles[`grid-${amount}`]}`}>
        {Array(limit || 10)
          .fill(0)
          .map((_, index) => (
            <FlightCardSkeleton key={index} />
          ))}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[`grid-${amount}`]}`}>
      {flights.map(flight => (
        <Link
          to={`/flight/${flight.id}`}
          key={flight.id}
          className={styles.card}
        >
          <div className={styles.mainInfo}>
            <div className={styles.cities}>
              <span>{flight.departure_city}</span>
              <span>{flight.arrival_city}</span>
            </div>
            <div className={styles.times}>
              <span>{formatDate(flight.departure_time)}</span>
              <span>{formatDate(flight.arrival_time)}</span>
            </div>
          </div>
          <div className={styles.additionalInfo}>
            <div className={styles.transport}>
              <span>{flight.airline_name}</span>
              <span>{flight.aircraft_name}</span>
            </div>
            <div className={styles.price}>
              <span>{formatPrice(flight.price)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
