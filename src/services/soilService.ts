import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SoilHealth } from '../types';

export const soilService = {
  async getSoilRecords(farmId?: string): Promise<SoilHealth[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('soil_health').select('*');
    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('test_date', { ascending: false });
    if (error) {
      console.error('Error fetching soil records:', error);
      throw new Error(error.message);
    }
    return (data || []) as SoilHealth[];
  },

  async addSoilRecord(record: Omit<SoilHealth, 'soil_id'>): Promise<SoilHealth> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('soil_health')
      .insert([{
        farm_id: record.farm_id,
        ph_level: record.ph_level,
        nitrogen: record.nitrogen,
        phosphorus: record.phosphorus,
        potassium: record.potassium,
        moisture: record.moisture,
        organic_carbon: record.organic_carbon,
        fertility_status: record.fertility_status,
        test_date: record.test_date || new Date().toISOString().split('T')[0],
        recommendations: record.recommendations || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding soil health record:', error);
      throw new Error(error.message);
    }
    return data as SoilHealth;
  },

  async updateSoilRecord(soilId: string, updates: Partial<SoilHealth>): Promise<SoilHealth> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('soil_health')
      .update(updates)
      .eq('soil_id', soilId)
      .select()
      .single();

    if (error) {
      console.error('Error updating soil record:', error);
      throw new Error(error.message);
    }
    return data as SoilHealth;
  },

  async deleteSoilRecord(soilId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('soil_health')
      .delete()
      .eq('soil_id', soilId);

    if (error) {
      console.error('Error deleting soil health record:', error);
      throw new Error(error.message);
    }
  }
};
