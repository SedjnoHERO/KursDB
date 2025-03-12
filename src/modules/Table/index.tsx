import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSort,
} from 'react-icons/fa';
import { Button, Modal, Skeleton, Selector, RangeSelector } from '@components';
import { TableAPI, EntityType } from '@api';
import { TABLE_TRANSLATIONS, VALUE_TRANSLATIONS } from '@config';
import { toast } from 'sonner';
import styles from './style.module.scss';

interface ITableProps {
  type: EntityType;
}

export const TableComponent: React.FC<ITableProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const currentTypeRef = useRef(type);

  const idFields: Record<EntityType, string> = {
    AIRPORT: 'AirportID',
    AIRLINE: 'AirlineID',
    AIRPLANE: 'AirplaneID',
    FLIGHT: 'FlightID',
    TICKET: 'TicketID',
    PASSENGER: 'PassengerID',
  };

  const resetState = useCallback(() => {
    setData([]);
    setColumns([]);
    setFilteredData([]);
    setCurrentPage(1);
    setSelectedRow(null);
    setFormData({});
    setSearchQuery('');
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsLoading(false);
    toast.dismiss();
  }, []);

  const fetchTableData = useCallback(async () => {
    try {
      setIsLoading(true);
      toast.loading('Идет загрузка, пожалуйста подождите...', {
        position: 'bottom-right',
        duration: Infinity,
      });

      const currentType = type;
      const fetchedData = await TableAPI.fetchData(type);

      if (currentType !== type || type !== currentTypeRef.current) {
        return;
      }

      setData([]);
      setFilteredData([]);
      setColumns([]);

      setTimeout(() => {
        if (currentType === type && type === currentTypeRef.current) {
          if (Array.isArray(fetchedData) && fetchedData.length > 0) {
            const validColumns = Object.keys(fetchedData[0]);
            setColumns(validColumns);
            setData(fetchedData);
            setFilteredData(fetchedData);
          }
          setIsLoading(false);
          toast.dismiss();
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (type === currentTypeRef.current) {
        setColumns([]);
        setData([]);
        setFilteredData([]);
        setIsLoading(false);
        toast.dismiss();
      }
    }
  }, [type]);

  useEffect(() => {
    const prevType = currentTypeRef.current;
    currentTypeRef.current = type;

    if (prevType === 'TICKET' && type === 'FLIGHT') {
      resetState();
      setTimeout(() => {
        fetchTableData();
      }, 100);
    } else {
      resetState();
      fetchTableData();
    }
  }, [type, resetState, fetchTableData]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
      setFilteredData(filtered);
    }
  }, [data, searchQuery]);

  const validateFormData = (
    formData: any,
    columns: string[],
    idFields: Record<EntityType, string>,
    type: EntityType,
  ): boolean => {
    const requiredFields = columns.filter(
      column => column !== idFields[type] && column !== 'created_at',
    );

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        toast.error(`Поле "${field}" не может быть пустым`);
        return false;
      }

      // Пример валидации для конкретных полей
      if (field === 'Email' && !/\S+@\S+\.\S+/.test(formData[field])) {
        toast.error('Некорректный формат email');
        return false;
      }

      if (field === 'Phone' && !/^\+?\d{10,15}$/.test(formData[field])) {
        toast.error('Некорректный формат телефона');
        return false;
      }
    }

    return true;
  };

  const handleAdd = async () => {
    console.log('Attempting to add record:', formData);

    if (!validateFormData(formData, columns, idFields, type)) {
      console.log('Validation failed');
      return;
    }

    try {
      const result = await TableAPI.createRecord(type, formData);
      if (result) {
        console.log('Record added successfully:', result);
        setIsAddModalOpen(false);
        setFormData({});
        fetchTableData();
      } else {
        console.log('Failed to add record');
      }
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedRow || !selectedRow[idFields[type]]) return;

    const updateData = { ...formData };
    delete updateData[idFields[type]];

    const result = await TableAPI.updateRecord(
      type,
      selectedRow[idFields[type]],
      updateData,
    );

    if (result) {
      setIsEditModalOpen(false);
      setSelectedRow(null);
      setFormData({});
      fetchTableData();
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || !selectedRow[idFields[type]]) return;

    try {
      const result = await TableAPI.deleteRecord(
        type,
        selectedRow[idFields[type]],
      );

      if (result) {
        setIsDeleteModalOpen(false);
        setSelectedRow(null);
        await fetchTableData();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const renderActionButtons = (row: any) => (
    <td className={styles.actions}>
      <Button
        variant="outline"
        leftIcon={<FaEdit />}
        label="Изменить"
        onClick={() => {
          setSelectedRow(row);
          setFormData(row);
          setIsEditModalOpen(true);
        }}
      />
      <Button
        variant="outline"
        leftIcon={<FaTrash />}
        label="Удалить"
        onClick={() => {
          setSelectedRow(row);
          setIsDeleteModalOpen(true);
        }}
      />
    </td>
  );

  const genderOptions = [
    { value: 'Male', label: 'Мужской' },
    { value: 'Female', label: 'Женский' },
  ];

  const roleOptions = [
    { value: 'admin', label: 'Администратор' },
    { value: 'user', label: 'Пользователь' },
  ];

  const renderForm = (
    onSubmit: () => void,
    columns: string[],
    formData: any,
    setFormData: React.Dispatch<React.SetStateAction<any>>,
    idFields: Record<EntityType, string>,
    type: EntityType,
  ) => {
    const formFields = columns.filter(
      column => column !== idFields[type] && column !== 'created_at',
    );

    const half = Math.ceil(formFields.length / 2);
    const leftFields = formFields.slice(0, half);
    const rightFields = formFields.slice(half);

    return (
      <div className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formColumn}>
            {leftFields.map(column => {
              const columnLabel =
                TABLE_TRANSLATIONS[type]?.columns?.[
                  column as keyof (typeof TABLE_TRANSLATIONS)[typeof type]['columns']
                ] || column;

              if (column === 'Gender') {
                return (
                  <div key={`field-${column}`} className={styles.field}>
                    <label>{columnLabel}</label>
                    <Selector
                      options={genderOptions}
                      onChange={value =>
                        setFormData({ ...formData, [column]: value })
                      }
                    />
                  </div>
                );
              }

              if (column === 'Role') {
                return (
                  <div key={`field-${column}`} className={styles.field}>
                    <label>{columnLabel}</label>
                    <Selector
                      options={roleOptions}
                      onChange={value =>
                        setFormData({ ...formData, [column]: value })
                      }
                    />
                  </div>
                );
              }

              if (column === 'DateOfBirth') {
                return (
                  <div key={`field-${column}`} className={styles.field}>
                    <label>{columnLabel}</label>
                    <input
                      type="date"
                      value={formData[column] || ''}
                      onChange={e =>
                        setFormData({ ...formData, [column]: e.target.value })
                      }
                    />
                  </div>
                );
              }

              return (
                <div key={`field-${column}`} className={styles.field}>
                  <label>{columnLabel}</label>
                  <input
                    type="text"
                    value={formData[column] || ''}
                    onChange={e =>
                      setFormData({ ...formData, [column]: e.target.value })
                    }
                    placeholder={`Введите ${columnLabel.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles.formColumn}>
            {rightFields.map(column => {
              const columnLabel =
                TABLE_TRANSLATIONS[type]?.columns?.[
                  column as keyof (typeof TABLE_TRANSLATIONS)[typeof type]['columns']
                ] || column;

              return (
                <div key={`field-${column}`} className={styles.field}>
                  <label>{columnLabel}</label>
                  <input
                    type="text"
                    value={formData[column] || ''}
                    onChange={e =>
                      setFormData({ ...formData, [column]: e.target.value })
                    }
                    placeholder={`Введите ${columnLabel.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" label="Сохранить" onClick={onSubmit} />
          <Button
            variant="outline"
            label="Отмена"
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              setFormData({});
            }}
          />
        </div>
      </div>
    );
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);

  const formatCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';

    if (column.includes('Time') || column.includes('Date')) {
      try {
        const date = new Date(value);
        return date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return value;
      }
    }

    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }

    if (column === 'Gender' && typeof value === 'string') {
      return (
        VALUE_TRANSLATIONS.Gender[
          value as keyof typeof VALUE_TRANSLATIONS.Gender
        ] || value
      );
    }

    if (column === 'Role' && typeof value === 'string') {
      return (
        VALUE_TRANSLATIONS.Role[
          value as keyof typeof VALUE_TRANSLATIONS.Role
        ] || value
      );
    }

    if (column === 'Status' && typeof value === 'string') {
      return (
        VALUE_TRANSLATIONS.Status[
          value as keyof typeof VALUE_TRANSLATIONS.Status
        ] || value
      );
    }

    if (column === 'Price' && typeof value === 'number') {
      return new Intl.NumberFormat('by-BY', {
        style: 'currency',
        currency: 'BYN',
      }).format(value);
    }

    return value;
  };

  const getColumnWidth = (column: string): string => {
    switch (column) {
      case 'PassengerID':
        return '10px';
      case 'AirportID':
        return '10px';
      case 'AirlineID':
        return '10px';
      case 'AirplaneID':
        return '10px';
      case 'FlightID':
        return '10px';
      case 'TicketID':
        return '10px';
      case 'Gender':
        return '60px';
      case 'Role':
      case 'Status':
        return '120px';
      case 'Email':
        return '100px';
      case 'Phone':
        return '150px';
      case 'Price':
        return '100px';
      case 'PassportNumber':
        return '100px';
      case 'PassportSeries':
        return '10px';
      default:
        return 'auto';
    }
  };

  const sortedData = useMemo(() => {
    if (sortConfig !== null) {
      return [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  }, [filteredData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const renderTableHeader = () => (
    <thead>
      <tr>
        {columns.map(column => {
          const columnLabel =
            TABLE_TRANSLATIONS[type]?.columns?.[column] || column;
          return (
            <th
              key={`header-${column}`}
              style={{
                width: getColumnWidth(column),
                minWidth: getColumnWidth(column),
                cursor: 'pointer',
              }}
              onClick={() => requestSort(column)}
            >
              {isLoading ? (
                <Skeleton />
              ) : (
                <div className={styles.columnHeader}>
                  <span className={styles.columnLabel}>{columnLabel}</span>
                  <FaSort
                    className={
                      sortConfig?.key === column
                        ? styles.activeSortIcon
                        : styles.inactiveSortIcon
                    }
                  />
                </div>
              )}
            </th>
          );
        })}
        <th key="actions-header" style={{ width: '160px', minWidth: '160px' }}>
          <div className={styles.columnHeader}>
            <span className={styles.columnLabel}>Действия</span>
          </div>
        </th>
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody>
      {isLoading ? (
        Array(itemsPerPage)
          .fill(0)
          .map((_, index) => (
            <tr key={`skeleton-row-${index}`}>
              {Array(columns.length + 1)
                .fill(0)
                .map((_, colIndex) => (
                  <td key={`skeleton-cell-${index}-${colIndex}`}>
                    <Skeleton />
                  </td>
                ))}
            </tr>
          ))
      ) : sortedData.length > 0 && columns.length > 0 ? (
        sortedData.slice(startIndex, endIndex).map(row => (
          <tr key={row[idFields[type]]}>
            {columns.map(column => (
              <td
                key={`${row[idFields[type]]}-${column}`}
                style={{
                  width: getColumnWidth(column),
                  minWidth: getColumnWidth(column),
                }}
              >
                {formatCellValue(row[column], column)}
              </td>
            ))}
            {renderActionButtons(row)}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>
            Нет данных для отображения
          </td>
        </tr>
      )}
    </tbody>
  );

  return (
    <>
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          {isLoading ? (
            <Skeleton type="title" />
          ) : (
            <h2 className={styles.title}>{TABLE_TRANSLATIONS[type].name}</h2>
          )}
          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              label="Добавить"
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLoading}
            />
            <div className={styles.filters}>
              <Button
                variant="outline"
                leftIcon={<FaFilter />}
                label="Фильтры"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            {renderTableHeader()}
            {renderTableBody()}
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {isLoading ? (
              <Skeleton style={{ width: '200px' }} />
            ) : (
              `Показано ${startIndex + 1}-${endIndex} из ${filteredData.length} записей`
            )}
          </div>
          <div className={styles.pageControls}>
            <Button
              variant="outline"
              label="Назад"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || isLoading}
            />
            <span className={styles.pageNumber}>
              {isLoading ? (
                <Skeleton style={{ width: '50px' }} />
              ) : (
                `${currentPage} из ${totalPages}`
              )}
            </span>
            <Button
              variant="outline"
              label="Вперёд"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages || isLoading}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({});
        }}
        title={`Добавить ${TABLE_TRANSLATIONS[type].name.toLowerCase()}`}
        size="lg" // Ensure the modal is large enough
      >
        {renderForm(handleAdd, columns, formData, setFormData, idFields, type)}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRow(null);
          setFormData({});
        }}
        title={`Изменить ${TABLE_TRANSLATIONS[type].name.toLowerCase()}`}
        size="lg" // Ensure the modal is large enough
      >
        {renderForm(handleEdit, columns, formData, setFormData, idFields, type)}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRow(null);
        }}
        title="Подтверждение удаления"
        size="xs"
        onConfirm={handleDelete}
        confirmText="Удалить"
      >
        <div className={styles.deleteConfirmation}>
          <p>Вы действительно хотите удалить запись?</p>
        </div>
      </Modal>
    </>
  );
};
