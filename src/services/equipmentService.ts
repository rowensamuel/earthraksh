import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Equipment, EquipmentMaintenance } from '../types';

export const equipmentService = {
  async getEquipment(userId?: string): Promise<Equipment[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('equipment').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching equipment:', error);
      throw new Error(error.message);
    }
    return (data || []) as Equipment[];
  },

  async addEquipment(equipment: Omit<Equipment, 'equipment_id'>): Promise<Equipment> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add equipment.');
    }

    const { data, error } = await supabase
      .from('equipment')
      .insert([{
        user_id: user.id,
        equipment_name: equipment.equipment_name,
        model: equipment.model,
        purchase_date: equipment.purchase_date,
        rental_rate_per_day: equipment.rental_rate_per_day,
        availability_status: equipment.availability_status || 'Available',
        condition_status: equipment.condition_status || 'Good',
        image_url: equipment.image_url,
        description: equipment.description,
        location: equipment.location
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding equipment:', error);
      throw new Error(error.message);
    }
    return data as Equipment;
  },

  async updateEquipment(equipmentId: string, updates: Partial<Equipment>): Promise<Equipment> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('equipment_id', equipmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating equipment:', error);
      throw new Error(error.message);
    }
    return data as Equipment;
  },

  async updateEquipmentStatus(
    equipmentId: string,
    availability_status: Equipment['availability_status']
  ): Promise<Equipment> {
    return this.updateEquipment(equipmentId, { availability_status });
  },

  async deleteEquipment(equipmentId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('equipment_id', equipmentId);

    if (error) {
      console.error('Error deleting equipment:', error);
      throw new Error(error.message);
    }
  },

  async getMaintenance(equipmentId?: string): Promise<EquipmentMaintenance[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('equipment_maintenance').select('*');
    if (equipmentId) {
      query = query.eq('equipment_id', equipmentId);
    }

    const { data, error } = await query.order('maintenance_date', { ascending: false });
    if (error) {
      console.error('Error fetching maintenance records:', error);
      throw new Error(error.message);
    }
    return (data || []) as EquipmentMaintenance[];
  },

  async addMaintenance(maintenance: Omit<EquipmentMaintenance, 'maintenance_id'>): Promise<EquipmentMaintenance> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('equipment_maintenance')
      .insert([{
        equipment_id: maintenance.equipment_id,
        maintenance_type: maintenance.maintenance_type,
        cost: maintenance.cost,
        maintenance_date: maintenance.maintenance_date,
        next_due_date: maintenance.next_due_date,
        notes: maintenance.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding equipment maintenance:', error);
      throw new Error(error.message);
    }
    return data as EquipmentMaintenance;
  },

  async deleteMaintenance(maintenanceId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('equipment_maintenance')
      .delete()
      .eq('maintenance_id', maintenanceId);

    if (error) {
      console.error('Error deleting maintenance record:', error);
      throw new Error(error.message);
    }
  }
};
