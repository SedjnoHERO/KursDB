import { Supabase } from './supabase';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export type EntityType = 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';

// interface BaseEntity {
//   id: number;
// }

interface Airport {
  Name: string;
  City: string;
  Country: string;
  Code: string;
}

interface Airline {
  Name: string;
  Country: string;
}

interface Airplane {
  AirlineID: number;
  Model: string;
  Capacity: number;
}

interface Flight {
  FlightNumber: string;
  AirplaneID: number;
  DepartureAirportID: number;
  ArrivalAirportID: number;
  DepartureTime: string;
  ArrivalTime: string;
}

interface Passenger {
  Gender: 'Male' | 'Female';
  FirstName: string;
  LastName: string;
  PassportSeries?: string;
  PassportNumber?: string;
  DateOfBirth: string;
  Phone?: string;
  Email?: string;
  Role?: 'admin' | 'user';
}

interface Ticket {
  FlightID: number;
  PassengerID: number;
  PurchaseDate?: string;
  SeatNumber: string;
  Price: number;
  Status?: 'booked' | 'canceled' | 'checked-in';
}

type EntityTypeToInterface = {
  AIRPORT: Airport;
  AIRLINE: Airline;
  AIRPLANE: Airplane;
  FLIGHT: Flight;
  TICKET: Ticket;
  PASSENGER: Passenger;
};

class TableAPIService {
  private handleError(error: unknown): false {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    if (error instanceof PostgrestError) {
      console.error('PostgrestError details:', error.details);
      toast.error(`Ошибка базы данных: ${error.message}`);
    } else {
      toast.error(message);
    }
    return false;
  }

  async fetchData<T extends EntityType>(type: T): Promise<EntityTypeToInterface[T][]> {
    try {
      const idField = {
        AIRPORT: 'AirportID',
        AIRLINE: 'AirlineID',
        AIRPLANE: 'AirplaneID',
        FLIGHT: 'FlightID',
        TICKET: 'TicketID',
        PASSENGER: 'PassengerID'
      }[type];

      const { data, error } = await Supabase
        .from(type)
        .select('*')
        .order(idField, { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async createRecord<T extends EntityType>(
    type: T,
    newData: EntityTypeToInterface[T]
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
    updateData: Partial<EntityTypeToInterface[T]>
  ): Promise<EntityTypeToInterface[T] | null> {
    try {
      const idField = {
        AIRPORT: 'AirportID',
        AIRLINE: 'AirlineID',
        AIRPLANE: 'AirplaneID',
        FLIGHT: 'FlightID',
        TICKET: 'TicketID',
        PASSENGER: 'PassengerID'
      }[type] as string;

      const { data, error } = await Supabase
        .from(type)
        .update(updateData)
        .eq(idField, id)
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

  async deleteRecord<T extends EntityType>(type: T, id: number): Promise<boolean> {
    try {
      const idField = {
        AIRPORT: 'AirportID',
        AIRLINE: 'AirlineID',
        AIRPLANE: 'AirplaneID',
        FLIGHT: 'FlightID',
        TICKET: 'TicketID',
        PASSENGER: 'PassengerID'
      }[type] as string;

      const { error } = await Supabase
        .from(type)
        .delete()
        .eq(idField, id);

      if (error) throw error;
      
      toast.success('Запись успешно удалена');
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const TableAPI = new TableAPIService();