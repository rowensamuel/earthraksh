import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { cropService } from '../../services/cropService';
import { farmService } from '../../services/farmService';
import { Crop, Farm } from '../../types';
import { PlusIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const MyCropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [season, setSeason] = useState<Crop['season']>('Kharif');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvest, setExpectedHarvest] = useState('');
  const [expectedYield, setExpectedYield] = useState('');

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    setIsLoading(true);
    try {
      const [loadedCrops, loadedFarms] = await Promise.all([
        cropService.getCrops(),
        farmService.getFarms()
      ]);
      setCrops(loadedCrops);
      setFarms(loadedFarms);
      if (loadedFarms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(loadedFarms[0].farm_id);
      }
    } catch (err: any) {
      console.error('Failed to load crops/farms from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load crops.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (cropId: string, status: Crop['status']) => {
    try {
      await cropService.updateCropStatus(cropId, status);
      await loadCrops();
      showToast('Crop Lifecycle Updated', 'success', `Crop transitioned to "${status}" stage.`);
    } catch (err: any) {
      console.error('Failed to update crop status:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update status.');
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !variety || !expectedYield) {
      showToast('Validation Error', 'error', 'Please fill all required crop details.');
      return;
    }

    if (!selectedFarmId) {
      showToast('No Farm Selected', 'error', 'Please create and select a farm plot before registering a crop.');
      return;
    }

    const farm = farms.find(f => f.farm_id === selectedFarmId);

    try {
      await cropService.addCrop({
        farm_id: selectedFarmId,
        farm_name: farm?.farm_name || 'Registered Farm Plot',
        crop_name: cropName,
        variety,
        season,
        planting_date: plantingDate,
        expected_harvest: expectedHarvest || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        status: 'Planted',
        expected_yield: parseFloat(expectedYield),
        health_score: 95
      });

      await loadCrops();
      setIsAddModalOpen(false);
      setCropName('');
      setVariety('');
      setExpectedYield('');
      showToast('Crop Registered', 'success', `${cropName} (${variety}) successfully added to database.`);
    } catch (err: any) {
      console.error('Failed to register crop in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist crop in database.');
    }
  };

  const columns: Column<Crop>[] = [
    {
      header: 'Crop ID',
      accessorKey: 'crop_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.crop_id}</span>
    },
    {
      header: 'Crop & Variety',
      accessorKey: 'crop_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.crop_name}</span>
          <span className="text-[11px] text-[#5e7362]">{row.variety}</span>
        </div>
      )
    },
    {
      header: 'Farm Plot',
      accessorKey: 'farm_name',
      cell: row => <span className="text-xs text-[#2c3f2f]">{row.farm_name}</span>
    },
    {
      header: 'Season',
      accessorKey: 'season',
      sortable: true,
      cell: row => (
        <span className="text-xs font-semibold text-[#1b5e20]">{row.season}</span>
      )
    },
    {
      header: 'Sowing & Harvest',
      cell: row => (
        <div className="text-xs tabular-nums">
          <span className="block text-[#1c2e22]">Sown: {row.planting_date}</span>
          <span className="text-[11px] text-[#6b7e6e]">Harvest: {row.expected_harvest}</span>
        </div>
      )
    },
    {
      header: 'Est. Yield',
      accessorKey: 'expected_yield',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums font-bold text-xs text-[#14291a]">
          {row.expected_yield} MT
        </span>
      )
    },
    {
      header: 'Health Score',
      accessorKey: 'health_score',
      sortable: true,
      align: 'center',
      cell: row => (
        <span className="tabular-nums font-semibold text-xs text-[#1b5e20]">
          {row.health_score}%
        </span>
      )
    },
    {
      header: 'Lifecycle State',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Progress Stage',
      align: 'right',
      cell: row => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'Planted' && (
            <button
              onClick={() => handleStatusChange(row.crop_id, 'Growing')}
              className="px-2 py-0.5 text-[11px] font-semibold border border-[#86efac] text-[#1b5e20] hover:bg-[#f0fdf4]"
            >
              Mark Growing
            </button>
          )}
          {row.status === 'Growing' && (
            <button
              onClick={() => handleStatusChange(row.crop_id, 'Harvested')}
              className="px-2 py-0.5 text-[11px] font-semibold border border-[#86efac] text-[#1b5e20] hover:bg-[#f0fdf4]"
            >
              Mark Harvested
            </button>
          )}
          {row.status === 'Harvested' && (
            <span className="text-[11px] text-[#556b57] italic">Cycle Complete</span>
          )}
          {row.status !== 'Damaged' && row.status !== 'Harvested' && (
            <button
              onClick={() => handleStatusChange(row.crop_id, 'Damaged')}
              className="px-2 py-0.5 text-[11px] font-semibold text-[#991b1b] hover:bg-[#fef2f2]"
              title="Flag as Damaged"
            >
              Flag
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Agronomic Scheduling & Yield Forecasting"
        title="Seasonal Crop Life-Cycle Management"
        description="Track sowing dates, phenological stages ('Planted' -> 'Growing' -> 'Harvested' -> 'Damaged'), projected harvest windows, and metric ton yield targets."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Record New Crop</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={crops}
        searchPlaceholder="Search crops by name, variety, or season..."
        rowsPerPage={10}
      />

      {/* ADD CROP MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Crop Cultivation Cycle"
        subtitle="Log botanical variety, seasonal category, and harvest target"
      >
        <form onSubmit={handleAddCrop} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Select Farm Plot *
            </label>
            <select
              value={selectedFarmId}
              onChange={e => setSelectedFarmId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              {farms.map(f => (
                <option key={f.farm_id} value={f.farm_id}>
                  {f.farm_name} ({f.area} {f.area_unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                placeholder="e.g. Basmati Rice / Durum Wheat"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Specific Variety / Clone *
              </label>
              <input
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                placeholder="e.g. Pusa-1121 / HD-2967"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Seasonal Cycle
              </label>
              <select
                value={season}
                onChange={e => setSeason(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Expected Yield (Metric Tons) *
              </label>
              <input
                type="number"
                step="0.1"
                value={expectedYield}
                onChange={e => setExpectedYield(e.target.value)}
                placeholder="e.g. 14.5"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Planting / Sowing Date
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={e => setPlantingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Target Harvest Window
              </label>
              <input
                type="date"
                value={expectedHarvest}
                onChange={e => setExpectedHarvest(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
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
              Record Crop
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
