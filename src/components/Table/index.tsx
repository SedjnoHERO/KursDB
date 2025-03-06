import React, { useEffect, useState } from 'react';
import { Supabase } from '@api';
import styles from './style.module.scss';
import {
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from 'react-icons/fa';
import { Button, Screen } from '@components';
import { toast } from 'sonner';
import { TABLE_TRANSLATIONS } from '@config';

interface ITableProps {
  type: 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';
}

export const TableComponent: React.FC<ITableProps> = ({ type }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await Supabase.from(type).select('*');
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
        setData(data);
        setFilteredData(data);
      }
    };

    fetchData();
  }, [type]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredData(data);
      return;
    }

    const searchResults = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(query.toLowerCase()),
      ),
    );
    setFilteredData(searchResults);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);

  const getColumnName = (column: string) => {
    return (
      (TABLE_TRANSLATIONS[type].columns as Record<string, string>)[column] ||
      column
    );
  };

  const setType = (newType: ITableProps['type']) => {
    setCurrentPage(1);
    setSearchQuery('');
    setIsSearching(false);
    setData([]);
    setFilteredData([]);
    setColumns([]);
    // You can add any additional logic needed when changing the type
  };

  return (
    <Screen>
      <div className={styles.container}>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <h2 className={styles.title}>{TABLE_TRANSLATIONS[type].name}</h2>
            <div className={styles.actions}>
              {isSearching ? (
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Поиск..."
                    className={styles.searchInput}
                    autoFocus
                  />
                  <button
                    className={styles.clearSearch}
                    onClick={() => {
                      setIsSearching(false);
                      handleSearch('');
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<FaSearch />}
                  label="Поиск"
                  onClick={() => setIsSearching(true)}
                />
              )}
              <Button
                variant="primary"
                leftIcon={<FaPlus />}
                label="Добавить"
                onClick={() => toast('Добавление...', { icon: '✨' })}
              />
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{getColumnName(column)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .slice(startIndex, endIndex)
                  .map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column, colIndex) => (
                        <td key={colIndex}>{row[column]}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Показано {startIndex + 1}-{endIndex} из {filteredData.length}{' '}
              записей
            </div>
            <div className={styles.pageControls}>
              <Button
                variant="outline"
                leftIcon={<FaChevronLeft />}
                label="Назад"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              />
              <span className={styles.pageNumber}>
                {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                leftIcon={<FaChevronRight />}
                label="Вперёд"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
};
