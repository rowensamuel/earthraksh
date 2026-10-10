import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { weatherService, LiveWeatherReport } from '../../services/weatherService';
import { farmService } from '../../services/farmService';
import { useAuth } from '../../context/AuthContext';
import { Farm } from '../../types';
import { WeatherIcon, RefreshIcon } from '../../components/common/Icons';

export const FarmerWeatherPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [report, setReport] = useState<LiveWeatherReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, [currentUser]);

  useEffect(() => {
    loadWeatherData();
  }, [selectedFarmId, farms]);

  const loadFarms = async () => {
    try {
      const data = await farmService.getFarms(currentUser?.user_id);
      setFarms(data);
    } catch (err) {
      console.warn('Farms list fetch error:', err);
    }
  };

  const loadWeatherData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const currentFarm = farms.find(f => f.farm_id === selectedFarmId);
      const location = currentFarm?.location || currentUser?.address || 'Nashik, Maharashtra';
      const farmId = currentFarm?.farm_id;
      const liveData = await weatherService.getLiveWeather(location, farmId);
      setReport(liveData);
    } catch (err: any) {
      console.error('Weather data fetch error:', err);
      setErrorMsg(err.message || 'Failed to retrieve live atmospheric telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentFarm = farms.find(f => f.farm_id === selectedFarmId);
  const farmDisplayName = currentFarm?.farm_name || (report ? report.location : 'Primary Agricultural Sector');

  return (
    <div className="space-y-6">
      <PageHeader
        category="Micro-Climatic Telemetry & IoT Advisory"
        title="Agro-Meteorological Forecast & Field Telemetry"
        description="Daily atmospheric logging for registered farm plots: ambient temperature, relative humidity, cumulative precipitation, and crop canopy protection advisories."
        actions={
          <div className="flex items-center gap-3">
            {farms.length > 0 && (
              <select
                value={selectedFarmId}
                onChange={e => setSelectedFarmId(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="all">All Plots · Default Location</option>
                {farms.map(f => (
                  <option key={f.farm_id} value={f.farm_id}>
                    {f.farm_name} ({f.location})
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={loadWeatherData}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <RefreshIcon size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Fetching...' : 'Sync Telemetry'}</span>
            </button>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Hero Live Telemetry Box */}
      <div className="bg-[#0f2416] text-white p-6 md:p-8 border border-[#1b3d26]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#204a2c]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7dc489] font-bold mb-1">
              <WeatherIcon size={18} />
              <span>Micro-Climatic Station · {farmDisplayName}</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-4xl md:text-5xl font-bold font-display text-white tabular-nums">
                {report ? `${report.temperature}°C` : '--°C'}
              </span>
              <span className="text-lg text-[#a9d4b0] font-medium">
                {report ? report.condition_desc : 'Synchronizing...'}
              </span>
            </div>
            <p className="text-xs text-[#89b392] mt-1 tabular-nums">
              Geo-coordinates: {report ? `${report.latitude.toFixed(4)}°N, ${report.longitude.toFixed(4)}°E` : '19.9975°N, 73.7898°E'} · Live Open-Meteo Telemetry
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-[#163821] border border-[#235733]">
              <span className="text-[10px] text-[#86ab8e] uppercase block font-semibold">Relative Humidity</span>
              <strong className="text-lg text-white tabular-nums block mt-0.5">
                {report ? `${report.humidity}%` : '--'}
              </strong>
              <span className="text-[10px] text-[#789e80]">
                {report && report.humidity > 70 ? 'High atmospheric vapor' : 'Optimal vapor index'}
              </span>
            </div>
            <div className="p-3 bg-[#163821] border border-[#235733]">
              <span className="text-[10px] text-[#86ab8e] uppercase block font-semibold">Precipitation</span>
              <strong className="text-lg text-white tabular-nums block mt-0.5">
                {report ? `${report.rainfall} mm` : '--'}
              </strong>
              <span className="text-[10px] text-[#789e80]">
                {report && report.rainfall > 0 ? 'Active rain gauge' : 'Dry canopy state'}
              </span>
            </div>
            <div className="p-3 bg-[#163821] border border-[#235733]">
              <span className="text-[10px] text-[#86ab8e] uppercase block font-semibold">Wind Velocity</span>
              <strong className="text-lg text-white tabular-nums block mt-0.5">
                {report ? `${report.wind_speed} km/h` : '--'}
              </strong>
              <span className="text-[10px] text-[#789e80]">Surface anemometer</span>
            </div>
          </div>
        </div>

        {/* Operational Farm Advisory */}
        <div className="pt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7dc489] block mb-1">
            Agronomic Protection Advisory
          </span>
          <p className="text-xs text-[#d3e8d7] leading-relaxed max-w-3xl">
            {report?.forecast_advisory || 'Synchronizing localized agronomic telemetry advisory...'}
          </p>
        </div>
      </div>

      {/* 5-Day Agro Forecast Table */}
      <div className="bg-white border border-[#dbe3d8]">
        <div className="p-4 border-b border-[#e2e8df] bg-[#fafbfa]">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            5-Day Micro-Forecast & Sowing Windows
          </h3>
          <p className="text-[11px] text-[#617764]">Predictive weather metrics for irrigation and harvest planning</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f2f5ef] border-b border-[#dbe3d8] text-[#4d5e50]">
                <th className="px-4 py-2.5 font-semibold">Day & Forecast Window</th>
                <th className="px-4 py-2.5 font-semibold">Atmospheric Condition</th>
                <th className="px-4 py-2.5 font-semibold text-right">Max / Min Temp</th>
                <th className="px-4 py-2.5 font-semibold text-center">Precipitation Probability</th>
                <th className="px-4 py-2.5 font-semibold text-right">Wind Speed</th>
                <th className="px-4 py-2.5 font-semibold">Recommended Farm Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ea]">
              {report?.dailyForecast && report.dailyForecast.length > 0 ? (
                report.dailyForecast.map((f, i) => (
                  <tr key={i} className="hover:bg-[#f7f9f6]">
                    <td className="px-4 py-3 font-semibold text-[#14291a]">{f.day}</td>
                    <td className="px-4 py-3 text-[#2c402f]">{f.cond}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-[#14291a]">
                      {f.high} / {f.low}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-semibold text-[#1b5e20]">
                      {f.rainProb}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#4f6352]">{f.wind}</td>
                    <td className="px-4 py-3 text-xs text-[#3b523e]">
                      {f.recommendedAction}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-[#718774]">
                    {isLoading ? 'Retrieving multi-day predictive forecast...' : 'No forecast metrics available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
