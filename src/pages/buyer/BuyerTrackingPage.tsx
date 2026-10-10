import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { TrackingIcon, CheckIcon, ShieldIcon } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

interface TransitMilestone {
  id: number;
  hourOffset: number; // in hours from order confirmation (0 to 24)
  stageName: string;
  title: string;
  location: string;
  operator: string;
  details: string;
  telemetryCheckpoint: string;
}

const TWENTY_FOUR_HOUR_MILESTONES: TransitMilestone[] = [
  {
    id: 1,
    hourOffset: 0.0,
    stageName: 'Escrow Booking',
    title: 'Order Confirmed & Escrow Funded',
    location: 'EarthRakshak Smart Contract Hub · Farm Gate Booking',
    operator: 'Platform Escrow Settlement Engine',
    details: 'Commercial buyer payment securely locked in platform escrow. Automated digital harvest release manifest generated and seller notified.',
    telemetryCheckpoint: 'Escrow ID: ESC-98214 · Escrow Funded & Verified'
  },
  {
    id: 2,
    hourOffset: 3.5,
    stageName: 'Farm Gate QC',
    title: 'Lot Quality Inspected & Hermetically Bagged',
    location: 'Green Valley Basin Depot, Dindori, Nashik',
    operator: 'Certified Agronomist & Field QC (Sunil Patil)',
    details: 'Moisture content tested at 12.2% (under 14% max threshold). Optical grading certified Grade-A export standard with tamper-proof QR tags.',
    telemetryCheckpoint: 'Moisture: 12.2% · Optical Purity: 99.4%'
  },
  {
    id: 3,
    hourOffset: 7.0,
    stageName: 'Fleet Dispatch',
    title: 'Loaded on Cold-Chain Reefer Freight Carrier',
    location: 'Agri Logistics Reefer Bay 2, Nashik Terminal',
    operator: 'Fleet Carrier Driver: Ramesh Shinde (Reg: MH-15-EG-8841)',
    details: 'Cargo securely loaded in sanitized reefer unit pre-chilled to 18.0°C. Digital E-Way Bill #EW-2026-98124 validated. FASTag initialized.',
    telemetryCheckpoint: 'Pre-Cool: 18.0°C · E-Way Bill Active'
  },
  {
    id: 4,
    hourOffset: 13.5,
    stageName: 'Mid-Route Transit',
    title: 'Highway Toll Transit & Regional Weighbridge Clearance',
    location: 'Igatpuri Ghat Toll Plaza & NHAI Static Weighbridge',
    operator: 'NHAI Weighbridge Hub 04 · Fleet Telematics',
    details: 'Gross vehicle axle weight verified at 16.2 MT. Automated FASTag electronic toll clearance logged. GPS transponder ping normal.',
    telemetryCheckpoint: 'Axle Load: 16.2 MT · Toll FASTag Cleared'
  },
  {
    id: 5,
    hourOffset: 19.0,
    stageName: 'Perimeter Check',
    title: 'Metropolitan Ring Road & Cold-Chain Telemetry Verification',
    location: 'Thane-Belapur Transit Corridor (Gate 2 Checkpoint)',
    operator: 'Regional Logistics Inspector (APMC Unit 02)',
    details: 'Continuous IoT temperature data logger audited without thermal excursions (18.2°C). Terminal arrival slot reserved at APMC Bay 12.',
    telemetryCheckpoint: 'Sensor IOT-TEMP-091: 18.2°C Stable'
  },
  {
    id: 6,
    hourOffset: 24.0,
    stageName: 'Terminal Handover',
    title: 'APMC Logistics Terminal Arrival & Dock Unloading',
    location: 'Vashi Central Logistics Hub Sector 4, Bay 12',
    operator: 'Terminal Dock Master (P. Deshmukh)',
    details: 'Physical tamper-evident seal verified. Automated dock unloader clearance complete. Consignment handover signed & escrow released.',
    telemetryCheckpoint: 'Terminal Bay 12 · Handover Complete'
  }
];

