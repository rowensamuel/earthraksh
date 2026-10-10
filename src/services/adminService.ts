import { supabase, isSupabaseConfigured, createIsolatedClient } from './supabaseClient';
import { User } from '../types';

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users for admin:', error);
      throw new Error(error.message);
    }
    const userList = (data || []).map(d => ({
      user_id: d.user_id,
      role: d.role,
      full_name: d.full_name,
      email: d.email,
      mobile: d.mobile || '',
      address: d.address || '',
      status: d.status,
      created_at: d.created_at?.split('T')[0] || '',
      designation: d.designation,
      verified: d.verified,
      avatar_url: d.avatar_url
    })) as User[];

    // Cache email to user_id mappings so deleted accounts can be re-added without auth collisions
    try {
      userList.forEach(u => {
        if (u.email && u.user_id) {
          localStorage.setItem(`earthrakshak_auth_map_${u.email.toLowerCase()}`, u.user_id);
        }
      });
    } catch {}

    return userList;
  },

  async getFarmers(): Promise<User[]> {
    const all = await this.getAllUsers();
    return all.filter(u => u.role === 'FARMER');
  },

  async getBuyers(): Promise<User[]> {
    const all = await this.getAllUsers();
    return all.filter(u => u.role === 'BUYER');
  },

  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      throw new Error(error.message);
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.mobile !== undefined) payload.mobile = updates.mobile;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.designation !== undefined) payload.designation = updates.designation;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.verified !== undefined) payload.verified = updates.verified;

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user details:', error);
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
  },

  async deleteUser(userId: string, email?: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Cache email to user_id mapping before deletion
    if (email) {
      try {
        localStorage.setItem(`earthrakshak_auth_map_${email.trim().toLowerCase()}`, userId);
      } catch {}
    } else {
      try {
        const { data: uRec } = await supabase.from('users').select('email').eq('user_id', userId).maybeSingle();
        if (uRec?.email) {
          localStorage.setItem(`earthrakshak_auth_map_${uRec.email.trim().toLowerCase()}`, userId);
        }
      } catch {}
    }

    // Purge completely from auth.users (which cascades to public.users) via RPC
    const { error: rpcError } = await supabase.rpc('delete_user_by_admin', {
      p_user_id: userId
    });

    if (rpcError) {
      console.warn('RPC delete_user_by_admin not available or failed, falling back to public.users delete:', rpcError.message);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user record:', error);
        throw new Error(error.message);
      }
    }
  },

  /**
   * Admin provisions user account without hijacking or replacing the active Admin session.
   * Utilizes an isolated ephemeral client for auth creation, then applies role & metadata with Admin privileges.
   */
  async createUser(user: Omit<User, 'user_id' | 'created_at'>, password?: string): Promise<User> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let isolatedClient = createIsolatedClient();
    if (!isolatedClient) {
      throw new Error('Failed to initialize isolated provisioning client.');
    }

    const tempPassword = (password && password.trim().length >= 6) ? password.trim() : 'EarthRakshak2026!';
    const cleanEmail = user.email.trim().toLowerCase();

    // Known baseline accounts from seed data
    const SEED_AUTH_MAP: Record<string, string> = {
      'admin.vikram@earthrakshak.org': '00000000-0000-0000-0000-000000000001',
      'rajesh.patil@greenvalleyfarm.in': '00000000-0000-0000-0000-000000000002',
      'procurement@agromart.co.in': '00000000-0000-0000-0000-000000000003'
    };

    // 1. Create auth user with isolated client (DO NOT touch primary admin session)
    let { data: authData, error: authError } = await isolatedClient.auth.signUp({
      email: cleanEmail,
      password: tempPassword,
      options: {
        data: {
          full_name: user.full_name,
          role: user.role,
          mobile: user.mobile,
          address: user.address,
          designation: user.designation
        }
      }
    });

    let resolvedUserId: string | null = authData?.user?.id || null;

    // If account was already registered in auth.users, resolve existing user ID
    if (authError && (
      authError.message.toLowerCase().includes('already registered') ||
      authError.message.toLowerCase().includes('already exists')
    )) {
      console.warn('User already exists in Supabase Auth. Resolving user identifier...');
      authError = null;

      // Check seed accounts first
      if (SEED_AUTH_MAP[cleanEmail]) {
        resolvedUserId = SEED_AUTH_MAP[cleanEmail];
      }

      // Check local cache from previously deleted or loaded accounts
      if (!resolvedUserId) {
        try {
          const cached = localStorage.getItem(`earthrakshak_auth_map_${cleanEmail}`);
          if (cached) resolvedUserId = cached;
        } catch {}
      }

      // Check get_auth_user_id RPC if deployed
      if (!resolvedUserId) {
        try {
          const { data: rpcUid } = await supabase.rpc('get_auth_user_id', { p_email: cleanEmail });
          if (rpcUid) resolvedUserId = rpcUid;
        } catch {}
      }

      // Try isolated sign-in to recover auth ID directly
      if (!resolvedUserId) {
        try {
          const { data: signInData } = await isolatedClient.auth.signInWithPassword({
            email: cleanEmail,
            password: tempPassword
          });
          if (signInData?.user?.id) {
            resolvedUserId = signInData.user.id;
          }
        } catch {}
      }

      // Check if user exists in public.users
      if (!resolvedUserId) {
        try {
          const { data: existingInPublic } = await supabase
            .from('users')
            .select('user_id')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (existingInPublic?.user_id) {
            resolvedUserId = existingInPublic.user_id;
          }
        } catch {}
      }
    }

    if (!resolvedUserId) {
      throw new Error(authError?.message || 'Failed to initialize or resolve user account.');
    }

    const newUserId = resolvedUserId;

    // Cache the mapping for future re-creations
    try {
      localStorage.setItem(`earthrakshak_auth_map_${cleanEmail}`, newUserId);
    } catch {}

    // 2. The handle_new_user database trigger automatically inserts the new user into public.users.
    // Check if the trigger already created the profile
    const { data: triggerProfile } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', newUserId)
      .maybeSingle();

    if (triggerProfile) {
      // If role and designation match, return immediately
      if (triggerProfile.role === user.role) {
        return {
          user_id: triggerProfile.user_id,
          role: triggerProfile.role,
          full_name: triggerProfile.full_name,
          email: triggerProfile.email,
          mobile: triggerProfile.mobile || '',
          address: triggerProfile.address || '',
          status: triggerProfile.status,
          created_at: triggerProfile.created_at?.split('T')[0] || '',
          designation: triggerProfile.designation,
          verified: triggerProfile.verified,
          avatar_url: triggerProfile.avatar_url
        };
      }

      // If the trigger created the profile with a default role (e.g. FARMER instead of ADMIN), update it
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('users')
        .update({
          role: user.role,
          designation: user.designation,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', newUserId)
        .select()
        .single();

      if (!updateErr && updatedProfile) {
        return {
          user_id: updatedProfile.user_id,
          role: updatedProfile.role,
          full_name: updatedProfile.full_name,
          email: updatedProfile.email,
          mobile: updatedProfile.mobile || '',
          address: updatedProfile.address || '',
          status: updatedProfile.status,
          created_at: updatedProfile.created_at?.split('T')[0] || '',
          designation: updatedProfile.designation,
          verified: updatedProfile.verified,
          avatar_url: updatedProfile.avatar_url
        };
      }
    }

    // 3. Fallback: If not created by trigger, upsert profile directly
    const userPayload = {
      user_id: newUserId,
      role: user.role,
      full_name: user.full_name,
      email: cleanEmail,
      mobile: user.mobile,
      address: user.address,
      status: user.status || 'Active',
      designation: user.designation,
      verified: user.verified ?? true,
      updated_at: new Date().toISOString()
    };

    let data: any = null;
    const { data: upsertData, error: upsertError } = await supabase
      .from('users')
      .upsert(userPayload)
      .select()
      .single();

    if (upsertError) {
      console.warn('Upsert on users encountered an error, verifying fallback fetch:', upsertError.message);
      const { data: fallbackFetch } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', newUserId)
        .maybeSingle();

      if (fallbackFetch) {
        data = fallbackFetch;
      } else {
        throw new Error(upsertError.message);
      }
    } else {
      data = upsertData;
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
