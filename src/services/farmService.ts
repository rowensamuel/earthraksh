import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Farm } from '../types';

export const farmService = {
  async getFarms(userId?: string): Promise<Farm[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If not explicitly provided, check if user is admin or filter by user.id
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userProfile?.role !== 'ADMIN') {
          targetUserId = user.id;
        }
      }
    }

    let query = supabase.from('farms').select('*');
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching farms:', error);
      throw new Error(error.message);
    }
    return (data || []) as Farm[];
  },

  async addFarm(farm: Omit<Farm, 'farm_id'>): Promise<Farm> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add a farm.');
    }

    const { data, error } = await supabase
      .from('farms')
      .insert([{
        user_id: user.id,
        farm_name: farm.farm_name,
        location: farm.location,
        area: farm.area,
        area_unit: farm.area_unit,
        soil_type: farm.soil_type,
        water_source: farm.water_source,
        established_year: farm.established_year,
        active_crops_count: farm.active_crops_count || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding farm:', error);
      throw new Error(error.message);
    }
    return data as Farm;
  },

  async updateFarm(farmId: string, updates: Partial<Farm>): Promise<Farm> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('farms')
      .update(updates)
      .eq('farm_id', farmId)
      .select()
      .single();

    if (error) {
      console.error('Error updating farm:', error);
      throw new Error(error.message);
    }
    return data as Farm;
  },

  async deleteFarm(farmId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('farm_id', farmId);

    if (error) {
      console.error('Error deleting farm:', error);
      throw new Error(error.message);
    }
  }
};
