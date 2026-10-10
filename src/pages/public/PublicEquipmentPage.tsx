import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { equipmentService } from '../../services/equipmentService';
import { Equipment } from '../../types';
import { SearchIcon, EquipmentIcon, EyeIcon } from '../../components/common/Icons';
import { getEquipmentImage } from '../../assets/assetRegistry';

export const PublicEquipmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramMachineId = searchParams.get('machine');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => dataService.getEquipment());

  useEffect(() => {
    const load = async () => {
      try {
        const live = await equipmentService.getEquipment();
        if (live.length > 0) setEquipmentList(live);
      } catch (err) {
        console.warn('Public equipment live load notice:', err);
      }
    };
    load();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [selectedMachine, setSelectedMachine] = useState<Equipment | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  useEffect(() => {
    if (paramMachineId && equipmentList.length > 0) {
      const found = equipmentList.find(e => e.equipment_id === paramMachineId);
      if (found) setSelectedMachine(found);
    }
  }, [paramMachineId, equipmentList]);

  const filteredEquipment = useMemo(() => {
    let list = [...equipmentList];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        e =>
          e.equipment_name.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q) ||
          (e.owner_name && e.owner_name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(e => {
        const name = e.equipment_name.toLowerCase();
        if (selectedCategory === 'Tractor') return name.includes('tractor');
        if (selectedCategory === 'Harvester') return name.includes('harvester');
        if (selectedCategory === 'Tiller') return name.includes('tiller') || name.includes('rotavator');
        if (selectedCategory === 'Sprayer') return name.includes('sprayer') || name.includes('drone');
        return true;
      });
    }

    // Availability filter
    if (selectedAvailability !== 'ALL') {
      list = list.filter(e => e.availability_status === selectedAvailability);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.rental_rate_per_day - b.rental_rate_per_day);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.rental_rate_per_day - a.rental_rate_per_day);
    }

    return list;
  }, [equipmentList, search, selectedCategory, selectedAvailability, sortBy]);

  return (
    <div className="min-h-screen bg-[#f5f7f4] flex flex-col text-[#1c2e22]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Page Banner */}
        <div className="border-b border-[#dbe3d8] pb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1b5e20] block mb-1">
            AGRICULTURAL MACHINERY SHARING HUB
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#14291a]">
            Agricultural Machinery & Equipment Rental
          </h1>
          <p className="text-xs text-[#5e7362] mt-1 max-w-2xl leading-relaxed">
            Discover heavy utility tractors, precision tillers, rotary harvesters, and crop spraying drones available for local daily hiring across farming clusters.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white border border-[#dbe3d8] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Prominent Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#758a78]">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tractors, harvesters, sprayers, tillers..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] placeholder-[#88998a] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="ALL">All Machinery</option>
              <option value="Tractor">Tractors (4WD / Utility)</option>
              <option value="Harvester">Combine Harvesters</option>
              <option value="Tiller">Tillers & Rotavators</option>
              <option value="Sprayer">Sprayers & Agri Drones</option>
            </select>

            <select
              value={selectedAvailability}
              onChange={e => setSelectedAvailability(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="ALL">All Availability</option>
              <option value="Available">Available Now</option>
              <option value="Rented">Currently Rented</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="recent">Recently Added</option>
              <option value="price-asc">Tariff: Low to High</option>
              <option value="price-desc">Tariff: High to Low</option>
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#5f7563]">
          <span>
            Showing <strong className="text-[#14291a] tabular-nums">{filteredEquipment.length}</strong> agricultural machines
          </span>
          <span className="text-[11px]">
            Verified Mechanical Inspection · Insured Sharing
          </span>
        </div>

        {/* EQUIPMENT CARDS GRID */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map(eq => (
              <div
                key={eq.equipment_id}
                className="bg-white border border-[#dbe3d8] hover:border-[#1b5e20] transition-colors flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="h-48 overflow-hidden relative border-b border-[#e2e8df]">
                    <img
                      src={getEquipmentImage(eq.equipment_name || eq.model)}
                      alt={eq.equipment_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#0e2416]/85 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {eq.equipment_name.includes('Tractor') ? 'Tractor' : eq.equipment_name.includes('Drone') ? 'Precision Drone' : 'Machinery'}
                    </div>
                    <div className="absolute top-2 right-2 bg-white px-2 py-0.5 text-[10px] font-bold text-[#1b5e20] border border-[#dbe3d8]">
                      {eq.condition_status}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-bold font-display text-[#14291a] leading-tight">
                        {eq.equipment_name}
                      </h3>
                      <StatusBadge status={eq.availability_status} />
                    </div>

                    <p className="text-xs text-[#526655]">
                      Model: <strong>{eq.model}</strong>
                    </p>

                    <p className="text-[11px] text-[#637966]">
                      Custodian: {eq.owner_name}
                    </p>

                    {eq.description && (
                      <p className="text-xs text-[#4d6350] line-clamp-2 leading-relaxed pt-1">
                        {eq.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#edf1ea] flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-[#718774] block">Daily Tariff</span>
                        <span className="text-base font-bold font-display text-[#14291a] tabular-nums">
                          ₹{eq.rental_rate_per_day.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[#5c7360]"> / day</span>
                      </div>

                      <div className="text-right text-[11px] text-[#5e7362]">
                        Condition: <strong className="text-[#14291a]">{eq.condition_status}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#fafbfa] border-t border-[#edf1ea] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedMachine(eq)}
                    className="px-3 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#2f4734] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <EyeIcon size={13} />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => setAuthPromptOpen(true)}
                    className="px-3 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <EquipmentIcon size={13} />
                    <span>Book Rental</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
            No agricultural machinery matched your search criteria.
          </div>
        )}
      </main>

      {/* EQUIPMENT DETAILS MODAL */}
      <Modal
        isOpen={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
        title="Agricultural Machinery Specifications"
        subtitle={selectedMachine ? `${selectedMachine.equipment_name} (${selectedMachine.equipment_id})` : ''}
        maxWidth="lg"
      >
        {selectedMachine && (
          <div className="space-y-4">
            <div className="h-52 overflow-hidden border border-[#dbe3d8]">
              <img
                src={getEquipmentImage(selectedMachine.equipment_name || selectedMachine.model)}
                alt={selectedMachine.equipment_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf]">
                  Condition: {selectedMachine.condition_status}
                </span>
                <StatusBadge status={selectedMachine.availability_status} />
              </div>

              <h3 className="text-base font-bold font-display text-[#14291a]">
                {selectedMachine.equipment_name}
              </h3>

              <p className="text-xs text-[#526655] leading-relaxed">
                {selectedMachine.description || 'Commercial-grade agricultural machinery inspected and certified for seasonal field work.'}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8faf7] border border-[#dbe3d8] text-xs">
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Daily Rental Rate</span>
                  <strong className="text-base text-[#14291a] font-display tabular-nums">
                    ₹{selectedMachine.rental_rate_per_day.toLocaleString('en-IN')}
                  </strong>
                  <span className="text-[11px] text-[#5e7362]"> / day</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Model & Engine Specs</span>
                  <span className="font-semibold text-[#14291a]">{selectedMachine.model}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#edf1ea]">
                  <span className="text-[10px] text-[#718774] block uppercase">Registered Owner & Operational Base</span>
                  <span className="font-semibold text-[#14291a]">{selectedMachine.owner_name}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#edf1ea] flex justify-end gap-2">
              <button
                onClick={() => setSelectedMachine(null)}
                className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedMachine(null);
                  setAuthPromptOpen(true);
                }}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] cursor-pointer"
              >
                Book Rental Hire
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* LOGIN TO HIRE MODAL */}
      <Modal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Farmer / Buyer Account Required"
        subtitle="Sign in or register an accredited account to book machinery hire"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-[#354c38]">
          <p className="leading-relaxed">
            Booking tractors, rotavators, harvesters, and sprayers requires a verified producer or agricultural contractor account with cadastral land or business details.
          </p>

          <div className="p-3 bg-[#f5f8f3] border border-[#d2e0cf] space-y-1">
            <span className="font-bold text-[#14291a] block">Machinery Sharing Benefits:</span>
            <ul className="space-y-1 text-[#455c47] list-disc list-inside">
              <li>Verified maintenance service checks before dispatch</li>
              <li>Standardized daily tariffs with zero unauthorized markups</li>
              <li>Electronic machinery handover checklists and insurance coverage</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <Link
              to="/login"
              className="py-2 px-4 text-center text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
            >
              Sign In to Existing Account
            </Link>
            <Link
              to="/register"
              className="py-2 px-4 text-center text-xs font-bold uppercase tracking-wider border border-[#1b5e20] text-[#1b5e20] hover:bg-[#eef4ec] transition-colors"
            >
              Register Farmer Account
            </Link>
          </div>
        </div>
      </Modal>

      <PublicFooter />
    </div>
  );
};
