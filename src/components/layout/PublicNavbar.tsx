import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  EcoSproutIcon,
  MenuIcon,
  CloseIcon
} from '../common/Icons';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  return (
    <header
      className={
        isHome
          ? 'absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent'
          : 'sticky top-0 z-50 bg-[#0C1E14] border-b border-[#1D3B2A] shadow-md'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand: Logo icon + EARTHRAKSH */}
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <EcoSproutIcon size={28} className="text-[#3ed453] group-hover:scale-105 transition-transform shrink-0" />
          <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-white uppercase drop-shadow-sm truncate">
            EARTHRAKSH
          </span>
        </Link>

        {/* Center/Right Nav Links: HOME, SHOP, EQUIPMENT, LOGIN, REGISTER */}
        <nav className="hidden lg:flex items-center gap-6 text-[12px] font-bold uppercase tracking-wider text-white/90">
          <Link
            to="/"
            className={`transition-colors py-1 hover:text-[#3ed453] ${
              location.pathname === '/' ? 'text-[#3ed453]' : ''
            }`}
          >
            HOME
          </Link>

          <Link
            to="/marketplace"
            className={`transition-colors py-1 hover:text-[#3ed453] ${
              location.pathname === '/marketplace' ? 'text-[#3ed453]' : ''
            }`}
          >
            SHOP
          </Link>

          <Link
            to="/equipment"
            className={`transition-colors py-1 hover:text-[#3ed453] ${
              location.pathname === '/equipment' ? 'text-[#3ed453]' : ''
            }`}
          >
            EQUIPMENT
          </Link>

          <Link
            to="/login"
            className={`transition-colors px-3 py-1.5 rounded-sm border border-white/20 hover:border-[#3ed453] hover:text-[#3ed453] ${
              location.pathname === '/login' ? 'text-[#3ed453] border-[#3ed453]' : ''
            }`}
          >
            LOGIN
          </Link>

          <Link
            to="/register"
            className="px-4 py-1.5 bg-[#3ed453] hover:bg-[#34b847] text-[#0b1c11] font-display font-black text-xs uppercase tracking-wider rounded-sm shadow-md hover:shadow-[#3ed453]/25 transition-all cursor-pointer"
          >
            REGISTER
          </Link>
        </nav>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/90 hover:text-white lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1f13]/98 backdrop-blur-lg border-b border-[#235835] px-5 sm:px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-[#3ed453] py-1 ${location.pathname === '/' ? 'text-[#3ed453]' : 'text-white'}`}
            >
              HOME
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-[#3ed453] py-1 ${location.pathname === '/marketplace' ? 'text-[#3ed453]' : 'text-white'}`}
            >
              SHOP PRODUCE
            </Link>
            <Link
              to="/equipment"
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-[#3ed453] py-1 ${location.pathname === '/equipment' ? 'text-[#3ed453]' : 'text-white'}`}
            >
              EQUIPMENT HUB
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#1d482a] flex items-center gap-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:border-[#3ed453]"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 bg-[#3ed453] text-[#0b1c11] text-xs font-black uppercase tracking-wider rounded-sm hover:bg-[#34b847]"
            >
              REGISTER
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

