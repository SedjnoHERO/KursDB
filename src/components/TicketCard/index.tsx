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
} from 'react-icons/fa';
import { TableAPI, Supabase } from '@api';
import { toast } from 'sonner';
import styles from './style.module.scss';

interface AircraftInfo {
  Model: string;
  Capacity: number;
  AIRLINE: {
    Name: string;
  };
}

interface FlightData {
  AIRPLANE: AircraftInfo;
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

        if (data?.AIRPLANE) {
          setAircraftInfo({
            model: data.AIRPLANE.Model,
            capacity: data.AIRPLANE.Capacity,
            airline: data.AIRPLANE.AIRLINE.Name,
          });
        }
      } catch (error) {
        console.error('Error fetching aircraft info:', error);
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
    </div>
  );
};
