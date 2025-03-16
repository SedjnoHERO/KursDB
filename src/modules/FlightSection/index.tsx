import { FlightCard } from '@components';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

interface FlightSectionProps {
  title?: string;
  type?: 'popular' | 'all';
  flights?: {
    id: number;
    from: string;
    to: string;
    date: string;
    time: string;
    price: number;
    airline: string;
    aircraft: string;
  }[];
  showBookButton?: boolean;
}

export const FlightSection = ({
  title,
  type,
  flights,
  showBookButton,
}: FlightSectionProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveLimit = type === 'popular' && isMobile ? 3 : itemsPerPage;
  const totalItems = flights?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedFlights = flights?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const renderPagination = () => {
    if (type === 'popular' || totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          ←
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <FlightCard
        limit={effectiveLimit}
        offset={0}
        flights={paginatedFlights?.map(flight => ({
          id: flight.id,
          departure_city: flight.from,
          arrival_city: flight.to,
          departure_time: `${flight.date} ${flight.time}`,
          arrival_time: flight.date,
          price: flight.price,
          airline_name: flight.airline,
          aircraft_name: flight.aircraft,
        }))}
      />

      {type === 'popular' && (
        <Link to="/catalog" className={styles.button}>
          Посмотреть все
        </Link>
      )}

      {renderPagination()}
    </section>
  );
};
