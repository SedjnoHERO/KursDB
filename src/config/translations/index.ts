import { EntityType } from "@api";

export type TableColumns = {
  [K in EntityType]: {
    name: string;
    columns: Record<string, string>;
  };
};

export const TABLE_TRANSLATIONS: TableColumns = {
  AIRPORT: {
    name: 'Аэропорты',
    columns: {
      AirportID: 'ID',
      Name: 'Название',
      City: 'Город',
      Country: 'Страна',
      Code: 'Код'
    }
  },
  AIRPLANE: {
    name: 'Самолёты',
    columns: {
      AirplaneID: 'ID',
      AirlineID: 'ID авиакомпании',
      Model: 'Модель',
      Capacity: 'Вместимость',
      airline: 'Авиакомпания'
    }
  },
  AIRLINE: {
    name: 'Авиакомпании',
    columns: {
      AirlineID: 'ID',
      Name: 'Название',
      Country: 'Страна'
    }
  },
  FLIGHT: {
    name: 'Рейсы',
    columns: {
      FlightID: 'ID',
      FlightNumber: 'Номер рейса',
      AirplaneID: 'ID самолета',
      DepartureAirportID: 'ID аэропорта вылета',
      ArrivalAirportID: 'ID аэропорта прибытия',
      DepartureTime: 'Время вылета',
      ArrivalTime: 'Время прибытия',
      airplane: 'Самолет',
      departureAirport: 'Аэропорт вылета',
      arrivalAirport: 'Аэропорт прибытия'
    }
  },
  TICKET: {
    name: 'Билеты',
    columns: {
      TicketID: 'ID',
      FlightID: 'ID рейса',
      PassengerID: 'ID пассажира',
      PurchaseDate: 'Дата покупки',
      SeatNumber: 'Номер места',
      Price: 'Цена',
      Status: 'Статус',
      flight: 'Рейс',
      passenger: 'Пассажир'
    }
  },
  PASSENGER: {
    name: 'Пассажиры',
    columns: {
      PassengerID: 'ID',
      Gender: 'Пол',
      FirstName: 'Имя',
      LastName: 'Фамилия',
      PassportSeries: 'Серия паспорта',
      PassportNumber: 'Номер паспорта',
      DateOfBirth: 'Дата рождения',
      Phone: 'Телефон',
      Email: 'Email',
      Role: 'Роль'
    }
  }
};

export const VALUE_TRANSLATIONS = {
  Gender: {
    Male: 'Мужской',
    Female: 'Женский'
  },
  Role: {
    admin: 'Администратор',
    user: 'Пользователь'
  },
  Status: {
    booked: 'Забронировано',
    'checked-in': 'Подтверждено',
    canceled: 'Отменено'
  }
}; 