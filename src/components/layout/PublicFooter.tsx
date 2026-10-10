import React from 'react';
import { Link } from 'react-router-dom';
import { AgriLogoIcon, ShieldIcon } from '../common/Icons';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#0b1c11] text-[#9eb6a3] border-t border-[#163820] pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#183823]">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <AgriLogoIcon size={24} className="text-[#64bd73]" />
              <span className="font-display font-black text-base tracking-tight text-white uppercase">
                EARTHRAKSHAK
              </span>
            </div>
            <p className="text-xs text-[#8ca893] leading-relaxed max-w-sm">
              Integrated enterprise agricultural platform connecting precision farm management, peer-to-peer machinery sharing, and direct farm-to-market commodity trading.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#719478]">
              <ShieldIcon size={14} className="text-[#64bd73]" />
              <span>Accredited Producer Network · Supabase RLS Protected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Public Discovery
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Overview</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">Produce Marketplace</Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-white transition-colors">Agricultural Equipment Hub</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Member Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Producer & Buyer Registration</Link>
              </li>
            </ul>
          </div>

          {/* Platform Workspaces */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Core ERP Capabilities
            </h4>
            <ul className="space-y-1.5 text-xs text-[#8aa590]">
              <li>Cadastral Plot & Farm Mapping</li>
              <li>Phenological Crop Life-Cycle</li>
              <li>Soil Health NPK Telemetry</li>
              <li>AgriVision AI Plant Pathology</li>
              <li>Shared Tractor & Harvester Fleets</li>
              <li>Direct Farm-Gate Wholesale Settlement</li>
            </ul>
          </div>

          {/* Compliance & Support */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Regulatory
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">Contact / Helpdesk</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6d8a73]">
          <div>
            © {new Date().getFullYear()} EarthRakshak Enterprise Agricultural Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Direct Producer Realization</span>
            <span>·</span>
            <span>Zero Mandi Intermediary Fees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
