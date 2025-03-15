import { FlightCard } from '@components';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

interface FlightSectionProps {
  title?: string;
  type?: 'popular' | 'all';
}

export const FlightSection = ({ title, type }: FlightSectionProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleTotalCountUpdate = (count: number) => {
    setTotalItems(count);
  };

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
        offset={type === 'popular' ? 0 : (currentPage - 1) * itemsPerPage}
        onTotalCountUpdate={handleTotalCountUpdate}
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
