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
  FaFileAlt,
  FaReceipt,
} from 'react-icons/fa';
import {
  Button,
  Modal,
  Skeleton,
  Selector,
  generateDocument,
  downloadDocument,
} from '@components';
import { TableAPI, Supabase, EntityType } from '@api';
import {
  TABLE_TRANSLATIONS,
  VALUE_TRANSLATIONS,
  TABLE_FILTERS,
  FilterConfig,
  Tooltip,
  getFieldTooltip,
} from '@config';
import { toast } from 'sonner';
import { Filters, PhoneInput } from './components';
import styles from './style.module.scss';

interface ITableProps {
  type: EntityType;
}

interface SupabaseFlightData {
  FlightID: number;
  FlightNumber: string;
  DepartureTime: string;
  ArrivalTime: string;
  AIRPLANE: {
    Model: string;
    Capacity: number;
    AIRLINE: {
      Name: string;
      Country: string;
    };
  };
  DepartureAirport: {
    City: string;
    Name: string;
    Code: string;
    Country: string;
  };
  ArrivalAirport: {
    City: string;
    Name: string;
    Code: string;
    Country: string;
  };
}

interface SupabasePassengerData {
  PassengerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  PassportSeries: string;
  PassportNumber: string;
  Gender: string;
  DateOfBirth: string;
}

interface SupabaseTicketData {
  TicketID: number;
  Status: string;
  SeatNumber: string;
  Price: number;
  PurchaseDate: string;
}

