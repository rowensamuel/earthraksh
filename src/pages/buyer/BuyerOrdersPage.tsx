import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { TrackingIcon } from '../../components/common/Icons';
import { Link } from 'react-router-dom';

export const BuyerOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders(currentUser?.user_id);
      setOrders(data);
    } catch (err) {
      console.warn('Buyer orders load error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Commercial Purchase Ledger"
        title="My Produce Orders & Consignments"
        description="Track all wholesale consignments, payment receipts, carrier dispatches, and delivery status progression across regional agricultural clusters."
      />

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.order_id} className="bg-white border border-[#dbe3d8] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#edf1ea] gap-2 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf] mr-2">
                  {order.order_id}
                </span>
                <span className="text-xs font-semibold text-[#14291a] tabular-nums">
                  Booked Date: {order.order_date}
                </span>
                {order.tracking_number && (
                  <span className="text-xs text-[#5e7362] ml-2">
                    · Freight Docket: <strong className="font-mono text-[#14291a]">{order.tracking_number}</strong>
                  </span>
                )}
              </div>
              <StatusBadge status={order.order_status} size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#617764] block">Consignment Items</span>
                <div className="space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.order_item_id} className="flex justify-between items-center text-xs p-2.5 bg-[#fbfcfb] border border-[#edf1ea]">
                      <div>
                        <span className="font-semibold text-[#14291a] block">{item.product_name}</span>
                        <span className="text-[11px] text-[#637966]">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold tabular-nums text-[#14291a]">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-[11px] text-[#637966] block">
                          ₹{item.unit_price}/{item.unit} = ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#4e6351] pt-2">
                  <span className="font-semibold text-[#14291a]">Destination: </span>
                  <span>{order.shipping_address}</span>
                </div>
              </div>

              <div className="md:col-span-4 p-4 bg-[#f8faf7] border border-[#dbe3d8] flex flex-col justify-between text-xs space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#607563]">Total Paid</span>
                    <strong className="text-base text-[#1b5e20] tabular-nums font-display">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#607563]">Settlement Method</span>
                    <span className="font-semibold text-[#14291a]">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#607563]">Payment Clearance</span>
                    <span className="font-bold text-[#1b5e20]">{order.payment_status}</span>
                  </div>
                  {order.estimated_delivery && (
                    <div className="flex justify-between">
                      <span className="text-[#607563]">Est. Gate Arrival</span>
                      <span className="tabular-nums font-semibold text-[#14291a]">{order.estimated_delivery}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/buyer/tracking?orderId=${order.order_id}&tracking=${order.tracking_number || ''}`}
                  className="w-full py-2 text-center text-xs font-semibold border border-[#1b5e20] text-[#1b5e20] hover:bg-[#eef4ec] transition-colors flex items-center justify-center gap-1.5"
                >
                  <TrackingIcon size={14} />
                  <span>Track Freight Movement</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
