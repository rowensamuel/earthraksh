import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import { orderService } from '../../services/orderService';
import { dataService } from '../../services/dataService';
import { MarketplaceProduct, Order } from '../../types';
import {
  MarketplaceIcon,
  CartIcon,
  OrdersIcon,
  TrackingIcon
} from '../../components/common/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { homeHeroImage, getProduceImage } from '../../assets/assetRegistry';

export const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [prods, ords] = await Promise.all([
        marketplaceService.getProducts(),
        orderService.getOrders(currentUser?.user_id)
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.warn('Buyer dashboard data fetch:', err);
    }
  };

  const cart = dataService.getCart();
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price_per_unit * item.quantity, 0);
  const totalSpent = orders.reduce((acc, o) => acc + o.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Editorial Agricultural Hero Banner */}
      <div className="relative bg-[#0f2416] text-white p-6 md:p-8 border border-[#1b3d26] overflow-hidden">
        <div className="absolute inset-0 opacity-20 z-0">
          <img
            src={homeHeroImage}
            alt="Produce harvest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2416] via-[#0f2416]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7dc489] block mb-1">
            Wholesale Procurement Terminal
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-2">
            Direct Farm-to-Fork Sourcing
          </h1>
          <p className="text-xs text-[#c4dec9] leading-relaxed mb-4">
            Procure certified organic grains, export-quality mangoes, and high-protein durum wheat straight from accredited regional agricultural producers with guaranteed provenance.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/buyer/marketplace"
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors inline-flex items-center gap-1.5"
            >
              <MarketplaceIcon size={14} />
              <span>Browse Fresh Produce</span>
            </Link>
            <Link
              to="/buyer/cart"
              className="px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors inline-flex items-center gap-1.5"
            >
              <CartIcon size={14} />
              <span>Review Cart ({cart.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Market Offerings"
          value={products.length}
          unit="Active Lots"
          subtext="Certified farm origin"
          icon={<MarketplaceIcon size={18} />}
        />
        <StatCard
          label="Active Cart Size"
          value={cart.length}
          unit="Produce Items"
          subtext={`Subtotal ₹${cartTotal.toLocaleString('en-IN')}`}
          icon={<CartIcon size={18} />}
        />
        <StatCard
          label="Orders In Transit"
          value={orders.filter(o => o.order_status === 'Shipped').length}
          unit="Consignments"
          subtext="Live freight tracking"
          icon={<TrackingIcon size={18} />}
        />
        <StatCard
          label="Total Procurement"
          value={`₹${(totalSpent / 1000).toFixed(1)}k`}
          unit="INR"
          subtext="Direct settled volume"
          icon={<OrdersIcon size={18} />}
        />
      </div>

      {/* FEATURED PRODUCE CAROUSEL / GRID */}
      <div className="bg-white border border-[#dbe3d8] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8df] mb-4">
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
              Featured Certified Farm Produce
            </h2>
            <p className="text-[11px] text-[#617764]">Direct lots harvested and ready for dispatch in Nashik and Punjab</p>
          </div>
          <Link to="/buyer/marketplace" className="text-xs font-semibold text-[#1b5e20] hover:underline self-start sm:self-auto">
            All Marketplace Items →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.slice(0, 3).map(p => (
            <div
              key={p.product_id}
              onClick={() => navigate(`/buyer/product/${p.product_id}`)}
              className="border border-[#dbe3d8] bg-[#fafbfa] hover:border-[#1b5e20] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={p.image_url && !p.image_url.includes('1790771887999') ? p.image_url : getProduceImage(p.product_name || p.category)}
                    alt={p.product_name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#0f2416]/80 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {p.category}
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold font-display text-[#14291a] leading-snug">
                    {p.product_name}
                  </h3>
                  <p className="text-[11px] text-[#5e7362]">
                    Producer: <strong>{p.seller_name}</strong> · {p.seller_location}
                  </p>
                </div>
              </div>

              <div className="p-3 border-t border-[#edf1ea] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14291a] tabular-nums">
                    ₹{p.price_per_unit.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#6b7e6e]"> / {p.unit}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#1b5e20]">
                  View Lot Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ORDERS & SHIPMENT TRACKING SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#dbe3d8]">
          <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
                Recent Procurement Orders
              </h2>
              <p className="text-[11px] text-[#617764]">Wholesale consignments confirmed through EarthRakshak escrow</p>
            </div>
            <Link to="/buyer/orders" className="text-xs font-semibold text-[#1b5e20] hover:underline">
              View Order History →
            </Link>
          </div>

          <div className="p-4 divide-y divide-[#edf1ea]">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.order_id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#14291a]">{order.order_id}</span>
                      <span className="text-[11px] text-[#6b7e6e] tabular-nums">{order.order_date}</span>
                    </div>
                    <p className="text-[#3b523e] mt-0.5">
                      {order.items.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#14291a] block">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                    <StatusBadge status={order.order_status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6e8571] py-4 text-center">No recent purchases recorded.</p>
            )}
          </div>
        </div>

        {/* Live Transit Tracking Widget */}
        <div className="lg:col-span-4 bg-white border border-[#dbe3d8] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#e2e8df] mb-3">
              <TrackingIcon size={18} className="text-[#1b5e20]" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#14291a]">
                Live Consignment In Transit
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f5f8f3] border border-[#d2e0cf]">
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Tracking Docket</span>
                <strong className="font-mono text-xs text-[#14291a]">EK-AGRI-882194</strong>
                <p className="text-[11px] text-[#4d6350] mt-1">20 Quintal Basmati 1121 from Nashik Hub</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1b5e20]" />
                  <span className="font-semibold text-[#14291a]">Dispatched from Farm Gate</span>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l-2 border-[#1b5e20] text-[#556958]">
                  <span>APMC Quality Inspection Cleared</span>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l-2 border-[#dbe3d8] text-[#718774]">
                  <span>En-Route to Vashi Logistics Yard</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/buyer/tracking"
            className="w-full mt-4 py-2 text-center text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
          >
            Open Live GPS Tracking
          </Link>
        </div>
      </div>
    </div>
  );
};
