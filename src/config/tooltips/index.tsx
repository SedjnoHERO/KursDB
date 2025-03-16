import React from 'react';
import styles from './style.module.scss';
import { EntityType } from '@api';

interface TooltipSection {
  title: string;
  text: string;
  isHint?: boolean;
}

interface TooltipProps {
  content: TooltipSection[];
  position?: { x: number; y: number };
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position }) => {
  return (
    <span className={styles.tooltip}>
      ?
      <span
        className={styles.tooltipContent}
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        {content.map((section, index) => (
          <div
            key={index}
            className={`${styles.tooltipSection} ${section.isHint ? styles.hint : ''}`}
          >
            <div className={styles.tooltipTitle}>{section.title}</div>
            <div className={styles.tooltipText}>{section.text}</div>
          </div>
        ))}
      </span>
    </span>
  );
};

export const getFieldTooltip = (
  field: string,
  type: EntityType,
): TooltipSection[] => {
  const tooltipContent: TooltipSection[] = [];

  // Добавляем описание поля
  switch (field) {
    case 'Gender':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите пол пассажира',
      });
      break;
    case 'Role':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите роль пользователя в системе',
      });
      break;
    case 'Status':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите статус записи',
      });
      break;
    case 'FlightID':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите номер рейса',
      });
      break;
    case 'AirplaneID':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите модель самолета',
      });
      break;
    case 'DepartureAirportID':
    case 'ArrivalAirportID':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите аэропорт',
      });
      break;
    case 'AirlineID':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите авиакомпанию',
      });
      break;
    case 'PassengerID':
      tooltipContent.push({
        title: 'Описание',
        text: 'Выберите пассажира',
      });
      break;
  }

  // Добавляем правила ввода
  switch (field) {
    case 'FirstName':
    case 'LastName':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Только буквы, пробелы и дефисы',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: Иван Иванов',
        isHint: true,
      });
      break;
    case 'Email':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Должен содержать @ и домен',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: user@example.com',
        isHint: true,
      });
      break;
    case 'Phone':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'От 10 до 15 цифр, может начинаться с +',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: +375291234567',
        isHint: true,
      });
      break;
    case 'PassportSeries':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Только 2 заглавные буквы',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: AB',
        isHint: true,
      });
      break;
    case 'PassportNumber':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Только 7 цифр',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 1234567',
        isHint: true,
      });
      break;
    case 'FlightNumber':
      tooltipContent.push({
        title: 'Правила ввода',
        text: '2 заглавные буквы + 3-4 цифры',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: AA123',
        isHint: true,
      });
      break;
    case 'Capacity':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'От 5 до 555 пассажиров',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 180',
        isHint: true,
      });
      break;
    case 'Price':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Минимальная цена: 0 BYN',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 150.50',
        isHint: true,
      });
      break;
    case 'DateOfBirth':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Возраст от 2 до 90 лет',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 1990-01-01',
        isHint: true,
      });
      break;
    case 'DepartureTime':
    case 'ArrivalTime':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Длительность полета не более 24 часов',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 2024-03-20 10:00',
        isHint: true,
      });
      break;
    case 'PurchaseDate':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Не более года назад',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 2024-03-20 15:30',
        isHint: true,
      });
      break;
    case 'SeatNumber':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Номер места в формате: ряд + буква места',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: 12A, 15B, 20C',
        isHint: true,
      });
      break;
    case 'Model':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Название модели самолета',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: Boeing 737, Airbus A320',
        isHint: true,
      });
      break;
    case 'Name':
      if (type === 'AIRLINE') {
        tooltipContent.push({
          title: 'Правила ввода',
          text: 'Название авиакомпании',
        });
        tooltipContent.push({
          title: 'Подсказка',
          text: 'Например: Belavia, Turkish Airlines',
          isHint: true,
        });
      } else if (type === 'AIRPORT') {
        tooltipContent.push({
          title: 'Правила ввода',
          text: 'Название аэропорта',
        });
        tooltipContent.push({
          title: 'Подсказка',
          text: 'Например: Национальный аэропорт Минск',
          isHint: true,
        });
      }
      break;
    case 'City':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Город расположения аэропорта',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: Минск, Москва, Париж',
        isHint: true,
      });
      break;
    case 'Country':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Страна расположения аэропорта',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: Беларусь, Россия, Франция',
        isHint: true,
      });
      break;
    case 'IATA':
      tooltipContent.push({
        title: 'Правила ввода',
        text: 'Трехбуквенный код аэропорта по стандарту IATA',
      });
      tooltipContent.push({
        title: 'Подсказка',
        text: 'Например: MSQ (Минск), SVO (Москва), CDG (Париж)',
        isHint: true,
      });
      break;
  }

  return tooltipContent;
};
