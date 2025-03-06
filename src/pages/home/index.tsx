import { useState } from 'react';
import { TableComponent } from '@components';
import styles from './style.module.scss';
import { FaUserCircle } from 'react-icons/fa';

type EntityType =
  | 'AIRPORT'
  | 'AIRPLANE'
  | 'AIRLINE'
  | 'FLIGHT'
  | 'TICKET'
  | 'PASSENGER';

interface MenuItem {
  type: EntityType;
  label: string;
}

export const Home = () => {
  const [type, setType] = useState<EntityType>('PASSENGER');

  const menuItems: MenuItem[] = [
    { type: 'PASSENGER', label: 'Пассажиры' },
    { type: 'AIRPLANE', label: 'Самолёты' },
    { type: 'AIRLINE', label: 'Авиакомпании' },
    { type: 'TICKET', label: 'Билеты' },
    { type: 'FLIGHT', label: 'Рейсы' },
    { type: 'AIRPORT', label: 'Аэропорты' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.logo}>AeroControl</span>
          <nav className={styles.nav}>
            {menuItems.map(item => (
              <div
                key={item.type}
                className={`${styles.navItem} ${
                  type === item.type ? styles.active : ''
                }`}
                onClick={() => setType(item.type)}
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

      <main className={styles.content}>
        <TableComponent type={type} />
      </main>
    </div>
  );
};
