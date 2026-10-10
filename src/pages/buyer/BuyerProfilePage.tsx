import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import { ShieldIcon } from '../../components/common/Icons';

export const BuyerProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [designation, setDesignation] = useState(currentUser?.designation || 'Head of Wholesale Grain Sourcing');
  const [gstin, setGstin] = useState('27AAACA9921D1Z8');
  const [apmcLicense, setApmcLicense] = useState('APMC/VSH/GRN/2021/8841');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setMobile(currentUser.mobile || '');
      setAddress(currentUser.address || '');
      setDesignation(currentUser.designation || 'Head of Wholesale Grain Sourcing');
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) {
      showToast('Validation Error', 'error', 'Procurement officer name and mobile are required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        designation: designation.trim()
      });
      showToast('Procurement Profile Saved to Database', 'success', 'Institutional buyer credentials updated.');
    } catch (err: any) {
      console.error('Failed to update buyer profile in database:', err);
      if (currentUser) {
        setFullName(currentUser.full_name || '');
        setMobile(currentUser.mobile || '');
        setAddress(currentUser.address || '');
        setDesignation(currentUser.designation || '');
      }
      showToast('Database Error', 'error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Institutional Account & Logistics Hub"
        title="Commercial Buyer Profile & Credentials"
        description="Administer institutional grain procurement profiles, APMC merchant trading licenses, and GST tax accreditation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left ID Card */}
        <div className="lg:col-span-4 bg-white border border-[#dbe3d8] p-6 text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-[#14331e] border-2 border-[#1b5e20] text-white flex items-center justify-center font-display font-bold text-2xl uppercase">
            {fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          <div>
            <h2 className="text-base font-bold font-display text-[#14291a]">{fullName}</h2>
            <p className="text-xs text-[#5d7360]">{designation}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#eef4ec] border border-[#d2e0cf] text-[#1b5e20] text-[11px] font-semibold">
              <ShieldIcon size={12} />
              <span>Certified Wholesale Buyer</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#edf1ea] text-left text-xs space-y-2 text-[#4f6652]">
            <div className="flex justify-between">
              <span className="text-[#6d8270]">Buyer ID:</span>
              <strong className="text-[#14291a]">{currentUser.user_id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6d8270]">Email:</span>
              <span className="text-[#14291a] truncate max-w-[170px]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6d8270]">Accredited Since:</span>
              <span className="text-[#14291a] tabular-nums">{currentUser.created_at}</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-8 bg-white border border-[#dbe3d8] p-6">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-4">
            Commercial Business Details
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Procurement Officer Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Dispatch Hotline Mobile *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Organization Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Central Receiving Logistics Hub Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#edf1ea]">
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Commercial GSTIN Number
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  APMC Wholesale Merchant License
                </label>
                <input
                  type="text"
                  value={apmcLicense}
                  onChange={e => setApmcLicense(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
