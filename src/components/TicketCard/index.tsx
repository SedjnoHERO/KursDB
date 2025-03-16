import React from 'react';
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
import styles from './style.module.scss';

export interface Ticket {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  status: 'booked' | 'paid' | 'cancelled';
}

interface TicketCardProps {
  ticket: Ticket;
  onAction?: (ticketId: string, action: 'pay' | 'cancel') => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onAction }) => {
  return (
    <div className={`${styles.ticketCard} ${styles[ticket.status]}`}>
      <div className={styles.ticketInfo}>
        <div className={styles.route}>
          <h3>
            <FaPlane /> {ticket.from} → {ticket.to}
          </h3>
          <p>
            <FaCalendarAlt /> {ticket.date}
            <FaClock /> {ticket.time}
          </p>
        </div>
        <div className={styles.price}>
          <p>{ticket.price} BYN</p>
          <span className={`${styles.status} ${styles[ticket.status]}`}>
            {ticket.status === 'booked' && (
              <>
                <FaHourglassHalf /> Забронирован
              </>
            )}
            {ticket.status === 'paid' && (
              <>
                <FaCheckCircle /> Оплачен
              </>
            )}
            {ticket.status === 'cancelled' && (
              <>
                <FaTimesCircle /> Отменен
              </>
            )}
          </span>
        </div>
      </div>
      {ticket.status === 'booked' && onAction && (
        <div className={styles.ticketActions}>
          <button
            className={styles.payButton}
            onClick={() => onAction(ticket.id, 'pay')}
          >
            <FaCreditCard /> Оплатить
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => onAction(ticket.id, 'cancel')}
          >
            <FaTimes /> Отменить
          </button>
        </div>
      )}
    </div>
  );
};
