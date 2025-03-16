import { EntityType } from '@api';

export interface FilterConfig {
  field: string;
  label: string;
  type: 'select' | 'date' | 'number' | 'text';
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
  isRange?: boolean;
  rangeLabels?: {
    from: string;
    to: string;
  };
}

export const TABLE_FILTERS: Record<EntityType, FilterConfig[]> = {
  PASSENGER: [
    {
      field: 'Gender',
      label: 'Пол',
      type: 'select',
      options: [
        { value: 'Male', label: 'Мужской' },
        { value: 'Female', label: 'Женский' },
      ],
    },
    {
      field: 'Role',
      label: 'Роль',
      type: 'select',
      options: [
        { value: 'admin', label: 'Администратор' },
        { value: 'user', label: 'Пользователь' },
      ],
    },
    {
      field: 'DateOfBirth',
      label: 'Дата рождения',
      type: 'date',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
    },
  ],
  FLIGHT: [
    {
      field: 'DepartureTime',
      label: 'Время вылета',
      type: 'date',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
    },
    {
      field: 'ArrivalTime',
      label: 'Время прилета',
      type: 'date',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
    },
    {
      field: 'Price',
      label: 'Цена',
      type: 'number',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
      validation: {
        min: 0,
      },
    },
  ],
  TICKET: [
    {
      field: 'Status',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'booked', label: 'Забронирован' },
        { value: 'checked-in', label: 'Оплачен' },
        { value: 'canceled', label: 'Отменен' },
      ],
    },
    {
      field: 'PurchaseDate',
      label: 'Дата покупки',
      type: 'date',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
    },
    {
      field: 'Price',
      label: 'Цена',
      type: 'number',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
      validation: {
        min: 0,
      },
    },
  ],
  AIRPLANE: [
    {
      field: 'Model',
      label: 'Модель',
      type: 'text',
    },
    {
      field: 'Capacity',
      label: 'Вместимость',
      type: 'number',
      isRange: true,
      rangeLabels: {
        from: 'От',
        to: 'До',
      },
      validation: {
        min: 5,
      },
    },
  ],
  AIRPORT: [
    {
      field: 'Country',
      label: 'Страна',
      type: 'text',
    },
    {
      field: 'City',
      label: 'Город',
      type: 'text',
    },
  ],
  AIRLINE: [
    {
      field: 'Name',
      label: 'Название',
      type: 'text',
    },
  ],
}; 