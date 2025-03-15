import { useState } from 'react';
import { Layout, FlightSection } from '@modules';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import styles from './style.module.scss';

interface Filters {
  departureCity: string;
  arrivalCity: string;
  minPrice: string;
  maxPrice: string;
  dateFrom: string;
  dateTo: string;
}

export const Catalog = () => {
  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    departureCity: '',
    arrivalCity: '',
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: '',
  });

  // Сортировка
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Обработчики
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-') as [
      typeof sortBy,
      typeof sortOrder,
    ];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const clearFilters = () => {
    setFilters({
      departureCity: '',
      arrivalCity: '',
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <Layout footerType="thin">
      <div className={styles.catalogPage}>
        <div className={styles.contentContainer}>
          {/* Поиск и фильтры */}
          <div className={styles.controls}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInput}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Поиск рейсов..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filterButton}
              >
                <FaFilter /> Фильтры
              </button>
              <select onChange={handleSortChange} className={styles.sortSelect}>
                <option value="date-asc">По дате ↑</option>
                <option value="date-desc">По дате ↓</option>
                <option value="price-asc">По цене ↑</option>
                <option value="price-desc">По цене ↓</option>
                <option value="duration-asc">По длительности ↑</option>
                <option value="duration-desc">По длительности ↓</option>
              </select>
            </form>

            {/* Панель фильтров */}
            {showFilters && (
              <div className={styles.filtersPanel}>
                <div className={styles.filterGroup}>
                  <input
                    type="text"
                    name="departureCity"
                    placeholder="Город вылета"
                    value={filters.departureCity}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="text"
                    name="arrivalCity"
                    placeholder="Город прилета"
                    value={filters.arrivalCity}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Мин. цена"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Макс. цена"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <input
                    type="date"
                    name="dateFrom"
                    placeholder="Дата с"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="date"
                    name="dateTo"
                    placeholder="Дата по"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                  />
                </div>
                <button onClick={clearFilters} className={styles.clearButton}>
                  <FaTimes /> Сбросить
                </button>
              </div>
            )}
          </div>

          <div className={styles.flightsContainer}>
            <FlightSection />
          </div>
        </div>
      </div>
    </Layout>
  );
};
