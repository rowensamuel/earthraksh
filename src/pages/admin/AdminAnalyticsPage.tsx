import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { AnalyticsIcon, FarmIcon, CropIcon, MarketplaceIcon, OrdersIcon } from '../../components/common/Icons';

export const AdminAnalyticsPage: React.FC = () => {
  const cropDistribution = [
    { crop: 'Basmati Rice', area: '34.5 Acres', share: 35, yield: '14.5 MT' },
    { crop: 'Durum Wheat', area: '42.0 Acres', share: 42, yield: '25.2 MT' },
    { crop: 'Alphonso Mango', area: '10.0 Acres', share: 10, yield: '11.4 MT' },
    { crop: 'Bell Peppers', area: '5.0 Acres', share: 5, yield: '8.2 MT' },
    { crop: 'Organic Soybean', area: '8.5 Acres', share: 8, yield: '9.8 MT' }
  ];

  const categoryTurnover = [
    { category: 'Grains & Cereals', gmv: '₹1,13,500', share: 43 },
    { category: 'Export Fruits', gmv: '₹1,45,000', share: 49 },
    { category: 'Hydroponic Veggies', gmv: '₹34,000', share: 8 }
  ];

  const regionalAcreage = [
    { region: 'Nashik Agri Belt (Maharashtra)', acres: 39.5, soil: 'Black Soil / Loamy', irrigation: 'Drip / Borewell' },
    { region: 'Ludhiana Plains (Punjab)', acres: 42.0, soil: 'Alluvial', irrigation: 'Canal Network' },
    { region: 'Delta Zone (Tamil Nadu)', acres: 18.5, soil: 'Clay Loam', irrigation: 'River Cauvery' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Agronomic Intelligence & Growth"
        title="Predictive Agronomy & Marketplace Analytics"
        description="Empirical tracking of agricultural yield variance, seasonal crop acreage, trading velocity, and supply chain fulfillment metrics."
      />

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Cultivated Land"
          value="100.0"
          unit="Acres"
          subtext="Under verified digital mapping"
          icon={<FarmIcon size={18} />}
        />
        <StatCard
          label="Aggregate Expected Yield"
          value="69.1"
          unit="Metric Tons"
          subtext="Across Kharif & Rabi cycles"
          icon={<CropIcon size={18} />}
        />
        <StatCard
          label="Avg Fulfillment Turnaround"
          value="2.4"
          unit="Days"
          subtext="Farm harvest to buyer warehouse"
          icon={<OrdersIcon size={18} />}
        />
        <StatCard
          label="Direct Producer Realization"
          value="91.4%"
          unit="Net"
          subtext="Retained by farmers vs APMC benchmark"
          icon={<AnalyticsIcon size={18} />}
        />
      </div>

      {/* CHARTS / VISUAL TELEMETRY GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Acreage Distribution */}
        <div className="bg-white border border-[#dbe3d8] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8df] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Crop Acreage & Projected Production
              </h3>
              <p className="text-[11px] text-[#617764]">Proportion of registered land by commercial commodity</p>
            </div>
            <span className="text-xs font-semibold text-[#1b5e20] tabular-nums">100 Acres Total</span>
          </div>

          <div className="space-y-3">
            {cropDistribution.map(item => (
              <div key={item.crop} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#14291a]">{item.crop}</span>
                  <span className="tabular-nums text-[#5c7360]">{item.area} ({item.share}%) · Est: {item.yield}</span>
                </div>
                <div className="w-full bg-[#edf2ea] h-2">
                  <div
                    className="bg-[#1b5e20] h-2 transition-all duration-300"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commodity Trading Value Split */}
        <div className="bg-white border border-[#dbe3d8] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8df] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Gross Merchandise Value By Commodity
              </h3>
              <p className="text-[11px] text-[#617764]">Financial volume cleared through digital direct settlement</p>
            </div>
            <span className="text-xs font-semibold text-[#1b5e20] tabular-nums">₹2,92,500 Total</span>
          </div>

          <div className="space-y-3">
            {categoryTurnover.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#14291a]">{item.category}</span>
                  <span className="tabular-nums font-bold text-[#14291a]">{item.gmv} ({item.share}%)</span>
                </div>
                <div className="w-full bg-[#edf2ea] h-2">
                  <div
                    className="bg-[#2e7d32] h-2 transition-all duration-300"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-[#f5f8f3] border border-[#dbe3d8] text-xs text-[#475e4b] space-y-1">
            <span className="font-bold block text-[#14291a]">Procurement Price Advantage</span>
            <p>
              Direct farm gate transactions saved wholesale buyers an estimated 14.8% on intermediary transit and mandi cess fees while increasing producer net profit by 22.3%.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Agronomy Table */}
      <div className="bg-white border border-[#dbe3d8]">
        <div className="p-4 border-b border-[#e2e8df] bg-[#fafbfa]">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            Regional Agronomic Zones & Irrigation Infrastructure
          </h3>
          <p className="text-[11px] text-[#617764]">Soil taxonomy classification and primary water security profiles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f2f5ef] border-b border-[#dbe3d8] text-[#4d5e50]">
                <th className="px-4 py-2.5 font-semibold">Agro-Climatic Zone</th>
                <th className="px-4 py-2.5 font-semibold text-right">Mapped Area</th>
                <th className="px-4 py-2.5 font-semibold">Soil Type Classification</th>
                <th className="px-4 py-2.5 font-semibold">Primary Water Sourcing</th>
                <th className="px-4 py-2.5 font-semibold">Irrigation Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ea]">
              {regionalAcreage.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f7f9f6]">
                  <td className="px-4 py-3 font-semibold text-[#14291a]">{row.region}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-[#14291a]">{row.acres} Acres</td>
                  <td className="px-4 py-3 text-[#314734]">{row.soil}</td>
                  <td className="px-4 py-3 text-[#314734]">{row.irrigation}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-[#1b5e20]">High (Year-Round)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
