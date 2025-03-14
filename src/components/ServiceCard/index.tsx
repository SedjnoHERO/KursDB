import { IconType } from 'react-icons';
import styles from './style.module.scss';

interface ServiceCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
}: ServiceCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Icon />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
