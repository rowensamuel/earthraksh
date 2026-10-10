import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MarketplaceProduct } from '../types';

function mapProduct(p: any): MarketplaceProduct {
  return {
    product_id: p.product_id,
    seller_id: p.seller_id,
    seller_name: p.seller?.full_name || 'Verified EarthRakshak Farmer',
    seller_location: p.seller?.address || 'Nashik, Maharashtra',
    product_name: p.product_name,
    category: p.category,
    price_per_unit: Number(p.price_per_unit),
    unit: p.unit,
    available_qty: Number(p.available_qty),
    description: p.description || '',
    image_url: p.image_url || '',
    harvest_date: p.harvest_date || '',
    certification: p.certification || 'Conventional',
    status: p.status || 'Active',
    rating: Number(p.rating || 4.8),
    grade: p.grade || 'Grade A'
  };
}

export const marketplaceService = {
  async getProducts(sellerId?: string): Promise<MarketplaceProduct[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    try {
      let query = supabase.from('marketplace_products').select('*, seller:users!seller_id(full_name, address)');
      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      } else {
        // By default public marketplace shows active products
        query = query.eq('status', 'Active');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapProduct);
      }
      if (error) {
        console.warn('Marketplace join notice, fallback to direct select:', error.message);
      }
    } catch (joinErr) {
      console.warn('Marketplace join exception:', joinErr);
    }

    // Fallback without join if foreign relationship or RLS restricts
    let fallbackQuery = supabase.from('marketplace_products').select('*');
    if (sellerId) {
      fallbackQuery = fallbackQuery.eq('seller_id', sellerId);
    } else {
      fallbackQuery = fallbackQuery.eq('status', 'Active');
    }

    const { data: fbData, error: fbError } = await fallbackQuery.order('created_at', { ascending: false });
    if (fbError) {
      console.error('Error fetching marketplace products:', fbError);
      throw new Error(fbError.message);
    }

    return (fbData || []).map(mapProduct);
  },

  async getAllProductsAdmin(): Promise<MarketplaceProduct[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*, seller:users!seller_id(full_name, address)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(mapProduct);
      }
    } catch (err) {
      console.warn('Admin marketplace join notice:', err);
    }

    const { data: fbData, error: fbError } = await supabase
      .from('marketplace_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fbError) {
      console.error('Error fetching all products for admin:', fbError);
      throw new Error(fbError.message);
    }
    return (fbData || []).map(mapProduct);
  },

  async getProduct(productId: string): Promise<MarketplaceProduct | undefined> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*, seller:users!seller_id(full_name, address)')
        .eq('product_id', productId)
        .maybeSingle();

      if (!error && data) {
        return mapProduct(data);
      }
    } catch (err) {
      console.warn('Single product join notice:', err);
    }

    const { data: fbData, error: fbError } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();

    if (fbError) {
      console.error('Error fetching marketplace product:', fbError);
      throw new Error(fbError.message);
    }
    return fbData ? mapProduct(fbData) : undefined;
  },

  async addProduct(product: Omit<MarketplaceProduct, 'product_id'>): Promise<MarketplaceProduct> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to list marketplace produce.');
    }

    const { data, error } = await supabase
      .from('marketplace_products')
      .insert([{
        seller_id: user.id,
        product_name: product.product_name,
        category: product.category,
        price_per_unit: product.price_per_unit,
        unit: product.unit,
        available_qty: product.available_qty,
        description: product.description,
        image_url: product.image_url,
        harvest_date: product.harvest_date || null,
        certification: product.certification || 'Conventional',
        status: product.status || 'Active',
        rating: product.rating || 4.8,
        grade: product.grade || 'Grade A'
      }])
      .select('*, seller:users!seller_id(full_name, address)')
      .single();

    if (error) {
      console.error('Error adding marketplace product:', error);
      throw new Error(error.message);
    }
    return mapProduct(data);
  },

  async updateProduct(productId: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Strip virtual fields before sending to Supabase
    const { seller_name, seller_location, ...dbUpdates } = updates as any;

    const { data, error } = await supabase
      .from('marketplace_products')
      .update(dbUpdates)
      .eq('product_id', productId)
      .select('*, seller:users!seller_id(full_name, address)')
      .single();

    if (error) {
      console.error('Error updating marketplace product:', error);
      throw new Error(error.message);
    }
    return mapProduct(data);
  },

  async deleteProduct(productId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('marketplace_products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.error('Error deleting marketplace product:', error);
      throw new Error(error.message);
    }
  }
};
