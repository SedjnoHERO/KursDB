import { FlightCard } from '@components';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

interface FlightSectionProps {
  columns?: 1 | 3 | 5;
  limit?: number;
  title?: string;
  type?: 'popular' | 'all';
}

export const FlightSection = ({
  columns = 3,
  limit = 6,
  title,
  type,
}: FlightSectionProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mobileLimit = isMobile ? Math.min(3, limit) : limit;

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <FlightCard amount={columns} limit={mobileLimit} />

      {type === 'popular' && (
        <Link to="/catalog" className={styles.button}>
          Посмотреть все
        </Link>
      )}
    </section>
  );
};
