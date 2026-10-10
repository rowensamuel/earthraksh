import { supabase, isSupabaseConfigured } from './supabaseClient';
import { FinanceRecord } from '../types';

export const financeService = {
  async getFinance(userId?: string): Promise<FinanceRecord[]> {
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

    let query = supabase.from('finance').select('*');
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });
    if (error) {
      console.error('Error fetching finance records:', error);
      throw new Error(error.message);
    }
    return (data || []) as FinanceRecord[];
  },

  async addFinanceRecord(record: Omit<FinanceRecord, 'finance_id'>): Promise<FinanceRecord> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add finance records.');
    }

    const { data, error } = await supabase
      .from('finance')
      .insert([{
        user_id: user.id,
        transaction_type: record.transaction_type,
        category: record.category,
        amount: record.amount,
        transaction_date: record.transaction_date || new Date().toISOString().split('T')[0],
        description: record.description,
        reference_no: record.reference_no || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding finance record:', error);
      throw new Error(error.message);
    }
    return data as FinanceRecord;
  },

  async deleteFinanceRecord(financeId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('finance')
      .delete()
      .eq('finance_id', financeId);

    if (error) {
      console.error('Error deleting finance record:', error);
      throw new Error(error.message);
    }
  }
};
