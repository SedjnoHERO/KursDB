import styles from './style.module.scss';

interface FooterProps {
  type?: 'default' | 'thin';
}

export const Footer: React.FC<FooterProps> = ({ type = 'default' }) => {
  if (type === 'thin') {
    return (
      <footer className={`${styles.footer} ${styles.thin}`}>
        <div className={styles.copyright}>
          © 2024 AeroControl. Все права защищены.
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.contentContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Контакты</h3>
            <a href="tel:+78001234567">8 (800) 123-45-67</a>
            <a href="mailto:support@airtravel.com">support@aerocontrol.com</a>
          </div>
          <div className={styles.footerSection}>
            <h3>Информация</h3>
            <a href="/about">О компании</a>
            <a href="/terms">Условия</a>
            <a href="/privacy">Конфиденциальность</a>
          </div>
          <div className={styles.footerSection}>
            <h3>Подписка на новости</h3>
            <p>Получайте специальные предложения и новости компании</p>
            <div className={styles.subscribe}>
              <input type="email" placeholder="Ваш email" />
              <button>Подписаться</button>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2024 AeroControl. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
