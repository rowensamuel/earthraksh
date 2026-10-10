import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { Equipment, EquipmentMaintenance } from '../../types';
import { PlusIcon, EquipmentIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { tractorImg } from '../../assets/assetRegistry';

export const FarmerEquipmentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<EquipmentMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2023-01-15');
  const [rentalRate, setRentalRate] = useState('1800');
  const [condition, setCondition] = useState<Equipment['condition_status']>('Excellent');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadEquipment();
  }, [currentUser]);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const [loadedEq, loadedMaint] = await Promise.all([
        equipmentService.getEquipment(currentUser?.user_id),
        equipmentService.getMaintenance()
      ]);
      setEquipment(loadedEq);
      setMaintenance(loadedMaint);
    } catch (err: any) {
      console.error('Failed to load equipment from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load machinery.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (eq: Equipment) => {
    const nextStatus = eq.availability_status === 'Available' ? 'Rented' : 'Available';
    try {
      await equipmentService.updateEquipmentStatus(eq.equipment_id, nextStatus);
      await loadEquipment();
      showToast('Equipment Status Updated', 'success', `${eq.equipment_name} is now ${nextStatus}.`);
    } catch (err: any) {
      console.error('Failed to update equipment status:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update machine status.');
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !rentalRate) {
      showToast('Validation Error', 'error', 'Please fill all required machine details.');
      return;
    }

    try {
      await equipmentService.addEquipment({
        user_id: currentUser?.user_id || '',
        owner_name: `${currentUser?.full_name || 'Farmer'} (Green Valley Farms)`,
        equipment_name: name,
        model,
        purchase_date: purchaseDate,
        rental_rate_per_day: parseFloat(rentalRate),
        availability_status: 'Available',
        condition_status: condition,
        description,
        location: currentUser?.address || 'Maharashtra Machinery Hub'
      });

      await loadEquipment();
      setIsAddModalOpen(false);
      setName('');
      setModel('');
      setDescription('');
      showToast('Equipment Registered', 'success', `${name} listed in machinery database.`);
    } catch (err: any) {
      console.error('Failed to add equipment to database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist equipment.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Machinery Fleet & Sharing Economy"
        title="Farm Machinery Fleet & Custom Hiring"
        description="List tractors, rotavators, sprayers, and combine harvesters for local peer-to-peer sharing. Monetize idle machinery hours through verified day-rate rentals."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>List Machinery</span>
          </button>
        }
      />

      {/* Hero Showcase Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-[#dbe3d8] p-6">
        <div className="md:col-span-5 h-52 md:h-auto overflow-hidden border border-[#d2dec0]">
          <img
            src={tractorImg}
            alt="Farm tractor in wheat field"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-7 flex flex-col justify-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e20]">
            Shared Agri-Machinery Hub
          </span>
          <h2 className="text-xl font-bold font-display text-[#14291a]">
            Empowering Precision Mechanization
          </h2>
          <p className="text-xs text-[#526655] leading-relaxed">
            Cooperative farm mechanization reduces capital overhead for smallholder farmers. All rental contracts generate digital dispatch slips with automated day-rate billing settlement.
          </p>
          <div className="flex items-center gap-6 pt-2 text-xs">
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Fleet Size</span>
              <strong className="text-[#14291a] text-sm tabular-nums">{equipment.length} Units</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Available Now</span>
              <strong className="text-[#1b5e20] text-sm tabular-nums">
                {equipment.filter(e => e.availability_status === 'Available').length} Machines
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Rental Income (Mo)</span>
              <strong className="text-[#14291a] text-sm tabular-nums">₹12,000</strong>
            </div>
          </div>
        </div>
      </div>

      {/* EQUIPMENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map(eq => (
          <div key={eq.equipment_id} className="bg-white border border-[#dbe3d8] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#edf1ea] gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf] mr-2">
                    {eq.equipment_id}
                  </span>
                  <span className="text-sm font-bold font-display text-[#14291a]">{eq.equipment_name}</span>
                </div>
                <StatusBadge status={eq.availability_status} />
              </div>

              <p className="text-xs font-medium text-[#4b614e] mb-1">{eq.model}</p>
              {eq.description && (
                <p className="text-xs text-[#637966] leading-relaxed mb-4">{eq.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[#edf1ea] text-xs">
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Rental Day Tariff</span>
                  <span className="font-bold text-sm text-[#14291a] tabular-nums">
                    ₹{eq.rental_rate_per_day.toLocaleString('en-IN')} / day
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Mechanical Condition</span>
                  <StatusBadge status={eq.condition_status} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#788e7b]">Acquired: {eq.purchase_date}</span>
              <button
                onClick={() => handleToggleAvailability(eq)}
                className={`px-3 py-1 font-semibold text-xs border transition-colors ${
                  eq.availability_status === 'Available'
                    ? 'border-[#c9d4c6] text-[#334737] hover:bg-[#edf2ea]'
                    : 'bg-[#1b5e20] text-white hover:bg-[#144719]'
                }`}
              >
                {eq.availability_status === 'Available' ? 'Mark as Rented' : 'Set Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD EQUIPMENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Farm Machinery"
        subtitle="List tractor, tiller, sprayer or harvester for rental booking"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Equipment / Machine Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Deere 5050D 4WD Utility Tractor"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Model & Engine Specifications *
            </label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="e.g. 50 HP Dual Clutch Turbo, 2023"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Daily Rental Tariff (₹) *
              </label>
              <input
                type="number"
                value={rentalRate}
                onChange={e => setRentalRate(e.target.value)}
                placeholder="e.g. 2400"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Condition Rating
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Excellent">Excellent (New / Fully Serviced)</option>
                <option value="Good">Good (Minor cosmetic wear)</option>
                <option value="Needs Repair">Needs Repair (Scheduled overhaul)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Purchase / Registration Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Description & Compatible Attachments
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Compatible with 7-foot rotavator and 9-tyne cultivator. Includes operator."
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719]"
            >
              List in Equipment Hub
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
