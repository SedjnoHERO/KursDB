import { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { TableAPI } from '@api';
import { ServiceCard, SearchBox, FlightSection } from '@modules';
import { Layout } from '@modules';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.scss';

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
  const [airports, setAirports] = useState<Option[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

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
    const fetchAirports = async () => {
      try {
        const airportsResponse = await TableAPI.fetchData('AIRPORT');

        if (!Array.isArray(airportsResponse)) {
          throw new Error('Неверный формат ответа от API');
        }

        const formattedAirports = airportsResponse
          .filter(airport => {
            const isValid =
              airport &&
              typeof airport.AirportID === 'number' &&
              typeof airport.City === 'string' &&
              airport.City.length > 0;
            return isValid;
          })
          .map(airport => ({
            value: airport.AirportID.toString(),
            label:
              `${airport.City}${airport.Name ? ` (${airport.Name})` : ''}`.trim(),
          }));

        setAirports(formattedAirports);
      } catch (error) {
        console.error('Error fetching airports:', error);
        setAirports([]);
      }
    };

    fetchAirports();
  }, []);

  const handleSearch = (from: string, to: string, date: string) => {
    // Вместо параметров URL используем state для навигации
    navigate('/catalog', {
      state: {
        from,
        to,
        date,
      },
    });
  };

  return (
    <Layout headerType="default" footerType="default">
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
            <FlightSection type="popular" title="Популярные направления" />
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
