import { FlightCard } from '@components';
import styles from './style.module.scss';
import { Link } from 'react-router-dom';

interface FlightSectionProps {
  columns?: 1 | 3 | 5;
  limit?: number;
  title?: string;
  type?: 'popular' | 'all';
}

export const FlightSection = ({
  columns = 3,
  limit,
  title,
  type,
}: FlightSectionProps) => {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <FlightCard amount={columns} limit={limit} />

      {type === 'popular' && (
        <Link to="/catalog">
          <button className={styles.button}>Посмотреть все</button>
        </Link>
      )}
    </section>
  );
};
