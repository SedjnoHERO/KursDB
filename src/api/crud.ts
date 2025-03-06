import { Supabase } from './supabase';
import { toast } from 'sonner';

export type EntityType = 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';

export const TableAPI = {
  async fetchData(type: EntityType) {
    try {
      const { data, error } = await Supabase.from(type).select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      toast.error('Ошибка при загрузке данных');
      return [];
    }
  },

  async createRecord(type: EntityType, newData: any) {
    try {
      const { data, error } = await Supabase.from(type).insert(newData).select();
      if (error) throw error;
      toast.success('Запись успешно добавлена');
      return data;
    } catch (error) {
      toast.error('Ошибка при создании записи');
      return null;
    }
  },

  async updateRecord(type: EntityType, id: number, updateData: any) {
    try {
      const { data, error } = await Supabase
        .from(type)
        .update(updateData)
        .eq('id', id)
        .select();
      if (error) throw error;
      toast.success('Запись успешно обновлена');
      return data;
    } catch (error) {
      toast.error('Ошибка при обновлении записи');
      return null;
    }
  },

  async deleteRecord(type: EntityType, id: number) {
    try {
      const { error } = await Supabase.from(type).delete().eq('id', id);
      if (error) throw error;
      toast.success('Запись успешно удалена');
      return true;
    } catch (error) {
      toast.error('Ошибка при удалении записи');
      return false;
    }
  }
};
