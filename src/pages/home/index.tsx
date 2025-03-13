import { useNavigate } from 'react-router-dom';
import {
  FaPlane,
  FaCalendar,
  FaMapMarkerAlt,
  FaSearch,
  FaUserShield,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';
import styles from './style.module.scss';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <FaPlane />
            <span>AirService</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#services">Услуги</a>
            <a href="#about">О нас</a>
            <a href="#contacts">Контакты</a>
            <button
              onClick={() => navigate('/auth')}
              className={styles.authButton}
            >
              Войти
            </button>
          </div>
        </nav>

        <div className={styles.hero}>
          <h1>Путешествуйте с комфортом</h1>
          <p>Откройте для себя новые горизонты с нашей авиакомпанией</p>

          <div className={styles.searchBox}>
            <div className={styles.searchGroup}>
              <FaMapMarkerAlt />
              <input type="text" placeholder="Откуда" />
            </div>
            <div className={styles.searchGroup}>
              <FaMapMarkerAlt />
              <input type="text" placeholder="Куда" />
            </div>
            <div className={styles.searchGroup}>
              <FaCalendar />
              <input type="date" />
            </div>
            <button className={styles.searchButton}>
              <FaSearch />
              Найти билеты
            </button>
          </div>
        </div>
      </header>

      <section id="services" className={styles.services}>
        <h2>Наши преимущества</h2>
        <div className={styles.serviceCards}>
          <div className={styles.card}>
            <FaUserShield className={styles.icon} />
            <h3>Безопасность</h3>
            <p>
              Высочайшие стандарты безопасности и регулярное обслуживание
              самолетов
            </p>
          </div>
          <div className={styles.card}>
            <FaClock className={styles.icon} />
            <h3>Пунктуальность</h3>
            <p>98% рейсов выполняются точно по расписанию</p>
          </div>
          <div className={styles.card}>
            <FaMoneyBillWave className={styles.icon} />
            <h3>Лучшие цены</h3>
            <p>Доступные тарифы и специальные предложения для наших клиентов</p>
          </div>
        </div>
      </section>

      <section className={styles.destinations}>
        <h2>Популярные направления</h2>
        <div className={styles.destinationGrid}>
          {[
            { city: 'Париж', img: 'paris' },
            { city: 'Лондон', img: 'london' },
            { city: 'Нью-Йорк', img: 'newyork' },
            { city: 'Токио', img: 'tokyo' },
          ].map(({ city, img }) => (
            <div key={city} className={styles.destinationCard}>
              <img src={`/assets/images/destinations/${img}.jpg`} alt={city} />
              <div className={styles.destinationInfo}>
                <h3>{city}</h3>
                <button>Подробнее</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className={styles.about}>
        <div className={styles.aboutContent}>
          <h2>О нашей компании</h2>
          <p>
            Мы предоставляем качественные услуги авиаперевозок уже более 15 лет.
            Наш флот состоит из современных самолетов, а команда профессионалов
            обеспечивает комфорт и безопасность каждого полета.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <h3>15+</h3>
              <p>Лет опыта</p>
            </div>
            <div className={styles.stat}>
              <h3>100+</h3>
              <p>Направлений</p>
            </div>
            <div className={styles.stat}>
              <h3>1M+</h3>
              <p>Пассажиров</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacts" className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Контакты</h3>
            <p>Email: info@airservice.com</p>
            <p>Телефон: +375 29 123-45-67</p>
            <p>Адрес: ул. Примерная, 123</p>
          </div>
          <div className={styles.footerSection}>
            <h3>Информация</h3>
            <a href="#">О компании</a>
            <a href="#">Правила перевозки</a>
            <a href="#">Конфиденциальность</a>
          </div>
          <div className={styles.footerSection}>
            <h3>Подписка</h3>
            <p>Получайте специальные предложения</p>
            <div className={styles.subscribe}>
              <input type="email" placeholder="Ваш email" />
              <button>Подписаться</button>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2024 AirService. Все права защищены
        </div>
      </footer>
    </div>
  );
};
