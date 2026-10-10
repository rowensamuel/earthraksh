import { supabase, isSupabaseConfigured } from './supabaseClient';
import { dataService } from './dataService';

export interface PlatformAnalyticsSummary {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalFarms: number;
  activeCropsCount: number;
  marketplaceProductsCount: number;
  ordersCount: number;
  totalRevenue: number;
  equipmentCount: number;
  inventoryCount: number;
}

export const reportService = {
  async getPlatformSummary(): Promise<PlatformAnalyticsSummary> {
    if (isSupabaseConfigured && supabase) {
      // Try fast count aggregation via Postgres
      try {
        const [
          { count: usersCount },
          { count: farmersCount },
          { count: buyersCount },
          { count: farmsCount },
          { count: cropsCount },
          { count: productsCount },
          { count: ordersCount },
          { count: equipmentCount },
          { count: inventoryCount }
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'FARMER'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'BUYER'),
          supabase.from('farms').select('*', { count: 'exact', head: true }),
          supabase.from('crops').select('*', { count: 'exact', head: true }).in('status', ['Planted', 'Growing']),
          supabase.from('marketplace_products').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('equipment').select('*', { count: 'exact', head: true }),
          supabase.from('inventory').select('*', { count: 'exact', head: true })
        ]);

        const { data: revData } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('order_status', 'Delivered');

        const totalRevenue = (revData || []).reduce((acc: number, o: any) => acc + (Number(o.total_amount) || 0), 0);

        return {
          totalUsers: usersCount || 0,
          totalFarmers: farmersCount || 0,
          totalBuyers: buyersCount || 0,
          totalFarms: farmsCount || 0,
          activeCropsCount: cropsCount || 0,
          marketplaceProductsCount: productsCount || 0,
          ordersCount: ordersCount || 0,
          totalRevenue,
          equipmentCount: equipmentCount || 0,
          inventoryCount: inventoryCount || 0
        };
      } catch (err) {
        console.warn('Supabase count query fallback:', err);
      }
    }

    // Local / Offline fast calculation
    const users = dataService.getUsers();
    const farms = dataService.getFarms();
    const crops = dataService.getCrops();
    const products = dataService.getProducts();
    const orders = dataService.getOrders();
    const equipment = dataService.getEquipment();
    const inventory = dataService.getInventory();

    const totalRevenue = orders
      .filter(o => o.order_status === 'Delivered' || o.order_status === 'Confirmed')
      .reduce((acc, o) => acc + o.total_amount, 0);

    return {
      totalUsers: users.length,
      totalFarmers: users.filter(u => u.role === 'FARMER').length,
      totalBuyers: users.filter(u => u.role === 'BUYER').length,
      totalFarms: farms.length,
      activeCropsCount: crops.filter(c => c.status === 'Growing' || c.status === 'Planted').length,
      marketplaceProductsCount: products.filter(p => p.status === 'Active').length,
      ordersCount: orders.length,
      totalRevenue,
      equipmentCount: equipment.length,
      inventoryCount: inventory.length
    };
  }
};
