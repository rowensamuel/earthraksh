import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { farmService } from '../../services/farmService';
import { cropService } from '../../services/cropService';
import { soilService } from '../../services/soilService';
import { weatherService } from '../../services/weatherService';
import { orderService } from '../../services/orderService';
import { equipmentService } from '../../services/equipmentService';
import { inventoryService } from '../../services/inventoryService';
import { marketplaceService } from '../../services/marketplaceService';
import { Farm, Crop, SoilHealth, WeatherLog, Order, Equipment, InventoryItem, MarketplaceProduct } from '../../types';
import {
  FarmIcon,
  CropIcon,
  SoilIcon,
  WeatherIcon,
  OrdersIcon,
  EquipmentIcon,
  InventoryIcon,
  MarketplaceIcon,
  PlusIcon
} from '../../components/common/Icons';
import { homeHeroImage } from '../../assets/assetRegistry';
import { Link } from 'react-router-dom';

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [soil, setSoil] = useState<SoilHealth[]>([]);
  const [weather, setWeather] = useState<WeatherLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [liveWeather, setLiveWeather] = useState<any>(null);

  useEffect(() => {
    loadFarmerData();
  }, [currentUser]);

  const loadFarmerData = async () => {
    try {
      const [f, c, s, w, o, e, i, p] = await Promise.all([
        farmService.getFarms(currentUser?.user_id),
        cropService.getCrops(),
        soilService.getSoilRecords(),
        weatherService.getWeatherLogs(),
        orderService.getOrders(undefined, currentUser?.user_id),
        equipmentService.getEquipment(currentUser?.user_id),
        inventoryService.getInventory(currentUser?.user_id),
        marketplaceService.getProducts(currentUser?.user_id)
      ]);
      setFarms(f);
      setCrops(c);
      setSoil(s);
      setWeather(w);
      setOrders(o);
      setEquipment(e);
      setInventory(i);
      setProducts(p);

      // Fetch live micro-climatic telemetry for primary registered farm
      try {
        const farmLoc = f[0]?.location || currentUser?.address || 'Nashik, Maharashtra';
        const live = await weatherService.getLiveWeather(farmLoc, f[0]?.farm_id);
        setLiveWeather(live);
      } catch (wErr) {
        console.warn('Live weather fetch for dashboard:', wErr);
      }
    } catch (err) {
      console.warn('Farmer dashboard data fetch:', err);
    }
  };

  const totalAcreage = farms.reduce((acc, f) => acc + f.area, 0);
  const activeCrops = crops.filter(c => c.status === 'Growing' || c.status === 'Planted');
  const latestWeather = liveWeather || weather[0] || {
    temperature: 28.4,
    humidity: 68,
    rainfall: 0,
    condition_desc: 'Sunny',
    wind_speed: 12.5,
    forecast_advisory: 'Clear skies favorable for nutrient spraying and harvesting operations.'
  };

  return (
    <div className="space-y-6">
      {/* Editorial Agricultural Hero Banner */}
      <div className="relative bg-[#0f2416] text-white p-6 md:p-8 border border-[#1b3d26] overflow-hidden">
        <div className="absolute inset-0 opacity-20 z-0">
          <img
            src={homeHeroImage}
            alt="Farm production"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2416] via-[#0f2416]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7dc489] block mb-1">
            Farm Operations Command
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-2">
            Welcome back, {currentUser.full_name}
          </h1>
          <p className="text-xs text-[#c4dec9] leading-relaxed mb-4">
            Monitoring {totalAcreage} acres across {farms.length} active plots in Nashik District. Soil moisture is within target boundaries for Kharif grain fill stage.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/farmer/crops"
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors inline-flex items-center gap-1.5"
            >
              <PlusIcon size={14} />
              <span>Record Crop Lifecycle</span>
            </Link>
            <Link
              to="/farmer/marketplace"
              className="px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors inline-flex items-center gap-1.5"
            >
              <MarketplaceIcon size={14} />
              <span>List Fresh Produce</span>
            </Link>
          </div>
        </div>
      </div>

      {/* FARMER STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Registered Land"
          value={totalAcreage}
          unit="Acres"
          subtext={`${farms.length} Plots mapped`}
          icon={<FarmIcon size={18} />}
        />
        <StatCard
          label="Standing Crops"
          value={activeCrops.length}
          unit="Cultivations"
          subtext="Healthy growth index"
          icon={<CropIcon size={18} />}
        />
        <StatCard
          label="Orders Received"
          value={orders.length}
          unit="Fulfillments"
          subtext="Direct buyer procurement"
          icon={<OrdersIcon size={18} />}
        />
        <StatCard
          label="Machinery Fleet"
          value={equipment.length}
          unit="Units"
          subtext={`${equipment.filter(e => e.availability_status === 'Available').length} available for hire`}
          icon={<EquipmentIcon size={18} />}
        />
      </div>

      {/* SECOND ROW: CROPS & WEATHER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crops Lifecycle Overview */}
        <div className="lg:col-span-8 bg-white border border-[#dbe3d8] flex flex-col">
          <div className="p-4 border-b border-[#e2e8df] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fafbfa]">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Active Crop Life-Cycle & Yield Progress
              </h2>
              <p className="text-[11px] text-[#617764]">Seasonal growth tracking from sowing through harvest window</p>
            </div>
            <Link to="/farmer/crops" className="text-xs font-semibold text-[#1b5e20] hover:underline self-start sm:self-auto">
              Manage All Crops →
            </Link>
          </div>

          <div className="p-4 space-y-4">
            {crops.slice(0, 4).map(crop => (
              <div key={crop.crop_id} className="p-3 border border-[#dbe3d8] bg-[#fcfdfc]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="font-bold text-xs text-[#14291a]">{crop.crop_name}</span>
                    <span className="text-[11px] text-[#5e7362] ml-2">Variety: {crop.variety} ({crop.season} season)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={crop.status} />
                    <span className="text-xs font-semibold text-[#1b5e20] tabular-nums">
                      Health: {crop.health_score}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 text-xs text-[#526655] pt-2 border-t border-[#edf2ea]">
                  <div>
                    <span className="text-[10px] text-[#718774] block uppercase">Sown On</span>
                    <span className="tabular-nums font-medium text-[#1c2e22]">{crop.planting_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#718774] block uppercase">Est. Harvest Window</span>
                    <span className="tabular-nums font-medium text-[#1c2e22]">{crop.expected_harvest}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#718774] block uppercase">Target Yield</span>
                    <span className="tabular-nums font-bold text-[#14291a]">{crop.expected_yield} MT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Weather Telemetry */}
        <div className="lg:col-span-4 bg-white border border-[#dbe3d8] flex flex-col justify-between">
          <div className="p-4 border-b border-[#e2e8df] bg-[#fafbfa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WeatherIcon size={18} className="text-[#1b5e20]" />
              <h2 className="text-xs font-bold font-display uppercase tracking-wider text-[#14291a]">
                Micro-Climate Telemetry
              </h2>
            </div>
            <Link to="/farmer/weather" className="text-[11px] font-semibold text-[#1b5e20] hover:underline">
              Advisories →
            </Link>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold font-display text-[#14291a] tabular-nums">
                  {latestWeather.temperature}°C
                </span>
                <span className="text-xs font-semibold text-[#48634c] block mt-0.5">
                  {latestWeather.condition_desc}
                </span>
              </div>
              <div className="text-right text-xs space-y-0.5">
                <p className="text-[#59705c]">Humidity: <strong className="text-[#14291a] tabular-nums">{latestWeather.humidity}%</strong></p>
                <p className="text-[#59705c]">Wind: <strong className="text-[#14291a] tabular-nums">{latestWeather.wind_speed} km/h</strong></p>
                <p className="text-[#59705c]">Rainfall: <strong className="text-[#14291a] tabular-nums">{latestWeather.rainfall} mm</strong></p>
              </div>
            </div>

            <div className="p-3 bg-[#f2f7f1] border border-[#d2e3d0] text-xs space-y-1">
              <span className="font-bold text-[#14291a] block">Agronomic Advisory:</span>
              <p className="text-[#405743] leading-relaxed">
                {latestWeather.forecast_advisory}
              </p>
            </div>

            {/* Soil Health Snapshot */}
            <div className="pt-2 border-t border-[#edf1ea] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#14291a]">Soil Test Baseline (Nashik Basin)</span>
                <StatusBadge status={soil[0]?.fertility_status || 'High'} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 bg-[#fafbfa] border border-[#edf1ea]">
                <div>
                  <span className="text-[10px] text-[#6b7e6e] block">pH Level</span>
                  <strong className="text-[#14291a] tabular-nums">{soil[0]?.ph_level || 6.8}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#6b7e6e] block">NPK Index</span>
                  <strong className="text-[#14291a] tabular-nums">280:45:220</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#6b7e6e] block">Moisture</span>
                  <strong className="text-[#14291a] tabular-nums">{soil[0]?.moisture || 24}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THIRD ROW: RECENT ORDERS RECEIVED & INVENTORY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Received */}
        <div className="lg:col-span-7 bg-white border border-[#dbe3d8]">
          <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Produce Orders Awaiting Dispatch
              </h2>
              <p className="text-[11px] text-[#617764]">Wholesale orders booked directly through EarthRakshak exchange</p>
            </div>
            <Link to="/farmer/orders" className="text-xs font-semibold text-[#1b5e20] hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="p-4 divide-y divide-[#edf1ea]">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.order_id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#14291a]">{order.order_id}</span>
                      <span className="text-[11px] text-[#6e8571] tabular-nums">{order.order_date}</span>
                    </div>
                    <p className="text-xs text-[#2c402f] mt-0.5">
                      {order.items.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                    </p>
                    <span className="text-[11px] text-[#556958] block">Buyer: {order.buyer_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#14291a] tabular-nums block">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                    <StatusBadge status={order.order_status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6e8571] py-4 text-center">No active orders pending dispatch.</p>
            )}
          </div>
        </div>

        {/* Input Supplies & Fertilizer Refill Status */}
        <div className="lg:col-span-5 bg-white border border-[#dbe3d8]">
          <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Farm Inventory Status
              </h2>
              <p className="text-[11px] text-[#617764]">Seeds, bio-fertilizers, and drip lines in storage</p>
            </div>
            <Link to="/farmer/inventory" className="text-xs font-semibold text-[#1b5e20] hover:underline">
              Inventory →
            </Link>
          </div>

          <div className="p-4 space-y-2.5">
            {inventory.slice(0, 4).map(item => (
              <div key={item.item_id} className="p-2.5 bg-[#fbfcfb] border border-[#e4ebe1] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14291a] block">{item.item_name}</span>
                  <span className="text-[11px] text-[#687d6b]">{item.category} · {item.supplier}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold tabular-nums text-[#14291a] block">
                    {item.quantity} {item.unit}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
