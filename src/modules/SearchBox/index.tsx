import { useState } from 'react';
import { Selector } from '@components';
import {
  FaPlaneArrival,
  FaPlaneDeparture,
  FaCalendarAlt,
} from 'react-icons/fa';
import styles from './style.module.scss';

interface Option {
  value: string;
  label: string;
}

interface SearchBoxProps {
  onSearch: (from: string, to: string, date: string) => void;
  airports: Option[];
}

export const SearchBox = ({ onSearch, airports }: SearchBoxProps) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      onSearch(from, to, date);
    }
  };

  const handleFromChange = (value: string) => {
    setFrom(value);
    if (value === to) setTo('');
  };

  const handleToChange = (value: string) => {
    setTo(value);
    if (value === from) setFrom('');
  };

  return (
    <form className={styles.searchBox} onSubmit={handleSubmit}>
      <div className={styles.searchGroup}>
        <FaPlaneDeparture />
        <Selector
          value={from}
          onChange={value => handleFromChange(value)}
          placeholder="Откуда"
          className={styles.input}
          options={airports}
        />
      </div>

      <div className={styles.searchGroup}>
        <FaPlaneArrival />
        <Selector
          value={to}
          onChange={value => handleToChange(value)}
          placeholder="Куда"
          className={styles.input}
          options={airports}
        />
      </div>

      <div className={styles.searchGroup}>
        <FaCalendarAlt />
        <Selector
          type="date"
          value={date}
          onChange={value => setDate(value)}
          placeholder="Дата вылета"
          className={styles.input}
          options={[]}
        />
      </div>

      <button
        type="submit"
        className={styles.searchButton}
        disabled={!from || !to || !date}
      >
        Найти рейсы
      </button>
    </form>
  );
};
