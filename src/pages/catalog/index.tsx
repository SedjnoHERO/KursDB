import React, { useState, useEffect } from 'react';
import { Layout } from '@modules';
import { Supabase } from '@api';
import { toast } from 'sonner';
import { FlightSection } from '@modules';
import styles from './style.module.scss';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaUndo,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

interface Flight {
  id: number;
  departure_city: string;
  departure_airport_id: number;
  arrival_city: string;
  arrival_airport_id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  airline_name: string;
  aircraft_name: string;
}

interface RawFlight {
  FlightID: number;
  DepartureTime: string;
  ArrivalTime: string;
  departureAirport: {
    AirportID: number;
    City: string;
  };
  arrivalAirport: {
    AirportID: number;
    City: string;
  };
  airplane: {
    Model: string;
    airline: {
      Name: string;
    };
  };
  tickets: {
    Price: number;
  }[];
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  airline: string;
  date: string;
  departureCity: string;
  arrivalCity: string;
}

type SortField = 'price' | 'date' | 'airline';
type SortOrder = 'asc' | 'desc';

interface LocationState {
  from: string;
  to: string;
  date: string;
}

export const Catalog = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    airline: '',
    date: '',
    departureCity: '',
    arrivalCity: '',
  });
  const [airlines, setAirlines] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [departureCities, setDepartureCities] = useState<string[]>([]);
  const [arrivalCities, setArrivalCities] = useState<string[]>([]);
  const [filtersWereReset, setFiltersWereReset] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await Supabase.from('FLIGHT').select(`
          FlightID,
          DepartureTime,
          ArrivalTime,
          departureAirport:AIRPORT!DepartureAirportID(AirportID, City),
          arrivalAirport:AIRPORT!ArrivalAirportID(AirportID, City),
          airplane:AIRPLANE(
            Model,
            airline:AIRLINE(Name)
          ),
          tickets:TICKET(Price)
        `);

      if (error) throw error;

      if (data) {
        const formattedFlights = (data as unknown as RawFlight[]).map(
          flight => ({
            id: flight.FlightID,
            departure_city: flight.departureAirport?.City || '',
            departure_airport_id: flight.departureAirport?.AirportID || 0,
            arrival_city: flight.arrivalAirport?.City || '',
            arrival_airport_id: flight.arrivalAirport?.AirportID || 0,
            departure_time: new Date(flight.DepartureTime).toLocaleString(),
            arrival_time: new Date(flight.ArrivalTime).toLocaleString(),
            price: Math.min(...(flight.tickets?.map(t => t.Price) || [0])),
            airline_name: flight.airplane?.airline?.Name || '',
            aircraft_name: flight.airplane?.Model || '',
          }),
        );

        setFlights(formattedFlights);
        setFilteredFlights(formattedFlights);

        // Получаем города из location.state
        const state = location.state as LocationState;
        if (state?.from || state?.to) {
          // Преобразуем дату из DD.MM.YYYY в YYYY-MM-DD
          const dateParts = state.date ? state.date.split('.') : [];
          const formattedDate =
            dateParts.length === 3
              ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
              : '';

          // Находим города по ID из переданных параметров
          const fromCity = formattedFlights.find(
            f => f.departure_airport_id.toString() === state.from,
          )?.departure_city;

          const toCity = formattedFlights.find(
            f => f.arrival_airport_id.toString() === state.to,
          )?.arrival_city;

          // Устанавливаем найденные города в фильтры
          setFilters(prev => ({
            ...prev,
            departureCity: fromCity || '',
            arrivalCity: toCity || '',
            date: formattedDate,
          }));
          setShowFilters(true);
        }

        // Собираем уникальные города
        const uniqueDepartureCities = [
          ...new Set(formattedFlights.map(f => f.departure_city)),
        ];
        const uniqueArrivalCities = [
          ...new Set(formattedFlights.map(f => f.arrival_city)),
        ];
        setDepartureCities(uniqueDepartureCities);
        setArrivalCities(uniqueArrivalCities);

        // Собираем уникальные авиакомпании
        const uniqueAirlines = [
          ...new Set(formattedFlights.map(f => f.airline_name)),
        ];
        setAirlines(uniqueAirlines);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast.error('Ошибка при загрузке рейсов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Применение поиска, фильтров и сортировки
  useEffect(() => {
    let result = [...flights];

    // Фильтр по городу вылета
    if (filters.departureCity) {
      result = result.filter(flight =>
        flight.departure_city
          .toLowerCase()
          .includes(filters.departureCity.toLowerCase()),
      );
    }

    // Фильтр по городу прилета
    if (filters.arrivalCity) {
      result = result.filter(flight =>
        flight.arrival_city
          .toLowerCase()
          .includes(filters.arrivalCity.toLowerCase()),
      );
    }

    // Фильтр по цене
    if (filters.minPrice) {
      result = result.filter(
        flight => flight.price >= Number(filters.minPrice),
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        flight => flight.price <= Number(filters.maxPrice),
      );
    }

    // Фильтр по авиакомпании
    if (filters.airline) {
      result = result.filter(flight => flight.airline_name === filters.airline);
    }

    // Фильтр по дате
    if (filters.date) {
      const filterDate = new Date(filters.date);
      result = result.filter(flight => {
        const flightDate = new Date(flight.departure_time);
        return (
          flightDate.getFullYear() === filterDate.getFullYear() &&
          flightDate.getMonth() === filterDate.getMonth() &&
          flightDate.getDate() === filterDate.getDate()
        );
      });
    }

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'date':
          comparison =
            new Date(a.departure_time).getTime() -
            new Date(b.departure_time).getTime();
          break;
        case 'airline':
          comparison = a.airline_name.localeCompare(b.airline_name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFlights(result);
  }, [searchQuery, filters, flights, sortField, sortOrder]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      airline: '',
      date: '',
      departureCity: '',
      arrivalCity: '',
    });
    setSearchQuery('');
    setFiltersWereReset(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
  };

  const getSortLabel = () => {
    const labels = {
      price: 'Цена',
      date: 'Дата',
      airline: 'Авиакомпания',
    };
    return `${labels[sortField]} ${sortOrder === 'asc' ? '↑' : '↓'}`;
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const resetAll = () => {
    setSearchQuery('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      airline: '',
      date: '',
      departureCity: '',
      arrivalCity: '',
    });
    setSortField('date');
    setSortOrder('asc');
    setShowFilters(false);
  };

  useEffect(() => {
    const state = location.state as LocationState;

    if (state) {
      const dateParts = state.date ? state.date.split('.') : [];
      const formattedDate =
        dateParts.length === 3
          ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          : '';

      setFilters(prev => ({
        ...prev,
        departureCity: state.from,
        arrivalCity: state.to,
        date: formattedDate,
      }));
      setShowFilters(true);
    }
  }, [location]);

  return (
    <Layout headerType="default">
      <div className={styles.catalogPage}>
        <div className={styles.contentContainer}>
          <div className={styles.header}>
            <h1>Поиск рейсов</h1>
            <button className={styles.resetAllButton} onClick={resetAll}>
              <FaUndo />
              Сбросить все
            </button>
          </div>

          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Поиск по городам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearButton}
                  onClick={() => setSearchQuery('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className={styles.controls}>
              <button
                className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                Фильтры
              </button>

              <div className={styles.sortDropdown}>
                <button
                  className={styles.sortToggle}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <FaSort />
                  {getSortLabel()}
                </button>
                {showSortDropdown && (
                  <div className={styles.sortOptions}>
                    <button
                      className={`${styles.sortOption} ${sortField === 'price' ? styles.active : ''}`}
                      onClick={() => handleSort('price')}
                    >
                      Цена {renderSortIcon('price')}
                    </button>
                    <button
                      className={`${styles.sortOption} ${sortField === 'date' ? styles.active : ''}`}
                      onClick={() => handleSort('date')}
                    >
                      Дата {renderSortIcon('date')}
                    </button>
                    <button
                      className={`${styles.sortOption} ${sortField === 'airline' ? styles.active : ''}`}
                      onClick={() => handleSort('airline')}
                    >
                      Авиакомпания {renderSortIcon('airline')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filters}>
              <div className={styles.filterHeader}>
                <h3>Фильтры</h3>
                <button
                  className={styles.closeFilters}
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.filterContent}>
                <div className={styles.filterGroup}>
                  <label>Город вылета</label>
                  <select
                    name="departureCity"
                    value={
                      filters.departureCity ||
                      (location.state as LocationState)?.from ||
                      ''
                    }
                    onChange={handleFilterChange}
                  >
                    <option value="">Все города</option>
                    {departureCities.map(city => (
                      <option key={city} value={city}>
                        {city}{' '}
                        {city === (location.state as LocationState)?.from
                          ? '(выбран)'
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label>Город прилета</label>
                  <select
                    name="arrivalCity"
                    value={filters.arrivalCity}
                    onChange={handleFilterChange}
                  >
                    <option value="">Все города</option>
                    {arrivalCities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label>Цена</label>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="От"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="До"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <label>Авиакомпания</label>
                  <select
                    name="airline"
                    value={filters.airline}
                    onChange={handleFilterChange}
                  >
                    <option value="">Все авиакомпании</option>
                    {airlines.map(airline => (
                      <option key={airline} value={airline}>
                        {airline}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label>Дата вылета</label>
                  <input
                    type="date"
                    name="date"
                    value={
                      filtersWereReset
                        ? ''
                        : filters.date ||
                          ((location.state as LocationState)?.date
                            ? (location.state as LocationState).date
                                .split('.')
                                .reverse()
                                .join('-')
                            : '')
                    }
                    onChange={handleFilterChange}
                  />
                </div>

                <button className={styles.resetButton} onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : filteredFlights.length > 0 ? (
            <FlightSection
              flights={filteredFlights.map(flight => ({
                id: flight.id,
                from: flight.departure_city,
                to: flight.arrival_city,
                date: new Date(flight.departure_time).toLocaleDateString(
                  'ru-RU',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  },
                ),
                time: new Date(flight.departure_time).toLocaleTimeString(
                  'ru-RU',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                ),
                price: flight.price,
                airline: flight.airline_name,
                aircraft: flight.aircraft_name,
              }))}
              showBookButton
            />
          ) : (
            <div className={styles.noResults}>Рейсы не найдены</div>
          )}
        </div>
      </div>
    </Layout>
  );
};
