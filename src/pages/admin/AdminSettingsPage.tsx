import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { showToast } from '../../components/common/Toast';

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState('EarthRakshak Agricultural ERP');
  const [mandiCommission, setMandiCommission] = useState('1.5');
  const [minOrderThreshold, setMinOrderThreshold] = useState('5000');
  const [soilLabSync, setSoilLabSync] = useState(true);
  const [diseaseAlertPush, setDiseaseAlertPush] = useState(true);
  const [weatherInterval, setWeatherInterval] = useState('6');
  const [requireAadhaar, setRequireAadhaar] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System Configuration Saved', 'success', 'All enterprise operational parameters updated.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="System Governance & Parameters"
        title="EarthRakshak ERP System Configuration"
        description="Configure enterprise platform policies, marketplace commission thresholds, automated IoT weather sync intervals, and producer verification requirements."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Platform Settings */}
        <div className="bg-white border border-[#dbe3d8] p-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-4">
            General Operational Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Enterprise Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Default Currency & Regional Locale
              </label>
              <input
                type="text"
                value="INR (₹) · India Standard Time (IST)"
                disabled
                className="w-full px-3 py-2 text-xs bg-[#f4f7f3] border border-[#dbe3d8] text-[#556b58]"
              />
            </div>
          </div>
        </div>

        {/* Marketplace & Commerce Settings */}
        <div className="bg-white border border-[#dbe3d8] p-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-4">
            Marketplace & Commission Economics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Platform Marketplace Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={mandiCommission}
                onChange={e => setMandiCommission(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
              <span className="text-[11px] text-[#6b7e6e] mt-1 block">Standard APMC commission replacement fee</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Minimum Wholesale Order Size (₹)
              </label>
              <input
                type="number"
                value={minOrderThreshold}
                onChange={e => setMinOrderThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
              <span className="text-[11px] text-[#6b7e6e] mt-1 block">Threshold for direct farm-gate bulk transport</span>
            </div>
          </div>
        </div>

        {/* Agronomy & IoT Telemetry Sync */}
        <div className="bg-white border border-[#dbe3d8] p-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-4">
            Telemetry & Advisory Automations
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#edf1ea]">
              <div>
                <span className="font-bold text-[#14291a] block">Government Soil Health Card API Sync</span>
                <span className="text-[11px] text-[#607563]">Automatically ingest accredited district lab test records</span>
              </div>
              <input
                type="checkbox"
                checked={soilLabSync}
                onChange={e => setSoilLabSync(e.target.checked)}
                className="w-4 h-4 text-[#1b5e20] rounded-none focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#edf1ea]">
              <div>
                <span className="font-bold text-[#14291a] block">Outbreak Warning Broadcasts</span>
                <span className="text-[11px] text-[#607563]">Broadcast regional alerts when blight or pest severity exceeds moderate index</span>
              </div>
              <input
                type="checkbox"
                checked={diseaseAlertPush}
                onChange={e => setDiseaseAlertPush(e.target.checked)}
                className="w-4 h-4 text-[#1b5e20] rounded-none focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-bold text-[#14291a] block">Farmer Identity Verification Policy</span>
                <span className="text-[11px] text-[#607563]">Require 7/12 Land Extract or Khasra certification prior to produce listing</span>
              </div>
              <input
                type="checkbox"
                checked={requireAadhaar}
                onChange={e => setRequireAadhaar(e.target.checked)}
                className="w-4 h-4 text-[#1b5e20] rounded-none focus:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
          >
            Save System Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
