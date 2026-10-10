import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_NAV_CONFIG, ROLE_DEFAULT_PATHS } from '../../routes/roleMatrix';
import { UserRole } from '../../types';
import {
  AgriLogoIcon,
  DashboardIcon,
  UsersIcon,
  FarmerIcon,
  BuyerIcon,
  FarmIcon,
  CropIcon,
  SoilIcon,
  DiseaseIcon,
  InventoryIcon,
  EquipmentIcon,
  MarketplaceIcon,
  OrdersIcon,
  FinanceIcon,
  WeatherIcon,
  ReportsIcon,
  AnalyticsIcon,
  SettingsIcon,
  CartIcon,
  WishlistIcon,
  TrackingIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  LogOutIcon,
  ChevronDownIcon,
  GovernmentSchemeIcon
} from '../common/Icons';
import { dataService } from '../../services/dataService';
import { NavigationTransitionLoader } from '../common/NavigationTransitionLoader';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = ROLE_NAV_CONFIG[currentRole] || [];

  // Farmer walking loading transition for approximately 1000ms between modules
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetModuleTitle, setTargetModuleTitle] = useState('');
  const prevPathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      const currentItem = navItems.find(item => item.path === location.pathname);
      const title = currentItem?.label || 'Module';
      setTargetModuleTitle(title);
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navItems]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'dashboard': return <DashboardIcon size={18} />;
      case 'users': return <UsersIcon size={18} />;
      case 'farmer': return <FarmerIcon size={18} />;
      case 'buyer': return <BuyerIcon size={18} />;
      case 'farm': return <FarmIcon size={18} />;
      case 'crop': return <CropIcon size={18} />;
      case 'soil': return <SoilIcon size={18} />;
      case 'disease': return <DiseaseIcon size={18} />;
      case 'schemes': return <GovernmentSchemeIcon size={18} />;
      case 'inventory': return <InventoryIcon size={18} />;
      case 'equipment': return <EquipmentIcon size={18} />;
      case 'marketplace': return <MarketplaceIcon size={18} />;
      case 'orders': return <OrdersIcon size={18} />;
      case 'finance': return <FinanceIcon size={18} />;
      case 'weather': return <WeatherIcon size={18} />;
      case 'reports': return <ReportsIcon size={18} />;
      case 'analytics': return <AnalyticsIcon size={18} />;
      case 'settings': return <SettingsIcon size={18} />;
      case 'cart': return <CartIcon size={18} />;
      case 'wishlist': return <WishlistIcon size={18} />;
      case 'tracking': return <TrackingIcon size={18} />;
      case 'profile': return <UserIcon size={18} />;
      default: return <DashboardIcon size={18} />;
    }
  };

  const handleLogout = async () => {
    try {
      navigate('/', { replace: true });
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const cartItemsCount = currentRole === 'BUYER' ? dataService.getCart().reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-[#f5f7f4] flex flex-col text-[#1c2e22]">
      {/* 1-Second Agricultural Farmer Walking Transition Loader */}
      <NavigationTransitionLoader isLoading={isTransitioning} destinationTitle={targetModuleTitle} />

      {/* TOP BAR */}
      <header className="h-14 bg-[#0e2416] text-[#e8f0e9] border-b border-[#183823] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-[#b0c4b3] hover:text-white md:hidden shrink-0 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <MenuIcon size={20} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <AgriLogoIcon size={22} className="text-[#68bb76] shrink-0" />
            <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white uppercase truncate">
              EARTHRAKSHAK <span className="hidden xs:inline">ERP</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-3 text-[11px] font-semibold px-2 py-0.5 border border-[#2b5937] text-[#a4cca8] uppercase tracking-wider shrink-0">
            {currentRole} WORKSPACE
          </div>
        </div>

        {/* Right side controls - Only role-relevant controls, no toggle system */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart quick access for Buyer */}
          {currentRole === 'BUYER' && (
            <button
              onClick={() => navigate('/buyer/cart')}
              className="relative p-1.5 text-[#cfe2d2] hover:text-white transition-colors cursor-pointer"
              title="View Cart"
            >
              <CartIcon size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f9a825] text-[#0e2416] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          {/* User profile info (without avatar photo) */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#24452e]">
            <div className="text-right">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">{currentUser?.full_name || 'Authorized User'}</p>
              <p className="text-[11px] text-[#90a894] leading-none">{currentUser?.designation || currentRole}</p>
            </div>
          </div>

          {/* Logout Button: Clears session and redirects to / */}
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#a3bfa7] hover:text-white hover:bg-[#1b3d27] transition-colors cursor-pointer"
            title="Sign Out to Public Home"
          >
            <LogOutIcon size={18} />
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#142e1d] text-[#d4e3d6] flex flex-col transition-transform duration-200 border-r border-[#1c4028] pt-0 md:static md:w-64 md:z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-[#20452d] flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7ea085]">
                {currentRole} NAVIGATION
              </p>
              <p className="text-xs text-[#a9c4b0] mt-0.5 truncate font-medium">
                {currentUser?.full_name}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-[#a9c4b0] hover:text-white md:hidden shrink-0 cursor-pointer"
              aria-label="Close sidebar"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1b5e20] text-white font-semibold'
                      : 'text-[#bad1bf] hover:bg-[#1b3d27] hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#87ab90]'}>
                    {getIcon(item.iconName)}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#20452d] text-[11px] text-[#78967e] bg-[#0f2416]">
            <div className="flex items-center justify-between">
              <span>EarthRakshak v2.0</span>
              <span className="text-[#a1b8a6]">Supabase RLS Ready</span>
            </div>
            <p className="text-[10px] text-[#5e7d64] mt-0.5">Agricultural Resource Planning</p>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* MAIN VIEWPORT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
