import { UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', iconName: 'dashboard' },
  { id: 'users', label: 'User Management', path: '/admin/users', iconName: 'users' },
  { id: 'farmers', label: 'Farmers', path: '/admin/farmers', iconName: 'farmer' },
  { id: 'buyers', label: 'Buyers', path: '/admin/buyers', iconName: 'buyer' },
  { id: 'inventory', label: 'Inventory', path: '/admin/inventory', iconName: 'inventory' },
  { id: 'equipment', label: 'Equipment', path: '/admin/equipment', iconName: 'equipment' },
  { id: 'marketplace', label: 'Marketplace', path: '/admin/marketplace', iconName: 'marketplace' },
  { id: 'reports', label: 'Reports', path: '/admin/reports', iconName: 'reports' },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics', iconName: 'analytics' },
  { id: 'settings', label: 'System Settings', path: '/admin/settings', iconName: 'settings' }
];

export const FARMER_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/farmer/dashboard', iconName: 'dashboard' },
  { id: 'farms', label: 'My Farms', path: '/farmer/farms', iconName: 'farm' },
  { id: 'crops', label: 'My Crops', path: '/farmer/crops', iconName: 'crop' },
  { id: 'soil', label: 'Soil Health', path: '/farmer/soil', iconName: 'soil' },
  { id: 'disease', label: 'Disease Detection', path: '/farmer/disease', iconName: 'disease' },
  { id: 'schemes', label: 'Government Schemes & Yojana', path: '/farmer/government-schemes', iconName: 'schemes' },
  { id: 'inventory', label: 'My Inventory', path: '/farmer/inventory', iconName: 'inventory' },
  { id: 'equipment', label: 'Equipment Hub', path: '/farmer/equipment', iconName: 'equipment' },
  { id: 'marketplace', label: 'Sell Produce', path: '/farmer/marketplace', iconName: 'marketplace' },
  { id: 'orders', label: 'Orders Received', path: '/farmer/orders', iconName: 'orders' },
  { id: 'finance', label: 'Finance & Accounts', path: '/farmer/finance', iconName: 'finance' },
  { id: 'weather', label: 'Weather Telemetry', path: '/farmer/weather', iconName: 'weather' },
  { id: 'profile', label: 'Farmer Profile', path: '/farmer/profile', iconName: 'profile' }
];

export const BUYER_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/buyer/dashboard', iconName: 'dashboard' },
  { id: 'marketplace', label: 'Marketplace', path: '/buyer/marketplace', iconName: 'marketplace' },
  { id: 'wishlist', label: 'Wishlist', path: '/buyer/wishlist', iconName: 'wishlist' },
  { id: 'cart', label: 'Cart', path: '/buyer/cart', iconName: 'cart' },
  { id: 'orders', label: 'My Orders', path: '/buyer/orders', iconName: 'orders' },
  { id: 'payments', label: 'Payments', path: '/buyer/payments', iconName: 'finance' },
  { id: 'tracking', label: 'Order Tracking', path: '/buyer/tracking', iconName: 'tracking' },
  { id: 'profile', label: 'Buyer Profile', path: '/buyer/profile', iconName: 'profile' }
];

export const ROLE_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  ADMIN: ADMIN_NAV_ITEMS,
  FARMER: FARMER_NAV_ITEMS,
  BUYER: BUYER_NAV_ITEMS
};

export const ROLE_DEFAULT_PATHS: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  FARMER: '/farmer/dashboard',
  BUYER: '/buyer/dashboard'
};
