import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Crop } from '../types';

export const cropService = {
  async getCrops(farmId?: string): Promise<Crop[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('crops').select('*');
    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching crops:', error);
      throw new Error(error.message);
    }
    return (data || []) as Crop[];
  },

  async addCrop(crop: Omit<Crop, 'crop_id'>): Promise<Crop> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('crops')
      .insert([{
        farm_id: crop.farm_id,
        crop_name: crop.crop_name,
        variety: crop.variety,
        season: crop.season,
        planting_date: crop.planting_date,
        expected_harvest: crop.expected_harvest,
        status: crop.status || 'Planted',
        expected_yield: crop.expected_yield,
        actual_yield: crop.actual_yield,
        health_score: crop.health_score || 85
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding crop:', error);
      throw new Error(error.message);
    }

    // Increment active_crops_count on the farm
    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('active_crops_count')
        .eq('farm_id', crop.farm_id)
        .single();
      if (farm) {
        await supabase
          .from('farms')
          .update({ active_crops_count: (farm.active_crops_count || 0) + 1 })
          .eq('farm_id', crop.farm_id);
      }
    } catch (e) {
      console.warn('Could not increment farm crop count:', e);
    }

    return data as Crop;
  },

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<Crop> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('crop_id', cropId)
      .select()
      .single();

    if (error) {
      console.error('Error updating crop:', error);
      throw new Error(error.message);
    }
    return data as Crop;
  },

  async updateCropStatus(cropId: string, status: Crop['status']): Promise<Crop> {
    return this.updateCrop(cropId, { status });
  },

  async deleteCrop(cropId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Get farm_id first to decrement count
    const { data: crop } = await supabase
      .from('crops')
      .select('farm_id')
      .eq('crop_id', cropId)
      .maybeSingle();

    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('crop_id', cropId);

    if (error) {
      console.error('Error deleting crop:', error);
      throw new Error(error.message);
    }

    if (crop?.farm_id) {
      try {
        const { data: farm } = await supabase
          .from('farms')
          .select('active_crops_count')
          .eq('farm_id', crop.farm_id)
          .single();
        if (farm && farm.active_crops_count > 0) {
          await supabase
            .from('farms')
            .update({ active_crops_count: farm.active_crops_count - 1 })
            .eq('farm_id', crop.farm_id);
        }
      } catch (e) {
        console.warn('Could not decrement farm crop count:', e);
      }
    }
  }
};