export const TableComponent = ({ type }: ITableProps) => {
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
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [relatedData, setRelatedData] = useState<{
    flights: Record<string, string>;
    passengers: Record<string, string>;
    airplanes: Record<string, string>;
    airports: Record<string, string>;
    airlines: Record<string, string>;
  }>({
    flights: {},
    passengers: {},
    airplanes: {},
    airports: {},
    airlines: {},
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [rangeFilters, setRangeFilters] = useState<Record<string, boolean>>({});
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const currentTypeRef = useRef(type);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setCurrentPage(1);
    setSelectedRow(null);
    setFormData({});
    setSearchQuery('');
    setActiveFilters({});
    setRangeFilters({});
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSortConfig({ key: null, direction: 'asc' });
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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

      setData(fetchedData);
      if (fetchedData.length > 0) {
        setColumns(Object.keys(fetchedData[0]));
      } else {
        setColumns([]);
      }
      setIsLoading(false);
      toast.dismiss();
    } catch (error) {
      console.error('Error fetching data:', error);
      if (type === currentTypeRef.current) {
        setColumns([]);
        setData([]);
        setIsLoading(false);
        toast.dismiss();
      }
    }
  }, [type]);

  const fetchRelatedData = useCallback(async () => {
    try {
      const [flights, passengers, airplanes, airports, airlines] =
        await Promise.all([
          TableAPI.fetchData('FLIGHT'),
          TableAPI.fetchData('PASSENGER'),
          TableAPI.fetchData('AIRPLANE'),
          TableAPI.fetchData('AIRPORT'),
          TableAPI.fetchData('AIRLINE'),
        ]);

      setRelatedData({
        flights: flights.reduce(
          (acc, flight) => ({
            ...acc,
            [flight.FlightID]: flight.FlightNumber,
          }),
          {},
        ),
        passengers: passengers.reduce(
          (acc, passenger) => ({
            ...acc,
            [passenger.PassengerID]: `${passenger.FirstName} ${passenger.LastName}`,
          }),
          {},
        ),
        airplanes: airplanes.reduce(
          (acc, airplane) => ({
            ...acc,
            [airplane.AirplaneID]: airplane.Model,
          }),
          {},
        ),
        airports: airports.reduce(
          (acc, airport) => ({
            ...acc,
            [airport.AirportID]: `${airport.City} (${airport.Name})`,
          }),
          {},
        ),
        airlines: airlines.reduce(
          (acc, airline) => ({
            ...acc,
            [airline.AirlineID]: airline.Name,
          }),
          {},
        ),
      });
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  }, []);

  useEffect(() => {
    currentTypeRef.current = type;
    resetState();
    setCurrentPage(1);
    fetchTableData();
    fetchRelatedData();
  }, [type]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      } else {
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });
  }, [data, sortConfig]);

  const handleFilterChange = (
    field: string,
    value: any,
    isRange: boolean = false,
  ) => {
    if (isRange) {
      setActiveFilters(prev => ({
        ...prev,
        [`${field}From`]: value.from,
        [`${field}To`]: value.to,
      }));
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleRangeToggle = (field: string) => {
    setRangeFilters(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
    // Сбрасываем значения при переключении режима
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      delete newFilters[`${field}From`];
      delete newFilters[`${field}To`];
      return newFilters;
    });
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setRangeFilters({});
  };

  const filteredData = useMemo(() => {
    return sortedData.filter(row => {
      // Применяем только фильтры
      return Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true;

        const filterConfig = TABLE_FILTERS[type].find(
          (f: FilterConfig) => f.field === field || field.startsWith(f.field),
        );

        if (!filterConfig) return true;

        // Проверяем, является ли поле частью диапазона
        const isRangeField = field.endsWith('From') || field.endsWith('To');
        const baseField = isRangeField ? field.slice(0, -4) : field;

        // Если это поле диапазона, проверяем только если есть оба значения
        if (isRangeField) {
          const fromValue = activeFilters[`${baseField}From`];
          const toValue = activeFilters[`${baseField}To`];

          // Если нет обоих значений диапазона, пропускаем проверку
          if (!fromValue && !toValue) return true;

          const rowValue = row[baseField];

          if (filterConfig.type === 'date') {
            const rowDate = new Date(rowValue);
            const fromDate = fromValue ? new Date(fromValue) : null;
            const toDate = toValue ? new Date(toValue) : null;

            if (fromDate && toDate) {
              return rowDate >= fromDate && rowDate <= toDate;
            } else if (fromDate) {
              return rowDate >= fromDate;
            } else if (toDate) {
              return rowDate <= toDate;
            }
          } else if (filterConfig.type === 'number') {
            const numRowValue = Number(rowValue);
            const fromNum = fromValue ? Number(fromValue) : null;
            const toNum = toValue ? Number(toValue) : null;

            if (fromNum !== null && toNum !== null) {
              return numRowValue >= fromNum && numRowValue <= toNum;
            } else if (fromNum !== null) {
              return numRowValue >= fromNum;
            } else if (toNum !== null) {
              return numRowValue <= toNum;
            }
          }
        }

        // Для обычных фильтров
        switch (filterConfig.type) {
          case 'select':
            return row[filterConfig.field] === value;
          case 'date':
            const rowDate = new Date(row[filterConfig.field]);
            const filterDate = new Date(value);
            return rowDate.toDateString() === filterDate.toDateString();
          case 'number':
            const numValue = Number(value);
            const numRowValue = Number(row[filterConfig.field]);
            return numRowValue === numValue;
          case 'text':
            return String(row[filterConfig.field])
              .toLowerCase()
              .includes(String(value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }, [sortedData, activeFilters, type]);

  const handleDocumentGeneration = async (
    row: any,
    type: 'ticket' | 'receipt',
  ) => {
    try {
      if (!row.FlightID) {
        toast.error('Отсутствует ID рейса');
        return;
      }

      if (!row.PassengerID) {
        toast.error('Отсутствует ID пассажира');
        return;
      }

      const { data: flightData, error: flightError } = await Supabase.from(
        'FLIGHT',
      )
        .select(
          `
          FlightID,
          FlightNumber,
          DepartureTime,
          ArrivalTime,
          AIRPLANE: AirplaneID (
            Model,
            Capacity,
            AIRLINE: AirlineID (
              Name,
              Country
            )
          ),
          DepartureAirport: DepartureAirportID (
            City,
            Name,
            Code,
            Country
          ),
          ArrivalAirport: ArrivalAirportID (
            City,
            Name,
            Code,
            Country
          )
        `,
        )
        .eq('FlightID', row.FlightID)
        .single<SupabaseFlightData>();

      if (flightError || !flightData) {
        toast.error('Не удалось получить данные рейса');
        return;
      }

      const { data: passengerData, error: passengerError } =
        await Supabase.from('PASSENGER')
          .select(
            `
          PassengerID,
          FirstName,
          LastName,
          Email,
          Phone,
          PassportSeries,
          PassportNumber,
          Gender,
          DateOfBirth
        `,
          )
          .eq('PassengerID', row.PassengerID)
          .single<SupabasePassengerData>();

      if (passengerError || !passengerData) {
        toast.error('Не удалось получить данные пассажира');
        return;
      }

      const { data: ticketData, error: ticketError } = await Supabase.from(
        'TICKET',
      )
        .select(
          `
          TicketID,
          Status,
          SeatNumber,
          Price,
          PurchaseDate
        `,
        )
        .eq('TicketID', row.TicketID)
        .single<SupabaseTicketData>();

      if (ticketError || !ticketData) {
        toast.error('Не удалось получить данные билета');
        return;
      }

      const documentData = {
        FlightNumber: flightData.FlightNumber,
        DepartureTime: flightData.DepartureTime,
        ArrivalTime: flightData.ArrivalTime,
        from: flightData.DepartureAirport.City,
        to: flightData.ArrivalAirport.City,
        TicketID: row.TicketID,
        Price: ticketData.Price,
        PurchaseDate: ticketData.PurchaseDate || new Date().toISOString(),
        TICKET: {
          SeatNumber: ticketData.SeatNumber,
          Status: ticketData.Status,
        },
        AIRPLANE: {
          Model: flightData.AIRPLANE.Model,
          Capacity: flightData.AIRPLANE.Capacity,
          AIRLINE: {
            Name: flightData.AIRPLANE.AIRLINE.Name,
            Country: flightData.AIRPLANE.AIRLINE.Country,
          },
        },
        PASSENGER: {
          PassengerID: passengerData.PassengerID,
          FirstName: passengerData.FirstName,
          LastName: passengerData.LastName,
          Email: passengerData.Email,
          Phone: passengerData.Phone,
          PassportSeries: passengerData.PassportSeries,
          PassportNumber: passengerData.PassportNumber,
          Gender: passengerData.Gender,
          DateOfBirth: passengerData.DateOfBirth,
        },
      };

      await downloadDocument({ type, data: documentData });
      toast.success(
        `${type === 'ticket' ? 'Билет' : 'Чек'} успешно сгенерирован`,
      );
    } catch (error) {
      console.error('Ошибка при генерации документа:', error);
      toast.error('Не удалось сгенерировать документ');
    }
  };

  const renderActionButtons = (row: any) => (
    <td className={styles.actions}>
      <div className={styles.mainActions}>
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
      </div>
      {type === 'TICKET' && row.Status === 'checked-in' && (
        <div className={styles.documentActions}>
          <Button
            variant="outline"
            leftIcon={<FaFileAlt />}
            label="Билет"
            onClick={() => handleDocumentGeneration(row, 'ticket')}
          />
          <Button
            variant="outline"
            leftIcon={<FaReceipt />}
            label="Чек"
            onClick={() => handleDocumentGeneration(row, 'receipt')}
          />
        </div>
      )}
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

  const statusOptions = [
    { value: 'booked', label: 'Забронировано' },
    { value: 'checked-in', label: 'Подтверждено' },
    { value: 'canceled', label: 'Отменено' },
  ];

  const handleSelectorChange = (column: string) => (value: string) => {
    setFormData({ ...formData, [column]: value });
  };

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

    // Определяем, нужно ли разделять на колонки
    const shouldSplitColumns = formFields.length > 4;

    // Если нужно разделить на колонки, делим пополам, иначе все поля идут в один массив
    const half = Math.ceil(formFields.length / 2);
    const leftFields = shouldSplitColumns
      ? formFields.slice(0, half)
      : formFields;
    const rightFields = shouldSplitColumns ? formFields.slice(half) : [];

    const renderField = (column: string) => {
      const columnLabel =
        TABLE_TRANSLATIONS[type]?.columns?.[
          column as keyof (typeof TABLE_TRANSLATIONS)[typeof type]['columns']
        ] || column;

      const tooltipContent = getFieldTooltip(column, type);

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        // Валидация при вводе
        switch (column) {
          case 'FirstName':
          case 'LastName':
          case 'City':
          case 'Country':
            if (!/^[A-Za-zА-Яа-яЁё\s-]*$/.test(value)) return;
            break;

          case 'Phone':
            if (!/^[0-9+\-\s()]*$/.test(value)) return;
            break;

          case 'Capacity':
            if (!/^\d*$/.test(value)) return;
            const capacityValue = Number(value);
            if (capacityValue > 555) {
              toast.error('Вместимость не может быть больше 555 пассажиров');
              return;
            }
            break;

          case 'PassportSeries':
            // Преобразуем все буквы в заглавные и удаляем не-буквенные символы
            const upperLetters = value
              .toUpperCase()
              .replace(/[^A-ZА-Я]/g, '')
              .slice(0, 2);
            setFormData({ ...formData, [column]: upperLetters });
            return;

          case 'PassportNumber':
            // Оставляем только цифры и ограничиваем до 7 символов
            const numbers = value.replace(/\D/g, '').slice(0, 7);
            setFormData({ ...formData, [column]: numbers });
            return;

          case 'Price':
            // Проверяем, что введены только цифры
            if (!/^\d*$/.test(value)) return;

            const priceValue = Number(value);
            // Проверяем ограничения на стоимость
            if (priceValue > 2000) {
              toast.error('Стоимость не может быть больше 2000 BYN');
              return;
            }
            if (priceValue < 0) {
              toast.error('Стоимость не может быть отрицательной');
              return;
            }
            setFormData({ ...formData, [column]: value });
            return;
        }

        setFormData({ ...formData, [column]: value });
      };

      // Специальная обработка для дат рейса
      const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newDate = new Date(value);

        if (column === 'ArrivalTime' && formData.DepartureTime) {
          const departureDate = new Date(formData.DepartureTime);

          const isSameDay =
            departureDate.getFullYear() === newDate.getFullYear() &&
            departureDate.getMonth() === newDate.getMonth() &&
            departureDate.getDate() === newDate.getDate();

          if (isSameDay && newDate <= departureDate) {
            toast.error(
              'Время прибытия должно быть позже времени вылета в тот же день',
            );
            return;
          }

          const diffHours =
            (newDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 24) {
            toast.error('Длительность полета не может превышать 24 часа');
            return;
          }
        }

        if (column === 'DepartureTime' && formData.ArrivalTime) {
          const arrivalDate = new Date(formData.ArrivalTime);

          if (newDate >= arrivalDate) {
            toast.error('Время вылета не может быть позже времени прибытия');
            return;
          }

          const diffHours =
            (arrivalDate.getTime() - newDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 24) {
            toast.error('Длительность полета не может превышать 24 часа');
            return;
          }
        }

        if (column === 'PurchaseDate') {
          const purchaseDate = newDate;
          const now = new Date();
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);

          if (purchaseDate > now) {
            toast.error('Дата покупки не может быть в будущем');
            return;
          }

          if (purchaseDate < yearAgo) {
            toast.error('Дата покупки не может быть раньше, чем год назад');
            return;
          }
        }

        setFormData({ ...formData, [column]: value });
      };

      if (column === 'Gender') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={genderOptions}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'Role') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={roleOptions}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'Status') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={statusOptions}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'DateOfBirth') {
        const maxDate = new Date();
        const minDate = new Date();
        minDate.setFullYear(maxDate.getFullYear() - 90);
        maxDate.setFullYear(maxDate.getFullYear() - 2);

        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <input
              type="date"
              value={formData[column]?.split('T')[0] || ''}
              onChange={handleInputChange}
              max={maxDate.toISOString().split('T')[0]}
              min={minDate.toISOString().split('T')[0]}
            />
          </div>
        );
      }

      if (
        column === 'PurchaseDate' ||
        column === 'DepartureTime' ||
        column === 'ArrivalTime'
      ) {
        const now = new Date();
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);

        let minValue: string | undefined;
        let maxValue: string | undefined;

        if (column === 'PurchaseDate') {
          minValue = yearAgo.toISOString().slice(0, 16);
          maxValue = now.toISOString().slice(0, 16);
        } else if (column === 'ArrivalTime') {
          minValue = formData.DepartureTime;
        }

        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <input
              type="datetime-local"
              value={formData[column] || ''}
              onChange={handleDateChange}
              className={styles.datetimeInput}
              min={minValue}
              max={maxValue}
            />
          </div>
        );
      }

      if (column === 'Capacity') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <input
              type="number"
              value={formData[column] || ''}
              onChange={handleInputChange}
              min="5"
              max="555"
              placeholder="Введите вместимость"
            />
          </div>
        );
      }

      if (column === 'FlightID') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={Object.entries(relatedData.flights).map(
                ([id, number]) => ({
                  value: id,
                  label: number,
                }),
              )}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'AirplaneID') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={Object.entries(relatedData.airplanes).map(
                ([id, model]) => ({
                  value: id,
                  label: model,
                }),
              )}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'DepartureAirportID' || column === 'ArrivalAirportID') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={Object.entries(relatedData.airports).map(
                ([id, name]) => ({
                  value: id,
                  label: name,
                }),
              )}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'AirlineID') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={Object.entries(relatedData.airlines).map(
                ([id, name]) => ({
                  value: id,
                  label: name,
                }),
              )}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'PassengerID' && type === 'TICKET') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <Selector
              options={Object.entries(relatedData.passengers).map(
                ([id, name]) => ({
                  value: id,
                  label: name,
                }),
              )}
              value={formData[column]}
              onChange={handleSelectorChange(column)}
            />
          </div>
        );
      }

      if (column === 'Phone') {
        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>
              {columnLabel}
              <Tooltip content={tooltipContent} />
            </label>
            <PhoneInput
              value={formData[column] || ''}
              onChange={value => setFormData({ ...formData, [column]: value })}
            />
          </div>
        );
      }

      return (
        <div key={`field-${column}`} className={styles.field}>
          <label>
            {columnLabel}
            <Tooltip content={tooltipContent} />
          </label>
          <input
            type="text"
            value={formData[column] || ''}
            onChange={handleInputChange}
            placeholder={`Введите ${columnLabel.toLowerCase()}`}
          />
        </div>
      );
    };

    return (
      <div className={styles.form}>
        <div
          className={`${styles.formRow} ${!shouldSplitColumns ? styles.singleColumn : ''}`}
        >
          <div className={styles.formColumn}>
            {leftFields.map(column => renderField(column))}
          </div>
          {shouldSplitColumns && (
            <div className={styles.formColumn}>
              {rightFields.map(column => renderField(column))}
            </div>
          )}
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

  const isForeignKey = (column: string, tableType: EntityType): boolean => {
    const foreignKeyMap: Record<EntityType, string[]> = {
      TICKET: ['FlightID', 'PassengerID'],
      FLIGHT: ['AirplaneID', 'DepartureAirportID', 'ArrivalAirportID'],
      AIRPLANE: ['AirlineID'],
      AIRPORT: [],
      AIRLINE: [],
      PASSENGER: [],
    };

    return foreignKeyMap[tableType]?.includes(column) || false;
  };

  const formatCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';

    if (column === idFields[type]) {
      return value;
    }

    if (isForeignKey(column, type)) {
      switch (column) {
        case 'FlightID':
          return relatedData.flights[value] || value;
        case 'PassengerID':
          return relatedData.passengers[value] || value;
        case 'AirplaneID':
          return relatedData.airplanes[value] || value;
        case 'DepartureAirportID':
        case 'ArrivalAirportID':
          return relatedData.airports[value] || value;
        case 'AirlineID':
          return relatedData.airlines[value] || value;
      }
    }

    if (column === 'DateOfBirth') {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch {
        return value;
      }
    } else if (column.includes('Time') || column.includes('Date')) {
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
        return '10px';
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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isRelatedField = (column: string): boolean => {
    return isForeignKey(column, type);
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
              <div className={styles.columnHeader}>
                <span
                  className={`
                    ${styles.columnLabel} 
                    ${isRelatedField(column) ? styles.relatedColumn : ''}
                  `}
                >
                  {isLoading ? (
                    <Skeleton />
                  ) : (
                    <>
                      {columnLabel}
                      {isRelatedField(column) && (
                        <span className={styles.relatedIcon}>⇄</span>
                      )}
                    </>
                  )}
                </span>
                <FaSort
                  className={
                    sortConfig?.key === column
                      ? styles.activeSortIcon
                      : styles.inactiveSortIcon
                  }
                />
              </div>
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const isRowMatchingSearch = (row: any): boolean => {
    if (!searchQuery) return false;

    return Object.entries(row).some(([column, value]) => {
      const searchValue =
        column === 'Gender'
          ? VALUE_TRANSLATIONS.Gender[
              value as keyof typeof VALUE_TRANSLATIONS.Gender
            ]
          : column === 'Role'
            ? VALUE_TRANSLATIONS.Role[
                value as keyof typeof VALUE_TRANSLATIONS.Role
              ]
            : column === 'Status'
              ? VALUE_TRANSLATIONS.Status[
                  value as keyof typeof VALUE_TRANSLATIONS.Status
                ]
              : formatCellValue(value, column);

      return String(searchValue)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array(itemsPerPage)
            .fill(0)
            .map((_, index) => (
              <tr key={`skeleton-row-${type}-${index}`}>
                {Array(columns.length + 1)
                  .fill(0)
                  .map((_, colIndex) => (
                    <td key={`skeleton-cell-${type}-${index}-${colIndex}`}>
                      <Skeleton />
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      );
    }

    if (!filteredData.length || !columns.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>
              Нет данных для отображения
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {filteredData.slice(startIndex, endIndex).map((row, index) => {
          const uniqueId = `${type}-${row[idFields[type]]}-${index}`;
          const hasMatch = isRowMatchingSearch(row);

          return (
            <tr
              key={uniqueId}
              className={hasMatch ? styles.highlightedRow : ''}
            >
              {columns.map(column => (
                <td
                  key={`${uniqueId}-${column}`}
                  className={`${isRelatedField(column) ? styles.relatedCell : ''} ${
                    hasMatch ? styles.highlightedCell : ''
                  }`}
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
          );
        })}
      </tbody>
    );
  };

  const processFormData = (data: any, type: EntityType) => {
    const processedData = { ...data };

    const numberFields: Record<EntityType, string[]> = {
      AIRPLANE: ['AirlineID', 'Capacity'],
      FLIGHT: ['AirplaneID', 'DepartureAirportID', 'ArrivalAirportID'],
      TICKET: ['FlightID', 'PassengerID', 'Price'],
      PASSENGER: [],
      AIRPORT: [],
      AIRLINE: [],
    };

    numberFields[type].forEach(field => {
      if (processedData[field]) {
        processedData[field] = Number(processedData[field]);
      }
    });

    return processedData;
  };

  const handleAdd = async () => {
    const processedData = processFormData(formData, type);

    if (!validateFormData(processedData, columns, idFields, type)) {
      return;
    }

    try {
      const result = await TableAPI.createRecord(type, processedData);
      if (result) {
        setIsAddModalOpen(false);
        setFormData({});
        fetchTableData();
      }
    } catch (error) {
      console.error('Ошибка при добавлении записи:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedRow || !selectedRow[idFields[type]]) return;

    const updateData = { ...formData };
    delete updateData[idFields[type]];

    try {
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
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Ошибка при обновлении записи');
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
        fetchTableData();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const validateFormData = (
    formData: any,
    columns: string[],
    idFields: Record<EntityType, string>,
    type: EntityType,
  ): boolean => {
    const requiredFields = columns.filter(
      column => column !== idFields[type] && column !== 'created_at',
    );

    const validatePassengerAge = (birthDate: string) => {
      const birth = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      const adjustedAge =
        monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
          ? age - 1
          : age;

      if (adjustedAge > 90) {
        toast.error('Возраст пассажира не может быть больше 90 лет');
        return false;
      }

      if (adjustedAge < 2) {
        toast.error('Возраст пассажира не может быть меньше 2 лет');
        return false;
      }

      return true;
    };

    const patterns = {
      onlyLetters: /^[A-Za-zА-Яа-яЁё\s-]+$/,
      onlyNumbers: /^\d+$/,
      email: /\S+@\S+\.\S+/,
      phone: /^\+?\d{10,15}$/,
      passportSeries: /^[A-ZА-Я]{2}$/,
      passportNumber: /^\d{7}$/,
      flightNumber: /^[A-Z]{2}\d{3,4}$/,
    };

    const validateNumber = (value: number, min: number, field: string) => {
      if (value < min) {
        toast.error(`Поле "${field}" не может быть меньше ${min}`);
        return false;
      }
      return true;
    };

    const validateFlightDates = (departure: string, arrival: string) => {
      const departureDate = new Date(departure);
      const arrivalDate = new Date(arrival);
      const diffHours =
        (arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60);

      if (departureDate >= arrivalDate) {
        toast.error('Время прибытия должно быть позже времени вылета');
        return false;
      }

      if (diffHours > 24) {
        toast.error('Длительность полета не может превышать 24 часа');
        return false;
      }

      return true;
    };

    for (const field of requiredFields) {
      const value = formData[field];

      if (value === undefined || value === null || value === '') {
        toast.error(`Поле "${field}" не может быть пустым`);
        return false;
      }

      switch (field) {
        case 'DateOfBirth':
          if (type === 'PASSENGER' && !validatePassengerAge(value)) {
            return false;
          }
          break;

        case 'FirstName':
        case 'LastName':
        case 'City':
        case 'Country':
          if (!patterns.onlyLetters.test(value)) {
            toast.error(`Поле "${field}" должно содержать только буквы`);
            return false;
          }
          break;

        case 'Capacity':
          const capacity = Number(value);
          if (capacity < 5) {
            toast.error(
              'Вместимость самолета должна быть не менее 5 пассажиров',
            );
            return false;
          }
          if (capacity > 555) {
            toast.error(
              'Вместимость самолета не может превышать 555 пассажиров',
            );
            return false;
          }
          break;

        case 'Price':
          if (!validateNumber(Number(value), 0, field)) return false;
          break;

        case 'Email':
          if (!patterns.email.test(value)) {
            toast.error('Некорректный формат email');
            return false;
          }
          break;

        case 'Phone':
          if (!patterns.phone.test(value)) {
            toast.error('Некорректный формат телефона');
            return false;
          }
          break;

        case 'PassportSeries':
          if (!patterns.passportSeries.test(value)) {
            toast.error('Серия паспорта должна содержать 2 заглавные буквы');
            return false;
          }
          break;

        case 'PassportNumber':
          if (!patterns.passportNumber.test(value)) {
            toast.error('Номер паспорта должен содержать 7 цифр');
            return false;
          }
          break;

        case 'FlightNumber':
          if (!patterns.flightNumber.test(value)) {
            toast.error('Некорректный формат номера рейса (например: AA123)');
            return false;
          }
          break;
      }
    }

    if (type === 'FLIGHT') {
      if (!validateFlightDates(formData.DepartureTime, formData.ArrivalTime)) {
        return false;
      }
    }

    return true;
  };

  const handleAddModalOpen = () => {
    const initialFormData =
      type === 'PASSENGER'
        ? {
            Gender: 'Male',
            Role: 'user',
            FirstName: '',
            LastName: '',
            DateOfBirth: new Date().toISOString().split('T')[0],
            Email: '',
            Phone: '',
            PassportSeries: '',
            PassportNumber: '',
          }
        : {};

    setFormData(initialFormData);
    setIsAddModalOpen(true);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setRangeFilters({});
  };

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
                onChange={handleSearchChange}
                disabled={isLoading}
              />
              <div className={styles.matchCountWrapper}>
                {searchQuery && (
                  <span className={styles.matchCount}>
                    {filteredData.reduce((total, row) => {
                      return (
                        total +
                        Object.values(row).reduce((count: number, value) => {
                          return (
                            count +
                            (String(value)
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                              ? 1
                              : 0)
                          );
                        }, 0)
                      );
                    }, 0)}{' '}
                    результатов
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.actionsHeader}>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              label="Добавить"
              onClick={handleAddModalOpen}
              disabled={isLoading}
            />
            <div className={styles.filters}>
              <Button
                variant="outline"
                leftIcon={<FaFilter />}
                label="Фильтры"
                onClick={() => setIsFiltersOpen(true)}
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

      <Filters
        type={type}
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeFilters={activeFilters}
        rangeFilters={rangeFilters}
        onFilterChange={handleFilterChange}
        onRangeToggle={handleRangeToggle}
        onReset={handleFilterReset}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({});
        }}
        title={`Добавить ${TABLE_TRANSLATIONS[type].name.toLowerCase()}`}
        size={columns.length <= 5 ? 'sm' : 'lg'}
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
        size={columns.length <= 5 ? 'sm' : 'lg'}
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
