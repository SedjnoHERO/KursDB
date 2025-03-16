import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Предотвращаем навигацию если клик был по кнопкам действий
    if ((e.target as HTMLElement).closest(`.${styles.ticketActions}`)) {
      return;
    }
    navigate(`/ticket/${ticket.id}`);
  };

  return (
    <div
      className={`${styles.ticketCard} ${styles[ticket.status]}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
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
            onClick={e => {
              e.stopPropagation();
              onAction(ticket.id, 'pay');
            }}
          >
            <FaCreditCard /> Оплатить
          </button>
          <button
            className={styles.cancelButton}
            onClick={e => {
              e.stopPropagation();
              onAction(ticket.id, 'cancel');
            }}
          >
            <FaTimes /> Отменить
          </button>
        </div>
      )}
    </div>
  );
};
