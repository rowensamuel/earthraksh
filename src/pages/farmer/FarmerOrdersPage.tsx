import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { EyeIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const FarmerOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders(undefined, currentUser?.user_id);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load farmer orders from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load orders.');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['order_status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadOrders();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: status } : null);
      }
      showToast('Fulfillment Updated in Database', 'success', `Order ${orderId} marked as ${status}.`);
    } catch (err: any) {
      console.error('Failed to update order status in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Wholesale Orders & Dispatch"
        title="Direct Produce Orders & Fulfillment"
        description="Manage wholesale purchase contracts booked by certified buyers, update consignment dispatch milestones, and verify digital payment settlements."
      />

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.order_id} className="bg-white border border-[#dbe3d8] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#edf1ea] gap-2 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf] mr-2">
                  {order.order_id}
                </span>
                <span className="text-xs font-semibold text-[#14291a]">Buyer: {order.buyer_name}</span>
                <span className="text-xs text-[#6b7e6e] ml-2 tabular-nums">Booked: {order.order_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.order_status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#617764] block">Booked Consignment Produce</span>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.order_item_id} className="flex justify-between text-xs p-2 bg-[#fafbfa] border border-[#edf1ea]">
                      <span className="font-semibold text-[#14291a]">{item.product_name}</span>
                      <span className="tabular-nums text-[#334a36]">
                        {item.quantity} {item.unit} @ ₹{item.unit_price}/{item.unit} = <strong className="text-[#14291a]">₹{item.subtotal.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#526655] pt-1">
                  <span className="font-semibold text-[#14291a]">Delivery Destination: </span>
                  <span>{order.shipping_address}</span>
                </div>
              </div>

              <div className="md:col-span-4 p-3 bg-[#f8faf7] border border-[#dbe3d8] flex flex-col justify-between text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#637966]">Total Value</span>
                    <strong className="text-base text-[#1b5e20] tabular-nums font-display">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#637966]">Payment Method</span>
                    <span className="font-semibold text-[#14291a]">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#637966]">Payment Status</span>
                    <span className="font-bold text-[#1b5e20]">{order.payment_status}</span>
                  </div>
                  {order.tracking_number && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#637966]">Docket / Transit ID</span>
                      <span className="font-mono text-[#14291a]">{order.tracking_number}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#edf1ea] flex items-center justify-end gap-1.5">
                  {order.order_status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Confirmed')}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719]"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.order_status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Shipped')}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719]"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.order_status === 'Shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Delivered')}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719]"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.order_status !== 'Delivered' && order.order_status !== 'Cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Cancelled')}
                      className="px-2 py-1 text-xs font-semibold text-[#991b1b] hover:bg-[#fef2f2]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
