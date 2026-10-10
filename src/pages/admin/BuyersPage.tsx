import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { User, Order } from '../../types';
import { EyeIcon } from '../../components/common/Icons';

export const BuyersPage: React.FC = () => {
  const [buyers, setBuyers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [b, o] = await Promise.all([
        adminService.getBuyers(),
        orderService.getOrders()
      ]);
      setBuyers(b);
      setOrders(o);
    } catch (err) {
      console.warn('Admin buyers data fetch:', err);
    }
  };

  const getBuyerOrders = (userId: string) => orders.filter(o => o.buyer_id === userId);

  const columns: Column<User>[] = [
    {
      header: 'Buyer ID',
      accessorKey: 'user_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.user_id}</span>
    },
    {
      header: 'Buyer Enterprise & Contact',
      accessorKey: 'full_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.full_name}</span>
          <span className="text-[11px] text-[#5e7362]">{row.designation}</span>
        </div>
      )
    },
    {
      header: 'Hub / Delivery Address',
      accessorKey: 'address',
      cell: row => <span className="text-xs text-[#2d4231]">{row.address}</span>
    },
    {
      header: 'Orders Placed',
      cell: row => {
        const count = getBuyerOrders(row.user_id).length;
        return <span className="tabular-nums font-semibold text-[#14291a]">{count} Orders</span>;
      }
    },
    {
      header: 'Cumulative Procurement',
      cell: row => {
        const total = getBuyerOrders(row.user_id).reduce((a, o) => a + o.total_amount, 0);
        return <span className="tabular-nums font-bold text-[#1b5e20]">₹{total.toLocaleString('en-IN')}</span>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Audit',
      align: 'right',
      cell: row => (
        <button
          onClick={() => setSelectedBuyer(row)}
          className="px-2.5 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#1b5e20] inline-flex items-center gap-1"
        >
          <EyeIcon size={14} />
          <span>Audit</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Commercial Accounts & Distribution"
        title="Wholesale Buyers & Institutional Procurement"
        description="Verify food processors, export trading agencies, retail chains, and wholesale APMC merchants procuring directly from registered agricultural producers."
      />

      <DataTable
        columns={columns}
        data={buyers}
        searchPlaceholder="Search buyers by organization name or ID..."
        rowsPerPage={10}
      />

      {/* INSPECT BUYER MODAL */}
      <Modal
        isOpen={!!selectedBuyer}
        onClose={() => setSelectedBuyer(null)}
        title="Commercial Buyer Account Dossier"
        subtitle={selectedBuyer ? `${selectedBuyer.full_name} · ${selectedBuyer.user_id}` : ''}
        maxWidth="2xl"
      >
        {selectedBuyer && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#fafbfa] border border-[#e2e8df]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Phone Contact</span>
                <span className="text-xs font-semibold tabular-nums text-[#1c2e22]">{selectedBuyer.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Email Dispatch</span>
                <span className="text-xs text-[#1c2e22]">{selectedBuyer.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Account Status</span>
                <StatusBadge status={selectedBuyer.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14291a] mb-2">
                Order History & Procurement Ledger
              </h4>
              <div className="space-y-2">
                {getBuyerOrders(selectedBuyer.user_id).length > 0 ? (
                  getBuyerOrders(selectedBuyer.user_id).map(o => (
                    <div key={o.order_id} className="p-3 border border-[#dbe3d8] bg-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#14291a]">{o.order_id}</span>
                          <span className="text-[11px] text-[#6b7e6e] tabular-nums">{o.order_date}</span>
                        </div>
                        <p className="text-[11px] text-[#4d6351] mt-0.5">
                          {o.items.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold tabular-nums text-[#14291a]">
                          ₹{o.total_amount.toLocaleString('en-IN')}
                        </span>
                        <div className="mt-0.5">
                          <StatusBadge status={o.order_status} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#6e8571] py-4 text-center">No orders registered yet for this buyer account.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
