import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { showToast } from '../../components/common/Toast';

export const SupportPage: React.FC = () => {
  const [topic, setTopic] = useState('Marketplace Order');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Support Ticket Dispatched', 'success', 'Our agricultural advisory and logistics team will reach out.');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Assistance & Operational Hotline"
        title="EarthRakshak Agricultural Helpdesk & Support"
        description="Connect with regional agronomists, logistics coordinators, and administrative technical support."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-4xl">
        <div className="md:col-span-5 bg-white border border-[#dbe3d8] p-6 space-y-4 text-xs text-[#2e4230]">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea]">
            Support Dispatch Centers
          </h3>

          <div>
            <strong className="block text-[#14291a]">Western Agri Cluster (Nashik / Pune)</strong>
            <p className="text-[11px] text-[#556958]">Krishi Bhavan, Shivaji Nagar, Pune 411005</p>
            <span className="tabular-nums font-semibold text-[#1b5e20] mt-1 block">+91 20 2553 8810</span>
          </div>

          <div>
            <strong className="block text-[#14291a]">Northern Grain Hub (Ludhiana)</strong>
            <p className="text-[11px] text-[#556958]">Ferozepur Road Agro Complex, Ludhiana 141001</p>
            <span className="tabular-nums font-semibold text-[#1b5e20] mt-1 block">+91 161 240 1960</span>
          </div>

          <div className="pt-2 border-t border-[#edf1ea]">
            <strong className="block text-[#14291a]">Technical & Escrow Helpdesk</strong>
            <span className="text-[11px] text-[#556958]">Email: support@earthrakshak.org</span>
            <span className="text-[11px] text-[#556958] block">Hours: Mon-Sat, 06:00 AM - 08:00 PM IST</span>
          </div>
        </div>

        <div className="md:col-span-7 bg-white border border-[#dbe3d8] p-6">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-4">
            Submit Support Request
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Support Category *
              </label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Marketplace Order">Marketplace Order / Delivery Transit</option>
                <option value="Soil Health Lab">Soil Health Test Lab Verification</option>
                <option value="Disease Remediation">Crop Pathology & Disease Emergency</option>
                <option value="Equipment Rental">Machinery Rental Dispute / Breakdown</option>
                <option value="Escrow Payout">Banking Settlement & Escrow Disbursal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Message & Issue Description *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Provide consignment tracking number, plot ID, or details of the issue..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
            >
              Dispatch Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
