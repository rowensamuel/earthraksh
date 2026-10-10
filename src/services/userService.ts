import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User } from '../types';

export const userService = {
  async getUserProfile(userId: string): Promise<User | undefined> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.message);
    }

    if (!data) return undefined;

    return {
      user_id: data.user_id,
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      mobile: data.mobile || '',
      address: data.address || '',
      status: data.status,
      created_at: data.created_at?.split('T')[0] || '',
      designation: data.designation,
      verified: data.verified,
      avatar_url: data.avatar_url
    };
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.mobile !== undefined) payload.mobile = updates.mobile;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.designation !== undefined) payload.designation = updates.designation;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile in Supabase:', error);
      throw new Error(error.message);
    }

    return {
      user_id: data.user_id,
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      mobile: data.mobile || '',
      address: data.address || '',
      status: data.status,
      created_at: data.created_at?.split('T')[0] || '',
      designation: data.designation,
      verified: data.verified,
      avatar_url: data.avatar_url
    };
  }
};
