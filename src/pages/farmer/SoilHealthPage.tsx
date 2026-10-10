import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { soilService } from '../../services/soilService';
import { farmService } from '../../services/farmService';
import { SoilHealth, Farm } from '../../types';
import { PlusIcon, SoilIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { homeHeroImage } from '../../assets/assetRegistry';

export const SoilHealthPage: React.FC = () => {
  const [records, setRecords] = useState<SoilHealth[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [ph, setPh] = useState('6.8');
  const [nitrogen, setNitrogen] = useState('280');
  const [phosphorus, setPhosphorus] = useState('45');
  const [potassium, setPotassium] = useState('220');
  const [moisture, setMoisture] = useState('24');
  const [organicCarbon, setOrganicCarbon] = useState('0.84');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSoil();
  }, []);

  const loadSoil = async () => {
    setIsLoading(true);
    try {
      const [loadedSoil, loadedFarms] = await Promise.all([
        soilService.getSoilRecords(),
        farmService.getFarms()
      ]);
      setRecords(loadedSoil);
      setFarms(loadedFarms);
      if (loadedFarms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(loadedFarms[0].farm_id);
      }
    } catch (err: any) {
      console.error('Failed to load soil records from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load soil records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) {
      showToast('Validation Error', 'error', 'Please select a registered farm plot.');
      return;
    }

    const farm = farms.find(f => f.farm_id === selectedFarmId);

    const nVal = parseFloat(nitrogen);
    const pVal = parseFloat(phosphorus);
    const kVal = parseFloat(potassium);
    const phVal = parseFloat(ph);

    // Calculate fertility based on NPK
    let fertility: SoilHealth['fertility_status'] = 'Medium';
    if (nVal >= 280 && pVal >= 40 && kVal >= 200) fertility = 'High';
    else if (nVal < 200 || pVal < 20 || kVal < 140) fertility = 'Low';

    const recs: string[] = [];
    if (phVal < 6.5) recs.push('Soil tends acidic: Incorporate agricultural lime or wood ash at 1.5 t/ha');
    else if (phVal > 7.5) recs.push('Soil is alkaline: Apply gypsum and green manure crops like Sesbania');
    else recs.push('Optimal soil pH balance for cereal and pulse cultivation');

    if (nVal < 240) recs.push('Apply top dressing of Neem-coated Urea or Azotobacter bio-fertilizer');
    if (pVal < 30) recs.push('Supplement Single Super Phosphate (SSP) at root zone prior to flowering');
    if (kVal < 180) recs.push('Muriate of Potash (MOP) 25 kg/acre recommended during panicle initiation');

    try {
      await soilService.addSoilRecord({
        farm_id: selectedFarmId,
        farm_name: farm?.farm_name || 'Registered Farm Plot',
        ph_level: phVal,
        nitrogen: nVal,
        phosphorus: pVal,
        potassium: kVal,
        moisture: parseFloat(moisture),
        organic_carbon: parseFloat(organicCarbon),
        fertility_status: fertility,
        test_date: testDate,
        recommendations: recs
      });

      await loadSoil();
      setIsAddModalOpen(false);
      showToast('Soil Health Test Logged', 'success', 'Fertilizer advisories and soil test saved to database.');
    } catch (err: any) {
      console.error('Failed to save soil record in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist soil record.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Precision Agronomy & Nutrient Management"
        title="Soil Health Chemistry & NPK Telemetry"
        description="Monitor laboratory soil assays: pH reaction, Nitrogen (N), Phosphorus (P), Potassium (K), moisture percentage, and organic carbon with automated agronomist fertilizer recommendations."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Log Soil Test</span>
          </button>
        }
      />

      {/* SOIL FIELD OVERVIEW CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-[#dbe3d8] p-6">
        <div className="md:col-span-4 h-48 md:h-auto overflow-hidden border border-[#d2dec0]">
          <img
            src={homeHeroImage}
            alt="Soil sampling"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-8 flex flex-col justify-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e20]">
            Accredited Laboratory Protocol
          </span>
          <h2 className="text-xl font-bold font-display text-[#14291a]">
            Standard Soil Health Card Diagnostics
          </h2>
          <p className="text-xs text-[#526655] leading-relaxed">
            Nutrient analysis calibrated to national agricultural standards. Regular testing mitigates fertilizer overuse, safeguards micro-biome ecology, and boosts crop yield predictability.
          </p>
          <div className="flex items-center gap-6 pt-2 text-xs">
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Tested Plots</span>
              <strong className="text-[#14291a] text-sm tabular-nums">{records.length} Profiles</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Avg pH Rating</span>
              <strong className="text-[#14291a] text-sm tabular-nums">7.05 (Neutral)</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#718774] block uppercase">Soil Carbon Health</span>
              <strong className="text-[#1b5e20] text-sm tabular-nums">0.78% (Healthy)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SOIL RECORDS LIST */}
      <div className="space-y-4">
        {records.map(rec => (
          <div key={rec.soil_id} className="bg-white border border-[#dbe3d8] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#edf1ea] gap-2 mb-4">
              <div>
                <span className="text-xs font-bold text-[#14291a]">{rec.farm_name}</span>
                <span className="text-[11px] text-[#637a67] ml-2">Sample ID: {rec.soil_id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#637a67] tabular-nums">Tested: {rec.test_date}</span>
                <StatusBadge status={rec.fertility_status} />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-4 text-center">
              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">pH Value</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.ph_level}</strong>
                <span className="text-[10px] text-[#627a66]">
                  {rec.ph_level < 6.5 ? 'Acidic' : rec.ph_level > 7.5 ? 'Alkaline' : 'Neutral'}
                </span>
              </div>

              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">Nitrogen (N)</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.nitrogen}</strong>
                <span className="text-[10px] text-[#627a66]">kg/ha</span>
              </div>

              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">Phosphorus (P)</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.phosphorus}</strong>
                <span className="text-[10px] text-[#627a66]">kg/ha</span>
              </div>

              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">Potassium (K)</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.potassium}</strong>
                <span className="text-[10px] text-[#627a66]">kg/ha</span>
              </div>

              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">Moisture</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.moisture}%</strong>
                <span className="text-[10px] text-[#627a66]">Target 20-25%</span>
              </div>

              <div className="p-2.5 bg-[#fbfcfb] border border-[#e2e8df]">
                <span className="text-[10px] text-[#627a66] uppercase block">Organic Carbon</span>
                <strong className="text-base text-[#14291a] tabular-nums block">{rec.organic_carbon}%</strong>
                <span className="text-[10px] text-[#1b5e20] font-semibold">Desirable</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-[#f5f8f3] border border-[#d8e3d5]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14291a] block mb-1">
                Fertilizer & Soil Condition Action Plan:
              </span>
              <ul className="space-y-1 text-xs text-[#3b523e]">
                {rec.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#1b5e20] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* ADD SOIL TEST MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Lab Soil Chemical Assay"
        subtitle="Record tested parameters from physical Soil Health Card"
      >
        <form onSubmit={handleAddSoil} className="space-y-4">
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
                  {f.farm_name} ({f.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                pH Reaction Level (0-14) *
              </label>
              <input
                type="number"
                step="0.1"
                value={ph}
                onChange={e => setPh(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Nitrogen (N) kg/ha *
              </label>
              <input
                type="number"
                value={nitrogen}
                onChange={e => setNitrogen(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Phosphorus (P) kg/ha *
              </label>
              <input
                type="number"
                value={phosphorus}
                onChange={e => setPhosphorus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Potassium (K) kg/ha *
              </label>
              <input
                type="number"
                value={potassium}
                onChange={e => setPotassium(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Moisture % *
              </label>
              <input
                type="number"
                step="0.1"
                value={moisture}
                onChange={e => setMoisture(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Organic Carbon % *
              </label>
              <input
                type="number"
                step="0.01"
                value={organicCarbon}
                onChange={e => setOrganicCarbon(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Sample Collection / Testing Date
            </label>
            <input
              type="date"
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
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
              Log Soil Health Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
