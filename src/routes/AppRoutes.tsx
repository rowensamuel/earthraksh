import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ROLE_DEFAULT_PATHS } from './roleMatrix';
import { AppShell } from '../components/layout/AppShell';

// Public Experience
import { HomePage } from '../pages/public/HomePage';
import { PublicMarketplacePage } from '../pages/public/PublicMarketplacePage';
import { PublicEquipmentPage } from '../pages/public/PublicEquipmentPage';

// Auth & Legal
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { PrivacyPolicyPage } from '../pages/legal/PrivacyPolicyPage';
import { TermsPage } from '../pages/legal/TermsPage';
import { SupportPage } from '../pages/legal/SupportPage';

// Admin
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { FarmersPage } from '../pages/admin/FarmersPage';
import { BuyersPage } from '../pages/admin/BuyersPage';
import { GlobalInventoryPage } from '../pages/admin/GlobalInventoryPage';
import { AdminEquipmentPage } from '../pages/admin/AdminEquipmentPage';
import { AdminMarketplacePage } from '../pages/admin/AdminMarketplacePage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Farmer
import { FarmerDashboard } from '../pages/farmer/FarmerDashboard';
import { MyFarmsPage } from '../pages/farmer/MyFarmsPage';
import { MyCropsPage } from '../pages/farmer/MyCropsPage';
import { SoilHealthPage } from '../pages/farmer/SoilHealthPage';
import { DiseaseDetectionPage } from '../pages/farmer/DiseaseDetectionPage';
import { FarmerSchemesPage } from '../pages/farmer/FarmerSchemesPage';
import { FarmerInventoryPage } from '../pages/farmer/FarmerInventoryPage';
import { FarmerEquipmentPage } from '../pages/farmer/FarmerEquipmentPage';
import { FarmerMarketplacePage } from '../pages/farmer/FarmerMarketplacePage';
import { FarmerOrdersPage } from '../pages/farmer/FarmerOrdersPage';
import { FarmerFinancePage } from '../pages/farmer/FarmerFinancePage';
import { FarmerWeatherPage } from '../pages/farmer/FarmerWeatherPage';
import { FarmerProfilePage } from '../pages/farmer/FarmerProfilePage';

// Buyer
import { BuyerDashboard } from '../pages/buyer/BuyerDashboard';
import { BuyerMarketplacePage } from '../pages/buyer/BuyerMarketplacePage';
import { ProductDetailPage } from '../pages/buyer/ProductDetailPage';
import { WishlistPage } from '../pages/buyer/WishlistPage';
import { CartPage } from '../pages/buyer/CartPage';
import { BuyerOrdersPage } from '../pages/buyer/BuyerOrdersPage';
import { BuyerPaymentsPage } from '../pages/buyer/BuyerPaymentsPage';
import { BuyerTrackingPage } from '../pages/buyer/BuyerTrackingPage';
import { BuyerProfilePage } from '../pages/buyer/BuyerProfilePage';

// Protected Route Guard
const ProtectedRoleRoute: React.FC<{
  allowedRole: UserRole;
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const { currentRole, isAuthenticated, currentUser, isLoading, isLoggingOut } = useAuth();

  // 1. If user is in the process of logging out, route directly to Public Home ("/")
  if (isLoggingOut || sessionStorage.getItem('earthrakshak_logging_out') === 'true') {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e2416] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#3ed453] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-white uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    // Unauthenticated users trying to access a protected route go to /login
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== allowedRole) {
    // Role guards: Admin cannot access Farmer interface, Farmer cannot access Admin routes, etc.
    return <Navigate to={ROLE_DEFAULT_PATHS[currentRole]} replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. PUBLIC EXPERIENCE ROUTES (Accessible without authentication) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<PublicMarketplacePage />} />
      <Route path="/equipment" element={<PublicEquipmentPage />} />

      {/* 2. AUTHENTICATION */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 3. LEGAL & SYSTEM PAGES */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/support" element={<SupportPage />} />

      {/* 4. ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><UserManagementPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/farmers"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><FarmersPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/buyers"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><BuyersPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/inventory"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><GlobalInventoryPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/equipment"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminEquipmentPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/marketplace"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminMarketplacePage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminReportsPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/analytics"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminAnalyticsPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/admin/settings"
        element={<ProtectedRoleRoute allowedRole="ADMIN"><AdminSettingsPage /></ProtectedRoleRoute>}
      />

      {/* 5. FARMER ROUTES */}
      <Route
        path="/farmer/dashboard"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerDashboard /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/farms"
        element={<ProtectedRoleRoute allowedRole="FARMER"><MyFarmsPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/crops"
        element={<ProtectedRoleRoute allowedRole="FARMER"><MyCropsPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/soil"
        element={<ProtectedRoleRoute allowedRole="FARMER"><SoilHealthPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/disease"
        element={<ProtectedRoleRoute allowedRole="FARMER"><DiseaseDetectionPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/government-schemes"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerSchemesPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/schemes"
        element={<Navigate to="/farmer/government-schemes" replace />}
      />
      <Route
        path="/farmer/inventory"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerInventoryPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/equipment"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerEquipmentPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/marketplace"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerMarketplacePage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/orders"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerOrdersPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/finance"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerFinancePage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/weather"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerWeatherPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/farmer/profile"
        element={<ProtectedRoleRoute allowedRole="FARMER"><FarmerProfilePage /></ProtectedRoleRoute>}
      />

      {/* 6. BUYER ROUTES */}
      <Route
        path="/buyer/dashboard"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerDashboard /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/marketplace"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerMarketplacePage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/product/:id"
        element={<ProtectedRoleRoute allowedRole="BUYER"><ProductDetailPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/wishlist"
        element={<ProtectedRoleRoute allowedRole="BUYER"><WishlistPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/cart"
        element={<ProtectedRoleRoute allowedRole="BUYER"><CartPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/orders"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerOrdersPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/payments"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerPaymentsPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/tracking"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerTrackingPage /></ProtectedRoleRoute>}
      />
      <Route
        path="/buyer/profile"
        element={<ProtectedRoleRoute allowedRole="BUYER"><BuyerProfilePage /></ProtectedRoleRoute>}
      />

      {/* Fallback to Public Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
