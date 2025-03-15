import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableAPI } from '@api';
import { FlightCard } from '@modules';
import { Skeleton } from '@components';
import styles from './style.module.scss';

interface Airport {
  id: number;
  City: string;
  Country: string;
  Name: string;
}

interface Flight {
  id: number;
  FlightNumber: string;
  DepartureAirportId: number;
  ArrivalAirportId: number;
  DepartureTime: string;
  ArrivalTime: string;
  Price: number;
  AvailableSeats: number;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
}

interface RawAirport {
  AirportID: number;
  Name: string;
  City: string;
  Country: string;
  Code: string;
}

interface RawFlight {
  FlightID: number;
  FlightNumber: string;
  AirplaneID: number;
  DepartureAirportID: number;
  ArrivalAirportID: number;
  DepartureTime: string;
  ArrivalTime: string;
}

interface RawTicket {
  TicketID: number;
  FlightID: number;
  PassengerID: number | null;
  Price: number;
}

interface RawAirplane {
  AirplaneID: number;
  Capacity: number;
}

export const Popular = () => {
  const navigate = useNavigate();
  const [popularFlights, setPopularFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          flightsResponse,
          airportsResponse,
          ticketsResponse,
          airplanesResponse,
        ] = await Promise.all([
          TableAPI.fetchData('FLIGHT'),
          TableAPI.fetchData('AIRPORT'),
          TableAPI.fetchData('TICKET'),
          TableAPI.fetchData('AIRPLANE'),
        ]);

        if (
          !Array.isArray(flightsResponse) ||
          !Array.isArray(airportsResponse) ||
          !Array.isArray(ticketsResponse) ||
          !Array.isArray(airplanesResponse)
        ) {
          throw new Error('Неверный формат ответа от API');
        }

        const rawTickets = ticketsResponse as unknown as RawTicket[];
        const rawAirplanes = airplanesResponse as unknown as RawAirplane[];
        const rawAirports = airportsResponse as unknown as RawAirport[];

        const formattedAirports = rawAirports
          .filter(airport => {
            const isValid =
              airport &&
              typeof airport.AirportID === 'number' &&
              typeof airport.City === 'string' &&
              airport.City.length > 0;
            return isValid;
          })
          .map(
            (airport): Airport => ({
              id: airport.AirportID,
              City: airport.City.trim(),
              Country: airport.Country.trim(),
              Name: airport.Name.trim(),
            }),
          );

        if (formattedAirports.length === 0) {
          throw new Error('Нет данных об аэропортах после обработки');
        }

        const rawFlights = flightsResponse as unknown as RawFlight[];

        const formattedFlights = rawFlights
          .filter(flight => {
            const isValid =
              flight &&
              typeof flight.FlightID === 'number' &&
              flight.DepartureTime &&
              typeof flight.DepartureAirportID === 'number' &&
              typeof flight.ArrivalAirportID === 'number';
            return isValid;
          })
          .map((flight): Flight => {
            const flightTickets = rawTickets.filter(
              ticket => ticket.FlightID === flight.FlightID,
            );

            const airplane = rawAirplanes.find(
              plane => plane.AirplaneID === flight.AirplaneID,
            );

            const soldTickets = flightTickets.filter(
              ticket => ticket.PassengerID !== null,
            ).length;

            const minPrice = Math.min(
              ...flightTickets.map(ticket => ticket.Price),
            );

            return {
              id: flight.FlightID,
              FlightNumber: (flight.FlightNumber || '').trim(),
              DepartureAirportId: flight.DepartureAirportID,
              ArrivalAirportId: flight.ArrivalAirportID,
              DepartureTime: flight.DepartureTime,
              ArrivalTime: (flight.ArrivalTime || '').trim(),
              Price: minPrice || 0,
              AvailableSeats: (airplane?.Capacity || 0) - soldTickets,
            };
          });

        const upcomingFlights = formattedFlights
          .filter(flight => {
            try {
              const departureDate = new Date(flight.DepartureTime);
              return (
                !isNaN(departureDate.getTime()) && departureDate > new Date()
              );
            } catch (error) {
              return false;
            }
          })
          .sort(
            (a, b) =>
              new Date(a.DepartureTime).getTime() -
              new Date(b.DepartureTime).getTime(),
          )
          .slice(0, 6)
          .map(flight => ({
            ...flight,
            departureAirport: formattedAirports.find(
              a => a.id === flight.DepartureAirportId,
            ),
            arrivalAirport: formattedAirports.find(
              a => a.id === flight.ArrivalAirportId,
            ),
          }))
          .filter(flight => flight.departureAirport && flight.arrivalAirport);

        setPopularFlights(upcomingFlights);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPopularFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className={styles.popular}>
      <h2 className={styles.title}>Популярные направления</h2>
      <div className={styles.container}>
        {loading
          ? Array(6)
              .fill(null)
              .map((_, index) => <Skeleton key={index} type="flight" />)
          : popularFlights.map(flight => (
              <div key={flight.id} className={styles.flightCard}>
                <FlightCard
                  flight={{
                    id: flight.id,
                    FlightID: flight.FlightNumber,
                    DepartureCity: flight.departureAirport?.City || '',
                    ArrivalCity: flight.arrivalAirport?.City || '',
                    DepartureAirport: flight.departureAirport?.Name || '',
                    ArrivalAirport: flight.arrivalAirport?.Name || '',
                    DepartureDate: flight.DepartureTime,
                    Duration:
                      Math.abs(
                        (new Date(flight.ArrivalTime).getTime() -
                          new Date(flight.DepartureTime).getTime()) /
                          (1000 * 60),
                      ) + ' мин',
                    Price: flight.Price,
                    AvailableSeats: flight.AvailableSeats,
                  }}
                />
              </div>
            ))}
      </div>
      <button
        className={styles.authButton}
        onClick={() => navigate('/catalog')}
      >
        Смотреть все рейсы
      </button>
    </section>
  );
};
