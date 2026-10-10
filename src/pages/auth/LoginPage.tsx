import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ROLE_DEFAULT_PATHS } from '../../routes/roleMatrix';
import { AgriLogoIcon, ShieldIcon } from '../../components/common/Icons';
import { homeHeroImage } from '../../assets/assetRegistry';

export const LoginPage: React.FC = () => {
  const { login, loginAs, loginWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rajesh.patil@greenvalleyfarm.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please provide a valid account email.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      navigate(ROLE_DEFAULT_PATHS[result.user.role]);
    } else {
      const success = loginWithEmail(email);
      if (success) {
        navigate(ROLE_DEFAULT_PATHS[selectedRole]);
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleQuickRole = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    await loginAs(role);
    setIsSubmitting(false);
    navigate(ROLE_DEFAULT_PATHS[role]);
  };

  return (
    <div className="min-h-screen bg-[#0e2416] flex flex-col justify-center relative overflow-hidden">
      {/* Background with measured agricultural photograph overlay */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src={homeHeroImage}
          alt="Vertical agricultural facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e2416] via-[#0e2416]/80 to-[#0e2416]/90" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#c9d4c6] shadow-2xl">
          {/* Left Hero / Brand Identity */}
          <div className="lg:col-span-5 bg-[#14331e] text-white p-5 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#204a2c]">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <AgriLogoIcon size={28} className="text-[#64bd73]" />
                <span className="font-display font-black text-xl tracking-tight uppercase text-white">
                  EARTHRAKSHAK ERP
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs uppercase tracking-widest text-[#8eb895] font-semibold">
                  Smart Agriculture Platform
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight text-white">
                  Precision Farm Operations & Farm-to-Market Exchange
                </h2>
                <p className="text-xs text-[#b8d4be] leading-relaxed">
                  Enterprise-grade agricultural resource planning connecting farm mapping, soil health diagnostics, machinery rental hubs, and certified direct produce procurement.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#235231] text-[11px] text-[#86a88c] space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldIcon size={14} className="text-[#64bd73]" />
                <span>Supabase PostgreSQL & RBAC Ready</span>
              </div>
              <p>Direct produce procurement with zero intermediaries.</p>
            </div>
          </div>

          {/* Right Form / Role Selection */}
          <div className="lg:col-span-7 p-5 sm:p-8 bg-[#fafbfa] flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-[11px] font-bold text-[#5c7360] uppercase tracking-wider">
                System Access Portal
              </span>
              <h3 className="text-xl font-bold font-display text-[#112417] mt-0.5">
                Sign In to Your Workspace
              </h3>
              <p className="text-xs text-[#617564] mt-1">
                Select your designated role to enter the segregated ERP environment.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 text-xs text-[#991b1b] bg-[#fdf2f2] border border-[#f87171]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Role Workspace Selection
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ADMIN', 'FARMER', 'BUYER'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r);
                        if (r === 'ADMIN') setEmail('admin.vikram@earthrakshak.org');
                        else if (r === 'FARMER') setEmail('rajesh.patil@greenvalleyfarm.in');
                        else setEmail('procurement@agromart.co.in');
                      }}
                      className={`py-1.5 px-2 text-xs font-medium text-center border transition-colors ${
                        selectedRole === r
                          ? 'border-[#1b5e20] bg-[#1b5e20] text-white font-bold'
                          : 'border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#f1f5ee]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Official Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#304734] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors"
              >
                Enter {selectedRole} Workspace
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#e2e8df] flex items-center justify-between text-[11px] text-[#6b7e6e]">
              <a href="/privacy" className="hover:text-[#1b5e20]">Privacy Policy</a>
              <span>·</span>
              <a href="/terms" className="hover:text-[#1b5e20]">Terms of Service</a>
              <span>·</span>
              <a href="/support" className="hover:text-[#1b5e20]">System Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
