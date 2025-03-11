import { Supabase } from './supabase';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export type EntityType = 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';

// Базовые интерфейсы для каждой сущности
interface Airport {
  AirportID: number;
  Name: string;
  City: string;
  Country: string;
  Code: string;
}

interface Airline {
  AirlineID: number;
  Name: string;
  Country: string;
}

interface Airplane {
  AirplaneID: number;
  AirlineID: number;
  Model: string;
  Capacity: number;
}

interface Flight {
  FlightID: number;
  FlightNumber: string;
  AirplaneID: number;
  DepartureAirportID: number;
  ArrivalAirportID: number;
  DepartureTime: string; // ISO string для времени
  ArrivalTime: string;
}

interface Passenger {
  PassengerID: number;
  Gender: 'Male' | 'Female';
  FirstName: string | null;
  LastName: string | null;
  PassportSeries: string | null;
  PassportNumber: string | null;
  DateOfBirth: string | null;
  Phone: string | null;
  Email: string | null;
  Role: 'admin' | 'user' | null;
}

interface Ticket {
  TicketID: number;
  FlightID: number;
  PassengerID: number;
  PurchaseDate: string; // ISO string для времени
  SeatNumber: string;
  Price: number;
  Status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
}

// Маппинг типов сущностей к их интерфейсам
type EntityTypeToInterface = {
  AIRPORT: Airport;
  AIRLINE: Airline;
  AIRPLANE: Airplane;
  FLIGHT: Flight;
  TICKET: Ticket;
  PASSENGER: Passenger;
};

// Маппинг типов сущностей к их ID полям
type EntityTypeToIDField = {
  AIRPORT: 'AirportID';
  AIRLINE: 'AirlineID';
  AIRPLANE: 'AirplaneID';
  FLIGHT: 'FlightID';
  TICKET: 'TicketID';
  PASSENGER: 'PassengerID';
};

class TableAPIService {
  private readonly idFields: EntityTypeToIDField = {
    AIRPORT: 'AirportID',
    AIRLINE: 'AirlineID',
    AIRPLANE: 'AirplaneID',
    FLIGHT: 'FlightID',
    TICKET: 'TicketID',
    PASSENGER: 'PassengerID'
  };

  private handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    if (error instanceof PostgrestError) {
      switch (error.code) {
        case '23505':
          toast.error('Запись с такими данными уже существует');
          break;
        case '23503':
          toast.error('Невозможно выполнить операцию: нарушение целостности данных');
          break;
        default:
          toast.error(`Ошибка базы данных: ${error.message}`);
      }
    } else {
      toast.error(message);
    }
    throw error;
  }

  async fetchData<T extends EntityType>(
    type: T
  ): Promise<EntityTypeToInterface[T][]> {
    try {
      const { data, error } = await Supabase
        .from(type)
        .select('*')
        .order(this.idFields[type], { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async createRecord<T extends EntityType>(
    type: T,
    newData: Omit<EntityTypeToInterface[T], EntityTypeToIDField[T]>
  ): Promise<EntityTypeToInterface[T] | null> {
    try {
      const { data, error } = await Supabase
        .from(type)
        .insert(newData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Запись успешно добавлена');
      return data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async updateRecord<T extends EntityType>(
    type: T,
    id: number,
    updateData: Partial<Omit<EntityTypeToInterface[T], EntityTypeToIDField[T]>>
  ): Promise<EntityTypeToInterface[T] | null> {
    try {
      const { data, error } = await Supabase
        .from(type)
        .update(updateData)
        .eq(this.idFields[type], id as any)
        .select()
        .single();

      if (error) throw error;
      toast.success('Запись успешно обновлена');
      return data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async deleteRecord<T extends EntityType>(
    type: T,
    id: number
  ): Promise<boolean> {
    try {
      const { error } = await Supabase
        .from(type)
        .delete()
        .eq(this.idFields[type], id as any);

      if (error) throw error;
      toast.success('Запись успешно удалена');
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  // Дополнительные методы для работы со связанными данными
//   async fetchFlightWithDetails(flightId: number) {
//     try {
//       const { data, error } = await Supabase
//         .from('FLIGHT')
//         .select(`
//           *,
//           airline:AIRLINE(*),
//           airplane:AIRPLANE(*),
//           departure_airport:AIRPORT!DepartureAirportID(*),
//           arrival_airport:AIRPORT!ArrivalAirportID(*)
//         `)
//         .eq('FlightID', flightId)
//         .single();

//       if (error) throw error;
//       return data;
//     } catch (error) {
//       this.handleError(error);
//       return null;
//     }
//   }

//   async fetchTicketWithDetails(ticketId: number) {
//     try {
//       const { data, error } = await Supabase
//         .from('TICKET')
//         .select(`
//           *,
//           flight:FLIGHT(*),
//           passenger:PASSENGER(*)
//         `)
//         .eq('TicketID', ticketId)
//         .single();

//       if (error) throw error;
//       return data;
//     } catch (error) {
//       this.handleError(error);
//       return null;
//     }
//   }
}

export const TableAPI = new TableAPIService();
