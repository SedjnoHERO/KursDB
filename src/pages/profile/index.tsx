import React, { useState, useEffect } from 'react';
import { Layout } from '@modules';
import { FaUser, FaTicketAlt, FaEdit, FaPlane } from 'react-icons/fa';
import { useAuth } from '@config';
import { TableAPI } from '@api';
import { Supabase } from '@api';
import { toast } from 'sonner';
import styles from './style.module.scss';
import { Link } from 'react-router-dom';
import { TicketCard } from '@components';

interface UserProfile {
  PassengerID?: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  DateOfBirth: string;
  Gender: 'Male' | 'Female';
  PassportSeries?: string;
  PassportNumber?: string;
  Role?: 'admin' | 'user';
}

interface Ticket {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  status: 'booked' | 'checked-in' | 'canceled';
}

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditClick: () => void;
}

interface ProfileInfoProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface InfoFieldProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TicketsListProps {
  tickets: Ticket[];
  onTicketAction: (ticketId: string, action: 'pay' | 'cancel') => void;
}

interface TicketResponse {
  TicketID: number;
  Status: string;
  Price: number;
  FLIGHT: {
    FlightID: number;
    DepartureTime: string;
    DepartureAirport: { City: string };
    ArrivalAirport: { City: string };
  };
}

const ProfileHeader = ({ isEditing, onEditClick }: ProfileHeaderProps) => (
  <div className={styles.header}>
    <h1>
      <FaUser /> Личный кабинет
    </h1>
    <button className={styles.editButton} onClick={onEditClick}>
      {isEditing ? 'Сохранить' : 'Редактировать'}
      <FaEdit />
    </button>
  </div>
);

const ProfileInfo = ({ profile, isEditing, onChange }: ProfileInfoProps) => (
  <div className={styles.profileInfo}>
    <div className={styles.infoGrid}>
      <InfoField
        label="Имя"
        name="FirstName"
        value={profile.FirstName}
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Фамилия"
        name="LastName"
        value={profile.LastName}
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Email"
        name="Email"
        value={profile.Email}
        type="email"
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Телефон"
        name="Phone"
        value={profile.Phone || ''}
        type="tel"
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Дата рождения"
        name="DateOfBirth"
        value={profile.DateOfBirth}
        type="date"
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Пол"
        name="Gender"
        value={profile.Gender === 'Male' ? 'Мужской' : 'Женский'}
        type="select"
        isEditing={isEditing}
        onChange={onChange}
      />

      <InfoField
        label="Серия паспорта"
        name="PassportSeries"
        value={profile.PassportSeries || ''}
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoField
        label="Номер паспорта"
        name="PassportNumber"
        value={profile.PassportNumber || ''}
        isEditing={isEditing}
        onChange={onChange}
      />
    </div>
  </div>
);

const InfoField = ({
  label,
  name,
  value,
  type = 'text',
  isEditing,
  onChange,
}: InfoFieldProps) => (
  <div className={styles.infoGroup}>
    <label>{label}</label>
    {isEditing ? (
      <input type={type} name={name} value={value} onChange={onChange} />
    ) : (
      <p>{value}</p>
    )}
  </div>
);

const EmptyTickets = () => (
  <div className={styles.emptyTickets}>
    <FaTicketAlt size={48} />
    <h3>У вас пока нет билетов</h3>
    <p>Выберите подходящий рейс из нашего каталога</p>
    <Link to="/catalog" className={styles.catalogButton}>
      <FaPlane /> Перейти в каталог
    </Link>
  </div>
);

const TicketsList = ({ tickets, onTicketAction }: TicketsListProps) => (
  <div className={styles.ticketsSection}>
    <h2>
      <FaTicketAlt /> Мои билеты
    </h2>
    <div className={styles.ticketsList}>
      {tickets.length > 0 ? (
        tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onAction={onTicketAction}
          />
        ))
      ) : (
        <EmptyTickets />
      )}
    </div>
  </div>
);

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    FirstName: '',
    LastName: '',
    Email: user?.email || '',
    Phone: '',
    DateOfBirth: new Date().toISOString().split('T')[0],
    Gender: 'Male',
    Role: user?.role,
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null,
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;

      try {
        const { data: passenger, error } = await Supabase.from('PASSENGER')
          .select('*')
          .eq('Email', user.email)
          .single();

        if (!error && passenger) {
          setProfile(passenger as UserProfile);
          setOriginalProfile(passenger as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Ошибка при загрузке данных пользователя');
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!originalProfile?.PassengerID) return;

      try {
        const { data: tickets, error } = await Supabase.from('TICKET')
          .select(
            `
            TicketID,
            Status,
            Price,
            FLIGHT (
              FlightID,
              DepartureTime,
              DepartureAirport:DepartureAirportID(City),
              ArrivalAirport:ArrivalAirportID(City)
            )
          `,
          )
          .eq('PassengerID', originalProfile.PassengerID)
          .returns<TicketResponse[]>();

        if (error) throw error;

        if (tickets) {
          setTickets(
            tickets.map(ticket => ({
              id: ticket.TicketID.toString(),
              from: ticket.FLIGHT.DepartureAirport.City,
              to: ticket.FLIGHT.ArrivalAirport.City,
              date: new Date(ticket.FLIGHT.DepartureTime).toLocaleDateString(
                'ru-RU',
              ),
              time: new Date(ticket.FLIGHT.DepartureTime).toLocaleTimeString(
                'ru-RU',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              ),
              price: ticket.Price,
              status: ticket.Status.toLowerCase() as
                | 'booked'
                | 'checked-in'
                | 'canceled',
            })),
          );
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Ошибка при загрузке билетов');
      }
    };

    fetchUserTickets();
  }, [originalProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!originalProfile?.PassengerID) return;

    // Проверяем, есть ли изменения
    const hasChanges = Object.keys(profile).some(
      key =>
        profile[key as keyof UserProfile] !==
        originalProfile[key as keyof UserProfile],
    );

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedProfile = await TableAPI.updateRecord(
        'PASSENGER',
        originalProfile.PassengerID,
        profile,
      );

      if (updatedProfile) {
        setIsEditing(false);
        setProfile(updatedProfile as UserProfile);
        setOriginalProfile(updatedProfile as UserProfile);
        toast.success('Профиль успешно обновлен');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handleTicketAction = async (
    ticketId: string,
    action: 'pay' | 'cancel',
  ) => {
    try {
      const { error } = await Supabase.from('TICKET')
        .update({
          Status: action === 'pay' ? 'checked-in' : 'canceled',
          PurchaseDate: action === 'pay' ? new Date().toISOString() : undefined,
        })
        .eq('TicketID', ticketId);

      if (error) throw error;

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: action === 'pay' ? 'checked-in' : 'canceled',
              }
            : ticket,
        ),
      );

      toast.success(
        action === 'pay' ? 'Билет успешно оплачен' : 'Бронирование отменено',
      );
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Ошибка при обновлении билета');
    }
  };

  if (!originalProfile) {
    return (
      <Layout>
        <div className={styles.profilePage}>
          <div className={styles.contentContainer}>
            <div>Загрузка...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.profilePage}>
        <div className={styles.contentContainer}>
          <div className={styles.profileSection}>
            <ProfileHeader
              isEditing={isEditing}
              onEditClick={() =>
                isEditing ? handleSaveProfile() : setIsEditing(true)
              }
            />
            <ProfileInfo
              profile={profile}
              isEditing={isEditing}
              onChange={handleProfileChange}
            />
          </div>
          <TicketsList tickets={tickets} onTicketAction={handleTicketAction} />
        </div>
      </div>
    </Layout>
  );
};
