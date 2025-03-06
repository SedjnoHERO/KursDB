import { EntityType } from "@api";

export type TableColumns = {
  [K in EntityType]: {
    name: string;
    columns: Record<string, string>;
  };
};

export const TABLE_TRANSLATIONS: TableColumns = {  AIRPORT: {
    name: 'Аэропорты',
    columns: {
      id: 'ID',
      name: 'Название',
      city: 'Город',
      country: 'Страна',
      iata_code: 'Код IATA',
      created_at: 'Дата создания'
    }
  },
  AIRPLANE: {
    name: 'Самолёты',
    columns: {
      id: 'ID',
      model: 'Модель',
      capacity: 'Вместимость',
      manufacturer: 'Производитель',
      year: 'Год выпуска',
      airline_id: 'ID авиакомпании',
      created_at: 'Дата создания'
    }
  },
  AIRLINE: {
    name: 'Авиакомпании',
    columns: {
      id: 'ID',
      name: 'Название',
      country: 'Страна',
      created_at: 'Дата создания'
    }
  },
  FLIGHT: {
    name: 'Рейсы',
    columns: {
      id: 'ID',
      flight_number: 'Номер рейса',
      departure_airport_id: 'ID аэропорта вылета',
      arrival_airport_id: 'ID аэропорта прибытия',
      airplane_id: 'ID самолета',
      departure_time: 'Время вылета',
      arrival_time: 'Время прибытия',
      created_at: 'Дата создания'
    }
  },
  TICKET: {
    name: 'Билеты',
    columns: {
      id: 'ID',
      flight_id: 'ID рейса',
      passenger_id: 'ID пассажира',
      seat_number: 'Номер места',
      price: 'Цена',
      created_at: 'Дата создания'
    }
  },
  PASSENGER: {
    name: 'Пассажиры',
    columns: {
      id: 'ID',
      first_name: 'Имя',
      last_name: 'Фамилия',
      passport_number: 'Номер паспорта',
      email: 'Email',
      phone: 'Телефон',
      created_at: 'Дата создания'
    }
  }
}; 