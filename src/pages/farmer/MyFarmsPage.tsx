import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { farmService } from '../../services/farmService';
import { Farm } from '../../types';
import { PlusIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const MyFarmsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<'Acres' | 'Hectares'>('Acres');
  const [soilType, setSoilType] = useState<Farm['soil_type']>('Black Soil');
  const [waterSource, setWaterSource] = useState<Farm['water_source']>('Drip Irrigation');

  useEffect(() => {
    loadFarms();
  }, [currentUser]);

  const loadFarms = async () => {
    setIsLoading(true);
    try {
      const data = await farmService.getFarms(currentUser?.user_id);
      setFarms(data);
    } catch (err: any) {
      console.error('Failed to load farms from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load farms.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !location || !area) {
      showToast('Validation Error', 'error', 'Please fill all required farm details.');
      return;
    }

    try {
      await farmService.addFarm({
        user_id: currentUser?.user_id || '',
        farm_name: farmName,
        location,
        area: parseFloat(area),
        area_unit: areaUnit,
        soil_type: soilType,
        water_source: waterSource,
        active_crops_count: 0,
        established_year: new Date().getFullYear()
      });

      await loadFarms();
      setIsAddModalOpen(false);
      setFarmName('');
      setLocation('');
      setArea('');
      showToast('Farm Registered', 'success', `${farmName} successfully added to database.`);
    } catch (err: any) {
      console.error('Farm creation failed in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist farm in database.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Land Holdings & Spatial Cadastre"
        title="My Farm Plots & Cadastral Mapping"
        description="Register and manage agricultural land parcels, GPS boundaries, soil classifications, and dedicated water irrigation channels."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Add Farm Plot</span>
          </button>
        }
      />

      {/* FARMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map(farm => (
          <div key={farm.farm_id} className="bg-white border border-[#dbe3d8] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf]">
                  Plot ID: {farm.farm_id}
                </span>
                <span className="text-xs font-semibold text-[#576b5a] tabular-nums">
                  Established {farm.established_year}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-[#14291a] mb-1">
                {farm.farm_name}
              </h3>
              <p className="text-xs text-[#5e7362] mb-4">
                {farm.location}
              </p>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[#edf1ea] text-xs">
                <div>
                  <span className="text-[10px] text-[#718774] uppercase block">Total Area</span>
                  <span className="font-bold text-sm text-[#14291a] tabular-nums">
                    {farm.area} {farm.area_unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] uppercase block">Soil Taxonomy</span>
                  <span className="font-semibold text-xs text-[#2c402f]">
                    {farm.soil_type}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] uppercase block">Water Infrastructure</span>
                  <span className="font-semibold text-xs text-[#1b5e20]">
                    {farm.water_source}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] uppercase block">Active Cultivations</span>
                  <span className="font-bold text-xs tabular-nums text-[#14291a]">
                    {farm.active_crops_count || 2} Active Crops
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#6b7e6e]">GIS Boundary Mapped</span>
              <a
                href="/farmer/crops"
                className="text-xs font-semibold text-[#1b5e20] hover:underline"
              >
                View Plot Crops →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ADD FARM MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Agricultural Plot"
        subtitle="Specify cadastral land details and primary irrigation sources"
      >
        <form onSubmit={handleAddFarm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Farm Plot Name *
            </label>
            <input
              type="text"
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              placeholder="e.g. Green Valley West Orchard"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Village / Cluster / District *
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Niphad Tehsil, Nashik District"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Land Area *
              </label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="e.g. 12.5"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Area Unit
              </label>
              <select
                value={areaUnit}
                onChange={e => setAreaUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Acres">Acres</option>
                <option value="Hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Soil Classification
              </label>
              <select
                value={soilType}
                onChange={e => setSoilType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Black Soil">Black Soil (Regur)</option>
                <option value="Loamy">Loamy Soil</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay">Clay Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Primary Irrigation
              </label>
              <select
                value={waterSource}
                onChange={e => setWaterSource(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal System</option>
                <option value="River">River Pump</option>
                <option value="Rainfed">Rainfed / Monsoon</option>
              </select>
            </div>
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
              Save Farm Plot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
