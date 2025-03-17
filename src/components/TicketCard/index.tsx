import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlane,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCreditCard,
  FaTimes,
  FaFileAlt,
  FaReceipt,
} from 'react-icons/fa';
import { TableAPI, Supabase } from '@api';
import { toast } from 'sonner';
import styles from './style.module.scss';
import { Button, downloadDocument, generateDocument } from '@components';

interface AircraftInfo {
  Model: string;
  Capacity: number;
  AIRLINE: {
    Name: string;
  };
}

interface FlightData {
  AIRPLANE: AircraftInfo;
  FlightNumber: string;
}

export interface ITicketProps {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  status: 'booked' | 'canceled' | 'checked-in';
  airline?: string;
  aircraft?: string;
  seatNumber?: string;
  flightId?: string;
  flightNumber?: string;
  passengerName?: string;
  departureTime?: string;
  purchaseDate?: string;
  PassengerID?: string | number;
}

interface ITicketCardProps {
  ticket: ITicketProps;
  onAction?: (ticketId: string, action: 'pay' | 'cancel') => void;
}

export const TicketCard = ({
  ticket: initialTicket,
  onAction,
}: ITicketCardProps) => {
  const [ticket, setTicket] = useState(initialTicket);
  const [aircraftInfo, setAircraftInfo] = useState<{
    model: string;
    capacity: number;
    airline: string;
  } | null>(null);

  useEffect(() => {
    const fetchAircraftInfo = async () => {
      if (!ticket.flightId) return;

      try {
        const { data, error } = await Supabase.from('FLIGHT')
          .select(
            `
            FlightNumber,
            AIRPLANE:AirplaneID (
              Model,
              Capacity,
              AIRLINE:AirlineID (
                Name
              )
            )
          `,
          )
          .eq('FlightID', ticket.flightId)
          .single<FlightData>();

        if (error) throw error;

        if (data) {
          console.log('Полученные данные рейса:', data);
          setAircraftInfo({
            model: data.AIRPLANE.Model,
            capacity: data.AIRPLANE.Capacity,
            airline: data.AIRPLANE.AIRLINE.Name,
          });

          setTicket(prev => ({
            ...prev,
            flightNumber: data.FlightNumber,
          }));
        }
      } catch (error) {
        console.error('Ошибка при получении данных рейса:', error);
      }
    };

    fetchAircraftInfo();
  }, [ticket.flightId]);

  const searchParams = new URLSearchParams({
    from: ticket.from,
    to: ticket.to,
    date: ticket.date,
    time: ticket.time,
    price: ticket.price.toString(),
    status: ticket.status,
    airline: aircraftInfo?.airline || 'Не указана',
    aircraft: aircraftInfo?.model || 'Не указан',
    seatNumber: ticket.seatNumber || '',
  });

  const handleAction = async (action: 'pay' | 'cancel') => {
    try {
      const newStatus = action === 'pay' ? 'checked-in' : 'canceled';

      const result = await TableAPI.updateRecord('TICKET', Number(ticket.id), {
        Status: newStatus,
      });

      if (!result) {
        throw new Error('Не удалось обновить статус билета');
      }

      setTicket(prev => ({
        ...prev,
        status: newStatus,
      }));

      if (onAction) {
        onAction(ticket.id, action);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Произошла ошибка при обновлении статуса билета');
    }
  };

  const handleDocumentGeneration = async (type: 'ticket' | 'receipt') => {
    try {
      console.log('Данные билета перед генерацией:', ticket);

      if (!ticket.flightId) {
        toast.error('Отсутствует ID рейса');
        return;
      }

      // Сначала получаем данные о рейсе
      const { data: flightData, error: flightError } = await Supabase.from(
        'FLIGHT',
      )
        .select(
          `
          FlightNumber,
          DepartureTime,
          ArrivalTime,
          AIRPLANE (
            Model,
            Capacity,
            AIRLINE (
              Name
            )
          )
        `,
        )
        .eq('FlightID', ticket.flightId)
        .single();

      if (flightError || !flightData) {
        console.error('Ошибка при получении данных рейса:', flightError);
        toast.error('Не удалось получить данные рейса');
        return;
      }

      // Затем получаем данные о пассажире
      const { data: passengerData, error: passengerError } =
        await Supabase.from('PASSENGER')
          .select(
            `
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
          .eq('PassengerID', ticket.PassengerID)
          .single();

      if (passengerError) {
        console.error('Ошибка при получении данных пассажира:', passengerError);
        // Продолжаем выполнение, так как данные пассажира не критичны
      }

      console.log('Полученные данные рейса:', flightData);
      console.log('Полученные данные пассажира:', passengerData);

      const documentData = {
        TicketID: ticket.id,
        FlightNumber: flightData.FlightNumber,
        DepartureTime: flightData.DepartureTime,
        ArrivalTime: flightData.ArrivalTime,
        FLIGHT: flightData,
        PASSENGER: passengerData || null,
        AIRPLANE: flightData.AIRPLANE,
        Price: ticket.price,
        PurchaseDate: ticket.purchaseDate,
        SeatNumber: ticket.seatNumber || 'Не указано',
        from: ticket.from,
        to: ticket.to,
        Status: ticket.status,
      };

      console.log('Данные для генерации документа:', documentData);
      await downloadDocument(type, documentData);
      toast.success(
        `${type === 'ticket' ? 'Билет' : 'Чек'} успешно сгенерирован`,
      );
    } catch (error) {
      console.error('Ошибка при генерации документа:', error);
      toast.error('Не удалось сгенерировать документ');
    }
  };

  return (
    <div className={`${styles.ticketCard} ${styles[ticket.status]}`}>
      <Link
        to={`/ticket/${ticket.id}?${searchParams.toString()}`}
        className={styles.ticketContent}
      >
        <div className={styles.ticketInfo}>
          <div className={styles.route}>
            <h3>
              <FaPlane /> {ticket.from} → {ticket.to}
            </h3>
            <p>
              <FaCalendarAlt /> {ticket.date}
              <FaClock /> {ticket.time}
            </p>
            {aircraftInfo && (
              <p className={styles.aircraftInfo}>
                Авиакомпания: {aircraftInfo.airline} | Самолет:{' '}
                {aircraftInfo.model} | Вместимость: {aircraftInfo.capacity} мест
              </p>
            )}
          </div>
          <div className={styles.price}>
            <p>{ticket.price} BYN</p>
            <span className={`${styles.status} ${styles[ticket.status]}`}>
              {ticket.status === 'booked' && (
                <>
                  <FaHourglassHalf /> Забронирован
                </>
              )}
              {ticket.status === 'checked-in' && (
                <>
                  <FaCheckCircle /> Оплачен
                </>
              )}
              {ticket.status === 'canceled' && (
                <>
                  <FaTimesCircle /> Отменен
                </>
              )}
            </span>
          </div>
        </div>
      </Link>
      {ticket.status === 'booked' && (
        <div className={styles.ticketActions}>
          <button
            className={styles.payButton}
            onClick={e => {
              e.preventDefault();
              handleAction('pay');
            }}
          >
            <FaCreditCard /> Оплатить
          </button>
          <button
            className={styles.cancelButton}
            onClick={e => {
              e.preventDefault();
              handleAction('cancel');
            }}
          >
            <FaTimes /> Отменить
          </button>
        </div>
      )}
      <div className={styles.actions}>
        {ticket.status === 'checked-in' && (
          <>
            <Button
              variant="outline"
              leftIcon={<FaFileAlt />}
              label="Билет"
              onClick={() => handleDocumentGeneration('ticket')}
            />
            <Button
              variant="outline"
              leftIcon={<FaReceipt />}
              label="Чек"
              onClick={() => handleDocumentGeneration('receipt')}
            />
          </>
        )}
      </div>
    </div>
  );
};