export const BuyerTrackingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const trackingParam = searchParams.get('tracking');

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Live real-time clock tick (every second)
  const [currentTick, setCurrentTick] = useState(0);

  useEffect(() => {
    loadBuyerOrders();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadBuyerOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders(currentUser?.user_id);
      setOrders(data);

      if (data.length > 0) {
        if (orderIdParam) {
          const match = data.find(o => o.order_id === orderIdParam || o.tracking_number === trackingParam);
          if (match) {
            setSelectedOrderId(match.order_id);
          } else {
            setSelectedOrderId(data[0].order_id);
          }
        } else if (trackingParam) {
          const match = data.find(o => o.tracking_number === trackingParam);
          setSelectedOrderId(match ? match.order_id : data[0].order_id);
        } else {
          setSelectedOrderId(data[0].order_id);
        }
      }
    } catch (err) {
      console.warn('Failed to load orders for live tracking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.order_id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Determine the confirmation/booking time of the order
  // When an order is confirmed, tracking starts right from Order Confirmed & Escrow Funded
  const orderConfirmationTime = useMemo(() => {
    if (selectedOrder) {
      const rawDate = selectedOrder.created_at || selectedOrder.order_date;
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
    // If no order or sample active consignment, default to current session's start time
    return new Date();
  }, [selectedOrder]);

  // Calculate real elapsed hours in the 24-hour cycle from the confirmation time
  const currentCycleHour = useMemo(() => {
    // If order is explicitly delivered, complete the 24h cycle
    if (selectedOrder?.order_status === 'Delivered') {
      return 24.0;
    }

    const now = new Date();
    const diffMs = now.getTime() - orderConfirmationTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // If order was just placed/confirmed recently (diffHours < 0 or very small):
    // It starts squarely at 0.0h (Order Confirmed & Escrow Funded)
    if (diffHours <= 0) {
      return 0.05; // Freshly confirmed, active on Milestone 1
    }

    // If marked 'Shipped' but less than 7 hours elapsed, fast forward to shipping stage (7h)
    if (selectedOrder?.order_status === 'Shipped' && diffHours < 7.0) {
      return 7.5;
    }

    // For orders confirmed within 24 hours, use exact real-time progression
    if (diffHours <= 24.0) {
      return diffHours;
    }

    // For older demo orders, cycle naturally within active transit
    return Math.min(24, (diffHours % 24));
  }, [selectedOrder, orderConfirmationTime, currentTick]);

  // Progress percentage across the 24-hour cycle
  const progressPercent = Math.min(100, Math.max(0, (currentCycleHour / 24) * 100));

  // Remaining time in the 24-hour cycle
  const remainingHoursTotal = Math.max(0, 24 - currentCycleHour);
  const remainingHours = Math.floor(remainingHoursTotal);
  const remainingMinutes = Math.floor((remainingHoursTotal - remainingHours) * 60);
  const remainingSeconds = Math.floor((((remainingHoursTotal - remainingHours) * 60) - remainingMinutes) * 60);

  // Time elapsed in the 24-hour cycle
  const elapsedHours = Math.floor(currentCycleHour);
  const elapsedMinutes = Math.floor((currentCycleHour - elapsedHours) * 60);
  const elapsedSeconds = Math.floor((((currentCycleHour - elapsedHours) * 60) - elapsedMinutes) * 60);

  // Realistic live telemetry calculations
  const vehicleSpeed = useMemo(() => {
    if (currentCycleHour < 7.0 || currentCycleHour >= 24.0) return 0;
    // Speed fluctuates realistically between 58 and 64 km/h when in transit
    return Math.round(61 + Math.sin(currentTick * 0.5) * 3);
  }, [currentCycleHour, currentTick]);

  const coldChainTemp = useMemo(() => {
    // Reefer temperature fluctuates around 18.2°C
    const base = 18.2;
    const variance = Math.sin(currentTick * 0.3) * 0.2;
    return (base + variance).toFixed(1);
  }, [currentTick]);

  const remainingDistanceKm = useMemo(() => {
    const totalKm = 185;
    if (currentCycleHour <= 7.0) return totalKm;
    if (currentCycleHour >= 24.0) return 0;
    const transitProgress = (currentCycleHour - 7.0) / (24.0 - 7.0);
    return Math.max(0, Math.round(totalKm * (1 - transitProgress)));
  }, [currentCycleHour]);

  // Format timestamps dynamically along the 24h milestone timeline
  const formatMilestoneTime = (offsetHours: number) => {
    const d = new Date(orderConfirmationTime.getTime() + offsetHours * 3600 * 1000);
    const dayName = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dayName} · ${timeStr} IST`;
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find(o => o.order_id === orderId);
    setSearchParams({
      orderId,
      tracking: ord?.tracking_number || ''
    });
  };

  // Find active milestone index
  const activeMilestoneIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < TWENTY_FOUR_HOUR_MILESTONES.length; i++) {
      if (currentCycleHour >= TWENTY_FOUR_HOUR_MILESTONES[i].hourOffset) {
        index = i;
      }
    }
    return index;
  }, [currentCycleHour]);

  return (
    <div className="space-y-6">
      <PageHeader
        category="Freight Logistics & Supply Chain"
        title="Live Consignment Transit Milestones"
        description="Real-time 24-hour supply chain monitoring starting from Order Confirmation & Escrow Funding to APMC Terminal Handover."
      />

      {/* Real-Time Live Status Banner */}
      <div className="bg-[#14331e] text-white p-5 border border-[#235231] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7dc489] block mb-1">
              Live Consignment Stream
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {orders.length > 0 ? (
                <select
                  value={selectedOrderId}
                  onChange={e => handleSelectOrder(e.target.value)}
                  className="bg-[#0e2416] border border-[#2e633d] text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#7dc489] font-mono cursor-pointer"
                >
                  {orders.map(o => (
                    <option key={o.order_id} value={o.order_id}>
                      {o.tracking_number || o.order_id} — ₹{o.total_amount.toLocaleString('en-IN')} ({o.items[0]?.product_name || 'Produce'})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-mono text-sm font-bold bg-[#0e2416] px-3 py-1 border border-[#2e633d] text-[#7dc489]">
                  EK-AGRI-882194 (Live Active Consignment)
                </span>
              )}

              <span className="flex items-center gap-1.5 bg-[#0e2416] border border-[#2e633d] px-2.5 py-1 text-[11px] text-[#b8d9be]">
                <span className="w-2 h-2 rounded-full bg-[#3ed453] animate-ping" />
                <span>24-Hour Cycle Active</span>
              </span>

              <span className="flex items-center gap-1 bg-[#1b5e20] border border-[#3ed453] px-2.5 py-1 text-[11px] font-semibold text-white">
                <ShieldIcon size={12} className="text-[#3ed453]" />
                <span>Escrow Funded & Verified</span>
              </span>
            </div>
          </div>

          {/* Current Live Countdown & Time Elapsed */}
          <div className="flex flex-wrap items-center gap-4 bg-[#0e2416]/80 p-3 border border-[#245231]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7dc489] block">Terminal ETA Countdown</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums tracking-wide">
                {currentCycleHour >= 24 ? (
                  <span className="text-[#3ed453]">CONSIGNMENT DELIVERED</span>
                ) : (
                  <span>
                    {String(remainingHours).padStart(2, '0')}h {String(remainingMinutes).padStart(2, '0')}m {String(remainingSeconds).padStart(2, '0')}s
                  </span>
                )}
              </span>
            </div>
            <div className="border-l border-[#2e633d] pl-4">
              <span className="text-[10px] uppercase font-bold text-[#8eb895] block">Time Elapsed</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#b8d9be] tabular-nums">
                {String(elapsedHours).padStart(2, '0')}h {String(elapsedMinutes).padStart(2, '0')}m {String(elapsedSeconds).padStart(2, '0')}s ({progressPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Consignment Overview Banner */}
      <div className="bg-white border border-[#dbe3d8] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#edf1ea] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrackingIcon size={22} className="text-[#1b5e20]" />
              <span className="font-mono text-lg font-bold text-[#14291a]">
                {selectedOrder?.tracking_number || 'EK-AGRI-882194'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#eef4ec] border border-[#86efac] text-[#1b5e20]">
                {currentCycleHour >= 24
                  ? 'Handover Completed'
                  : currentCycleHour < 7.0
                  ? 'Farm-Gate Quality & Packing Phase'
                  : 'Refrigerated Transit Active'}
              </span>
            </div>
            <p className="text-xs text-[#596e5c]">
              {selectedOrder?.items[0]
                ? `${selectedOrder.items[0].quantity} ${selectedOrder.items[0].unit} ${selectedOrder.items[0].product_name}`
                : '20 Quintal Heritage Basmati 1121'}{' '}
              · Dispatched from Green Valley Basin (Nashik)
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">
              Estimated Terminal Arrival
            </span>
            <span className="text-base font-bold font-display text-[#1b5e20] tabular-nums">
              {formatMilestoneTime(24.0)}
            </span>
          </div>
        </div>

        {/* 24-Hour Cycle Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold text-[#14291a] uppercase text-[11px] tracking-wider">
              24-Hour Cycle Progression
            </span>
            <span className="font-mono font-bold text-[#1b5e20] tabular-nums text-xs">
              {progressPercent.toFixed(1)}% Completed
            </span>
          </div>
          <div className="w-full h-3 bg-[#e8eee6] overflow-hidden border border-[#c9d4c6]">
            <div
              className="h-full bg-gradient-to-r from-[#2e7d32] via-[#1b5e20] to-[#3ed453] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6b7e6e] mt-1 font-mono">
            <span>Hour 00:00 (Order Confirmed & Escrow Funded)</span>
            <span>Hour 12:00 (Highway Transit)</span>
            <span>Hour 24:00 (APMC Terminal Arrival)</span>
          </div>
        </div>

        {/* Real-Time Cold-Chain IoT Sensor Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-[#f8faf7] border border-[#dbe3d8] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">Carrier Vehicle</span>
            <span className="font-semibold text-[#14291a] block">Tata LPT 1613 (Reefer Truck)</span>
            <span className="text-[11px] text-[#6b7e6e] font-mono">Reg: MH-15-EG-8841</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">Cold-Chain Temperature</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#1b5e20] text-sm tabular-nums">
                {coldChainTemp}°C
              </span>
              <span className="text-[10px] font-semibold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.2 border border-[#a5d6a7]">
                Optimal
              </span>
            </div>
            <span className="text-[11px] text-[#6b7e6e] font-mono block">Tag: IOT-TEMP-091 · 4G Active</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">Fleet Speed & Distance</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#14291a] text-sm tabular-nums">
                {vehicleSpeed} km/h
              </span>
              <span className="text-[11px] text-[#6b7e6e]">
                · {remainingDistanceKm} km left
              </span>
            </div>
            <span className="text-[11px] text-[#6b7e6e] font-mono block">GPS Lat 19.9975, Lng 73.7898</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">Driver & Dispatch Ops</span>
            <span className="font-semibold text-[#14291a] block">Ramesh Shinde</span>
            <a
              href="tel:+919765011928"
              className="text-[11px] text-[#1b5e20] hover:underline font-mono inline-block font-semibold"
            >
              +91 97650 11928 (Call Driver)
            </a>
          </div>
        </div>

        {/* 24-Hour Cycle Transit Milestones Timeline */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-[#edf1ea] gap-2">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Consignment Transit Milestones (24-Hour Cycle)
              </h3>
              <p className="text-xs text-[#5f7562]">
                Real-time tracking initiating at Order Confirmation & Escrow Funding and progressing across regional logistics checkpoints.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-[#607563]">Current Stage:</span>
              <span className="font-bold text-[#1b5e20] px-2.5 py-0.5 bg-[#eef4ec] border border-[#a3c4a8]">
                {TWENTY_FOUR_HOUR_MILESTONES[activeMilestoneIndex].stageName}
              </span>
            </div>
          </div>

          <div className="relative pl-7 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c9d4c6]">
            {TWENTY_FOUR_HOUR_MILESTONES.map((step, idx) => {
              const isPassed = currentCycleHour >= step.hourOffset;
              const isCurrent = activeMilestoneIndex === idx && currentCycleHour < 24.0;

              return (
                <div key={step.id} className="relative group">
                  {/* Timeline Badge Indicator */}
                  <span
                    className={`absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      isPassed && !isCurrent
                        ? 'bg-[#1b5e20] text-white border-2 border-[#1b5e20]'
                        : isCurrent
                        ? 'bg-[#3ed453] text-[#0e2416] border-2 border-[#1b5e20] ring-4 ring-[#86efac]/50'
                        : 'bg-white border-2 border-[#a3b8a1] text-[#718774]'
                    }`}
                  >
                    {isPassed && !isCurrent ? (
                      '✓'
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#0e2416] animate-ping" />
                    ) : (
                      step.id
                    )}
                  </span>

                  {/* Milestone Card */}
                  <div
                    className={`p-4 border transition-all ${
                      isCurrent
                        ? 'bg-[#f0fdf4] border-[#86efac] shadow-sm'
                        : isPassed
                        ? 'bg-white border-[#dbe3d8]'
                        : 'bg-[#fafbfa] border-[#e8ece7] opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#edf2ea] text-[#2e5234]">
                          Hour {step.hourOffset.toFixed(1)}
                        </span>
                        <h4
                          className={`font-bold text-xs sm:text-sm ${
                            isCurrent
                              ? 'text-[#144719]'
                              : isPassed
                              ? 'text-[#14291a]'
                              : 'text-[#6b7e6e]'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#1b5e20] text-white px-2 py-0.5 animate-pulse">
                            Active Now
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono font-semibold text-[#5c7360] tabular-nums">
                        {formatMilestoneTime(step.hourOffset)}
                      </span>
                    </div>

                    <div className="text-xs text-[#4d6150] space-y-1 mt-1">
                      <div className="flex flex-wrap items-center gap-x-4 text-[11px]">
                        <span>
                          <strong>Location:</strong> {step.location}
                        </span>
                        <span>
                          <strong>Operator:</strong> {step.operator}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#556957] leading-relaxed pt-1">
                        {step.details}
                      </p>
                    </div>

                    {/* Sensor Telemetry Checkpoint Strip */}
                    <div className="mt-2.5 pt-2 border-t border-[#e2eae0] flex flex-wrap items-center justify-between text-[10px] text-[#48634c]">
                      <span className="font-mono bg-[#eef4ec] px-2 py-0.5 border border-[#d0e0cd]">
                        {step.telemetryCheckpoint}
                      </span>
                      <span className="font-semibold text-[#25632b]">
                        {isPassed && !isCurrent ? (
                          'Milestone Reached & Verified'
                        ) : isCurrent ? (
                          'Active Telemetry Transmission in Progress...'
                        ) : (
                          'Scheduled Milestone'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination & Consignment Release Proof Footer */}
        <div className="p-4 bg-[#f4f7f3] border border-[#dbe3d8] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#627a66] block">
              Consignment Destination Hub
            </span>
            <p className="font-semibold text-[#14291a]">
              {selectedOrder?.shipping_address || 'APMC Central Terminal Sector 4, Vashi Logistics Hub, Navi Mumbai'}
            </p>
            <span className="text-[11px] text-[#5f7362]">
              Consignment Value: ₹{(selectedOrder?.total_amount || 72000).toLocaleString('en-IN')} (Escrow Secured)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/buyer/orders"
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#a3c4a8] bg-white text-[#2e5234] hover:bg-[#edf4ee] transition-colors"
            >
              Back to Orders Ledger
            </Link>
            <Link
              to="/buyer/marketplace"
              className="px-4 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
            >
              Source More Produce
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
