import { useState, useEffect } from 'react';
import { Layout, FlightCard } from '@modules';
import { FaSearch, FaFilter, FaSortAmountDown, FaTimes } from 'react-icons/fa';
import { TableAPI, Supabase } from '@api';
import styles from './style.module.scss';

interface Flight {
  id: number;
  FlightID: string;
  DepartureCity: string;
  ArrivalCity: string;
  DepartureAirport: string;
  ArrivalAirport: string;
  DepartureDate: string;
  Duration: string;
  Price: number;
  AvailableSeats: number;
}

interface Filters {
  departureCity: string;
  arrivalCity: string;
  minPrice: string;
  maxPrice: string;
  dateFrom: string;
  dateTo: string;
}

export const Catalog = () => {
  // Состояния
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

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

  // Загрузка данных
  const fetchFlights = async () => {
    setLoading(true);
    try {
      let query = Supabase.from('FLIGHT').select(`
          *,
          DepartureAirport:AIRPORT!DepartureAirportID(City),
          ArrivalAirport:AIRPORT!ArrivalAirportID(City)
        `);

      // Применяем фильтры
      if (filters.departureCity) {
        query = query.ilike(
          'DepartureAirport.City',
          `%${filters.departureCity}%`,
        );
      }
      if (filters.arrivalCity) {
        query = query.ilike('ArrivalAirport.City', `%${filters.arrivalCity}%`);
      }
      if (filters.minPrice) {
        query = query.gte('Price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('Price', filters.maxPrice);
      }
      if (filters.dateFrom) {
        query = query.gte('DepartureTime', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('DepartureTime', filters.dateTo);
      }

      // Поиск
      if (searchQuery) {
        query = query.or(`
          DepartureAirport.City.ilike.%${searchQuery}%,
          ArrivalAirport.City.ilike.%${searchQuery}%
        `);
      }

      // Сортировка
      const sortField =
        sortBy === 'date'
          ? 'DepartureTime'
          : sortBy === 'price'
            ? 'Price'
            : 'Duration';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Пагинация
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      // Преобразуем данные в нужный формат
      const formattedFlights = data.map(flight => ({
        id: flight.FlightID,
        FlightID: flight.FlightNumber,
        DepartureCity: flight.DepartureAirport.City,
        ArrivalCity: flight.ArrivalAirport.City,
        DepartureAirport: flight.DepartureAirport.Name,
        ArrivalAirport: flight.ArrivalAirport.Name,
        DepartureDate: flight.DepartureTime,
        Duration: calculateDuration(flight.DepartureTime, flight.ArrivalTime),
        Price: flight.Price,
        AvailableSeats: flight.Capacity - (flight.BookedSeats || 0),
      }));

      setFlights(formattedFlights);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (err) {
      setError('Ошибка при загрузке рейсов');
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const start = new Date(departure);
    const end = new Date(arrival);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  useEffect(() => {
    fetchFlights();
  }, [currentPage, searchQuery, sortBy, sortOrder, filters]);

  // Обработчики
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFlights();
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
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <Layout>
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

          {/* Список рейсов */}
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : flights.length === 0 ? (
            <div className={styles.empty}>Рейсы не найдены</div>
          ) : (
            <div className={styles.flightsList}>
              {flights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}

          {/* Пагинация */}
          {!loading && !error && flights.length > 0 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {renderPagination()}
              <button
                className={styles.pageButton}
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
