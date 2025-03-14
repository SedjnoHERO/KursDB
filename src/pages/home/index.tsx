import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { TableAPI } from '@api';
import { Skeleton, ServiceCard, FlightCard, SearchBox } from '@components';
import { Layout } from '@modules';

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

interface Option {
  value: string;
  label: string;
}

const services = [
  {
    icon: FaShieldAlt,
    title: 'Безопасность',
    description: 'Гарантируем безопасность на всех этапах вашего путешествия',
  },
  {
    icon: FaHeadset,
    title: 'Поддержка 24/7',
    description: 'Наша команда поддержки всегда готова помочь вам',
  },
  {
    icon: FaMoneyBillWave,
    title: 'Лучшие цены',
    description: 'Предлагаем конкурентные цены на все направления',
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const [popularFlights, setPopularFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ['services', 'destinations', 'about'];
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight * 0.75;
          if (isVisible) {
            section.classList.add(styles.visible);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        const airportOptions = formattedAirports.map(airport => ({
          value: airport.id.toString(),
          label:
            `${airport.City}${airport.Name ? ` (${airport.Name})` : ''}`.trim(),
        }));

        setAirports(airportOptions);

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
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (from: string, to: string, date: string) => {
    // Обработка поиска
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const navHeight =
        document.querySelector(`.${styles.nav}`)?.getBoundingClientRect()
          .height || 0;
      const offset =
        section.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      });

      closeMobileMenu();
    }
  };

  return (
    <Layout headerType="default">
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>Найдите идеальный рейс</h1>
          <p>Путешествуйте с комфортом в любую точку мира</p>
          <SearchBox onSearch={handleSearch} airports={airports} />
        </div>

        <section id="services" className={styles.services}>
          <div className={styles.contentContainer}>
            <h2>Наши услуги</h2>
            <div className={styles.serviceCards}>
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section id="destinations" className={styles.destinations}>
          <div className={styles.contentContainer}>
            <h2>Популярные направления</h2>
            <div className={styles.flightGrid}>
              {loading
                ? Array(6)
                    .fill(null)
                    .map((_, index) => <Skeleton key={index} type="flight" />)
                : popularFlights.map(flight => (
                    <FlightCard
                      key={flight.id}
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
                  ))}
            </div>
          </div>
        </section>

        <section id="about" className={styles.about}>
          <div className={styles.contentContainer}>
            <div className={styles.aboutContent}>
              <h2>О нашей компании</h2>
              <p>
                Мы - ведущая авиакомпания, предоставляющая высококачественные
                услуги по авиаперевозкам. Наша цель - сделать путешествия
                доступными и комфортными для каждого пассажира.
              </p>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <h3>100+</h3>
                  <p>Направлений</p>
                </div>
                <div className={styles.stat}>
                  <h3>1M+</h3>
                  <p>Довольных клиентов</p>
                </div>
                <div className={styles.stat}>
                  <h3>24/7</h3>
                  <p>Поддержка</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
