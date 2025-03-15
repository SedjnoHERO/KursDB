import { useState, useEffect } from 'react';
import { FaPlane, FaBars, FaTimes } from 'react-icons/fa';
import { EntityType } from '@api';
import { ProfileButton } from '@components';
import styles from './style.module.scss';

interface MenuItem {
  type: EntityType;
  label: string;
}

interface IHeaderProps {
  type: 'default' | 'admin' | 'minimal';
  activeType?: EntityType;
  onTypeChange?: (type: EntityType) => void;
}

interface IAdminHeaderProps {
  activeType: EntityType;
  onTypeChange: (type: EntityType) => void;
}

const AdminHeader = ({ activeType, onTypeChange }: IAdminHeaderProps) => {
  const menuItems: MenuItem[] = [
    { type: 'PASSENGER', label: 'Пассажиры' },
    { type: 'TICKET', label: 'Билеты' },
    { type: 'FLIGHT', label: 'Рейсы' },
    { type: 'AIRPLANE', label: 'Самолёты' },
    { type: 'AIRLINE', label: 'Авиакомпании' },
    { type: 'AIRPORT', label: 'Аэропорты' },
  ];

  return (
    <div className={styles.headerContent}>
      <span className={styles.logo}>AeroControl</span>
      <nav className={styles.nav}>
        {menuItems.map(item => (
          <div
            key={item.type}
            className={`${styles.navItem} ${activeType === item.type ? styles.active : ''}`}
            onClick={() => onTypeChange(item.type)}
          >
            {item.label}
          </div>
        ))}
      </nav>
      <ProfileButton variant="admin" />
    </div>
  );
};

const DefaultHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth <= 768 && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const navHeight =
        document.querySelector(`.${styles.nav}`)?.getBoundingClientRect()
          .height || 0;
      const offset =
        section.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      });

      closeMobileMenu();
    }
  };

  return (
    <nav
      className={`${styles.defaultNav} ${isScrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.contentContainer}>
        <a href="/" className={styles.logo}>
          <FaPlane />
          AeroControl
        </a>
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Меню"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div
          className={`${styles.navLinks} ${isMobileMenuOpen ? styles.open : ''}`}
        >
          <a href="#services" onClick={scrollToSection('services')}>
            Услуги
          </a>
          <a href="#destinations" onClick={scrollToSection('destinations')}>
            Направления
          </a>
          <a href="#about" onClick={scrollToSection('about')}>
            О нас
          </a>
          <ProfileButton variant="default" />
        </div>
      </div>
    </nav>
  );
};

const MinimalHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.defaultNav} ${isScrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.contentContainer}>
        <a href="/" className={styles.logo}>
          <FaPlane />
          AeroControl
        </a>
        <div className={styles.navLinks}>
          <ProfileButton variant="minimal" />
        </div>
      </div>
    </nav>
  );
};

export const Header = ({
  type = 'default',
  activeType,
  onTypeChange,
}: IHeaderProps) => {
  return (
    <header
      className={`${styles.header} ${type === 'admin' ? styles.adminHeader : ''}`}
    >
      {type === 'default' ? (
        <DefaultHeader />
      ) : type === 'admin' ? (
        <AdminHeader
          activeType={activeType || 'PASSENGER'}
          onTypeChange={onTypeChange || (() => {})}
        />
      ) : (
        <MinimalHeader />
      )}
    </header>
  );
};
