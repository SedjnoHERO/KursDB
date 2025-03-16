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

interface Flight {
  id: number;
  departure_city: string;
  arrival_city: string;
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
    City: string;
  };
  arrivalAirport: {
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
}

type SortField = 'price' | 'date' | 'airline';
type SortOrder = 'asc' | 'desc';

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
  });
  const [airlines, setAirlines] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Получение списка рейсов
  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await Supabase.from('FLIGHT').select(`
          FlightID,
          DepartureTime,
          ArrivalTime,
          departureAirport:AIRPORT!DepartureAirportID(City),
          arrivalAirport:AIRPORT!ArrivalAirportID(City),
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
            arrival_city: flight.arrivalAirport?.City || '',
            departure_time: new Date(flight.DepartureTime).toLocaleString(),
            arrival_time: new Date(flight.ArrivalTime).toLocaleString(),
            price: Math.min(...(flight.tickets?.map(t => t.Price) || [0])),
            airline_name: flight.airplane?.airline?.Name || '',
            aircraft_name: flight.airplane?.Model || '',
          }),
        );

        setFlights(formattedFlights);
        setFilteredFlights(formattedFlights);

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

    // Поиск по городам
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        flight =>
          flight.departure_city.toLowerCase().includes(query) ||
          flight.arrival_city.toLowerCase().includes(query),
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
      const filterDate = new Date(filters.date).toDateString();
      result = result.filter(
        flight => new Date(flight.departure_time).toDateString() === filterDate,
      );
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
    });
    setSearchQuery('');
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
    });
    setSortField('date');
    setSortOrder('asc');
    setShowFilters(false);
  };

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
                    value={filters.date}
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
                date: new Date(flight.departure_time).toLocaleDateString(),
                time: new Date(flight.departure_time).toLocaleTimeString(),
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
