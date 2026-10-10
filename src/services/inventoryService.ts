import { supabase, isSupabaseConfigured } from './supabaseClient';
import { InventoryItem } from '../types';

export const LOW_STOCK_THRESHOLD = 50;

export const inventoryService = {
  async getInventory(userId?: string): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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

    let query = supabase.from('inventory').select('*');
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching inventory:', error);
      throw new Error(error.message);
    }

    return ((data || []) as any[]).map(item => ({
      ...item,
      status: item.quantity <= 10 ? 'Critical' : item.quantity <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock'
    })) as InventoryItem[];
  },

  async addInventoryItem(item: Omit<InventoryItem, 'item_id'>): Promise<InventoryItem> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add inventory.');
    }

    const calculatedStatus = item.quantity <= 10 ? 'Critical' : item.quantity <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';

    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        user_id: user.id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        supplier: item.supplier,
        status: calculatedStatus,
        expiry_date: item.expiry_date || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding inventory item:', error);
      throw new Error(error.message);
    }
    return data as InventoryItem;
  },

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const patch: any = { ...updates };
    if (patch.quantity !== undefined) {
      patch.status = patch.quantity <= 10 ? 'Critical' : patch.quantity <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(patch)
      .eq('item_id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw new Error(error.message);
    }
    return data as InventoryItem;
  },

  async deleteInventoryItem(itemId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('item_id', itemId);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error(error.message);
    }
  }
};
