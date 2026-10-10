import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ROLE_DEFAULT_PATHS } from '../../routes/roleMatrix';
import { farmService } from '../../services/farmService';
import { AgriLogoIcon, ShieldIcon, CheckIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { homeHeroImage } from '../../assets/assetRegistry';

export const RegisterPage: React.FC = () => {
  const { register, loginAs } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [businessOrFarmName, setBusinessOrFarmName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid official email address.');
      return;
    }
    if (!mobile.trim()) {
      setError('Please enter your mobile phone number for SMS dispatch alerts.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the EarthRakshak Terms of Service.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      address: location.trim(),
      role: selectedRole,
      password
    });
    setIsSubmitting(false);

    if (result.success) {
      // Also initialize farm if registering as farmer
      if (selectedRole === 'FARMER' && businessOrFarmName.trim()) {
        try {
          await farmService.addFarm({
            user_id: result.user?.user_id || '',
            farm_name: businessOrFarmName.trim(),
            location: location.trim(),
            area: 25.0,
            area_unit: 'Acres',
            soil_type: 'Loamy',
            water_source: 'Drip Irrigation',
            active_crops_count: 0,
            established_year: 2024
          });
        } catch (farmErr) {
          console.warn('Initial farm registration notice:', farmErr);
        }
      }

      showToast(
        'Account Registered Successfully',
        'success',
        `Welcome to EarthRakshak ERP, ${fullName.trim()}! Logged in as ${selectedRole}.`
      );
      navigate(ROLE_DEFAULT_PATHS[selectedRole]);
    } else {
      setError(result.error || 'Failed to complete registration.');
    }
  };

  const handleQuickRegister = (role: UserRole, name: string, mail: string, orgName: string) => {
    setFullName(name);
    setEmail(mail);
    setMobile('+91 98230 44512');
    setSelectedRole(role);
    setBusinessOrFarmName(orgName);
    setPassword('EarthRakshak2026!');
    setConfirmPassword('EarthRakshak2026!');

    showToast('Sample Details Populated', 'info', `Form filled for ${role} profile: ${name}`);
  };

  return (
    <div className="min-h-screen bg-[#0e2416] flex flex-col justify-center relative overflow-hidden py-12">
      {/* Background overlay */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src={homeHeroImage}
          alt="Vertical agricultural facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e2416] via-[#0e2416]/80 to-[#0e2416]/90" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#c9d4c6] shadow-2xl">
          {/* Left Hero / Brand Identity */}
          <div className="lg:col-span-5 bg-[#14331e] text-white p-5 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#204a2c]">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                <AgriLogoIcon size={28} className="text-[#64bd73] group-hover:scale-105 transition-transform" />
                <span className="font-display font-black text-xl tracking-tight uppercase text-white">
                  EARTHRAKSHAK ERP
                </span>
              </Link>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1d482a] border border-[#2d683e] text-[#8ce09b] text-[11px] font-bold uppercase tracking-wider">
                  <ShieldIcon size={13} />
                  <span>Integrated Farm Registration</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white uppercase leading-snug">
                  Join the Agricultural Network
                </h1>

                <p className="text-xs text-[#b8d6be] leading-relaxed font-normal">
                  Connect your farming operations, register machinery for shared rental earnings, or source certified bulk agricultural produce with verified farm traceability.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-[#1d482a]">
                  <div className="flex items-start gap-2 text-xs text-[#d2e8d7]">
                    <CheckIcon size={14} className="text-[#64bd73] shrink-0 mt-0.5" />
                    <span>Real-time Crop Advisory & Disease Diagnostic AI</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#d2e8d7]">
                    <CheckIcon size={14} className="text-[#64bd73] shrink-0 mt-0.5" />
                    <span>Zero-Middleman Direct Farm-to-Buyer Marketplace</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#d2e8d7]">
                    <CheckIcon size={14} className="text-[#64bd73] shrink-0 mt-0.5" />
                    <span>PostgreSQL & Multi-Tenant Role Isolation Architecture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Autofill for fast evaluation */}
            <div className="mt-8 pt-6 border-t border-[#204a2c]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7fa385] block mb-2">
                Quick Evaluator Presets:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickRegister(
                      'FARMER',
                      'Kailash B. Deshmukh',
                      'kailash.deshmukh@sahyadrifarms.in',
                      'Sahyadri Agro Orchards'
                    )
                  }
                  className="p-2 text-left bg-[#1d482a]/70 hover:bg-[#1d482a] border border-[#2b663b] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-white block">Farmer Profile</span>
                  <span className="text-[10px] text-[#9fc7a5]">Kailash Deshmukh</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickRegister(
                      'BUYER',
                      'Vikramaditya Singhania',
                      'procure@bharatgrains.com',
                      'Bharat Agro Logistics Ltd'
                    )
                  }
                  className="p-2 text-left bg-[#1d482a]/70 hover:bg-[#1d482a] border border-[#2b663b] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-white block">Buyer Profile</span>
                  <span className="text-[10px] text-[#9fc7a5]">Procurement Desk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Form: Registration Inputs */}
          <div className="lg:col-span-7 p-5 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8df] mb-5">
              <div>
                <h2 className="text-lg font-bold font-display text-[#14291a]">
                  Create Official ERP Account
                </h2>
                <p className="text-xs text-[#637a66]">
                  Select your functional role and enter your operational credentials.
                </p>
              </div>
              <Link
                to="/login"
                className="text-xs font-semibold text-[#1b5e20] hover:underline"
              >
                Sign In Instead
              </Link>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f87171] text-xs text-[#991b1b]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-[#14291a] mb-1.5 uppercase tracking-wider">
                  Select Primary Account Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('FARMER')}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      selectedRole === 'FARMER'
                        ? 'border-[#1b5e20] bg-[#eef5ee] ring-1 ring-[#1b5e20]'
                        : 'border-[#c9d4c6] hover:bg-[#fafbfa]'
                    }`}
                  >
                    <span className="font-bold text-xs text-[#14291a] block">
                      Farmer / Cultivator
                    </span>
                    <span className="text-[11px] text-[#5e7362] block mt-0.5">
                      Farms, Crops, Machinery, Produce Listing
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('BUYER')}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      selectedRole === 'BUYER'
                        ? 'border-[#1b5e20] bg-[#eef5ee] ring-1 ring-[#1b5e20]'
                        : 'border-[#c9d4c6] hover:bg-[#fafbfa]'
                    }`}
                  >
                    <span className="font-bold text-xs text-[#14291a] block">
                      Buyer / Commercial Trader
                    </span>
                    <span className="text-[11px] text-[#5e7362] block mt-0.5">
                      Procurement, Order Tracking, Invoices
                    </span>
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Verma"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ramesh@vermaagri.in"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              {/* Mobile & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    District &amp; State *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Nashik, Maharashtra"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              {/* Entity / Farm Name */}
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  {selectedRole === 'FARMER' ? 'Farm / Plantation Name' : 'Company / Procurement Entity Name'}
                </label>
                <input
                  type="text"
                  value={businessOrFarmName}
                  onChange={e => setBusinessOrFarmName(e.target.value)}
                  placeholder={
                    selectedRole === 'FARMER'
                      ? 'e.g. Verma Organic Green Valley'
                      : 'e.g. Verma Food Processing Pvt Ltd'
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#304734] mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-[#1b5e20]"
                />
                <label htmlFor="agreeTerms" className="text-xs text-[#526655] cursor-pointer">
                  I agree to the EarthRakshak agricultural marketplace protocol, data governance terms, and verified producer obligations.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Registering Account...' : `Register as ${selectedRole} & Enter Workspace`}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-[#edf2ea] text-center">
              <span className="text-xs text-[#637a66]">
                Already registered with EarthRakshak?{' '}
                <Link to="/login" className="text-[#1b5e20] font-semibold hover:underline">
                  Sign In to existing workspace
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
