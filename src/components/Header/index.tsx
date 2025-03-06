import { FaUserCircle } from 'react-icons/fa';
import { EntityType } from '@api';
import styles from './style.module.scss';

interface MenuItem {
  type: EntityType;
  label: string;
}

interface IHeaderProps {
  activeType: EntityType;
  onTypeChange: (type: EntityType) => void;
}

export const Header: React.FC<IHeaderProps> = ({
  activeType,
  onTypeChange,
}) => {
  const menuItems: MenuItem[] = [
    { type: 'PASSENGER', label: 'Пассажиры' },
    { type: 'AIRPLANE', label: 'Самолёты' },
    { type: 'AIRLINE', label: 'Авиакомпании' },
    { type: 'TICKET', label: 'Билеты' },
    { type: 'FLIGHT', label: 'Рейсы' },
    { type: 'AIRPORT', label: 'Аэропорты' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <span className={styles.logo}>AeroControl</span>
        <nav className={styles.nav}>
          {menuItems.map(item => (
            <div
              key={item.type}
              className={`${styles.navItem} ${
                activeType === item.type ? styles.active : ''
              }`}
              onClick={() => onTypeChange(item.type)}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div className={styles.userInfo}>
          <FaUserCircle size={20} />
        </div>
      </div>
    </header>
  );
};
