import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes } from 'react-icons/fa';
import { EntityType } from '@api';
import { ProfileButton } from '../ProfileButton';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuItems: MenuItem[] = [
    { type: 'PASSENGER', label: 'Пассажиры' },
    { type: 'TICKET', label: 'Билеты' },
    { type: 'FLIGHT', label: 'Рейсы' },
    { type: 'AIRPLANE', label: 'Самолёты' },
    { type: 'AIRLINE', label: 'Авиакомпании' },
    { type: 'AIRPORT', label: 'Аэропорты' },
  ];

  const handleLogoClick = () => {
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.headerContent}>
      <span
        className={styles.logo}
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      >
        AeroControl
      </span>
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
      <div className={styles.rightSection}>
        <ProfileButton variant="admin" />
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
      >
        {menuItems.map(item => (
          <div
            key={item.type}
            className={`${activeType === item.type ? styles.active : ''}`}
            onClick={() => {
              onTypeChange(item.type);
              setIsMobileMenuOpen(false);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
      <Link
        to="/"
        className={location.pathname === '/' ? styles.active : ''}
        onClick={handleLinkClick}
      >
        Главная
      </Link>
      <Link
        to="/flights"
        className={location.pathname === '/flights' ? styles.active : ''}
        onClick={handleLinkClick}
      >
        Рейсы
      </Link>
      <Link
        to="/about"
        className={location.pathname === '/about' ? styles.active : ''}
        onClick={handleLinkClick}
      >
        О нас
      </Link>
      <Link
        to="/contact"
        className={location.pathname === '/contact' ? styles.active : ''}
        onClick={handleLinkClick}
      >
        Контакты
      </Link>
    </div>
  );
};

const DefaultHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);

      if (scrollPosition > 100) {
        setIsMenuVisible(false);
      } else {
        setIsMenuVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  return (
    <nav
      className={`${styles.defaultNav} ${isScrolled ? styles.scrolled : ''} ${
        !isMenuVisible ? styles.hidden : ''
      }`}
    >
      <div className={styles.contentContainer}>
        <Link to="/" className={styles.logo}>
          <FaPlane />
          <span>AeroControl</span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            to="/"
            className={location.pathname === '/' ? styles.active : ''}
          >
            Главная
          </Link>
          <Link
            to="/flights"
            className={location.pathname === '/flights' ? styles.active : ''}
          >
            Рейсы
          </Link>
          <Link
            to="/about"
            className={location.pathname === '/about' ? styles.active : ''}
          >
            О нас
          </Link>
          <Link
            to="/contact"
            className={location.pathname === '/contact' ? styles.active : ''}
          >
            Контакты
          </Link>
        </div>

        <div className={styles.rightSection}>
          <ProfileButton variant="default" />
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

const MinimalHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.defaultNav} ${styles.minimal} ${isScrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.contentContainer}>
        <Link to="/" className={styles.logo}>
          <FaPlane />
          <span>AeroControl</span>
        </Link>
        <div className={styles.rightSection}>
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
