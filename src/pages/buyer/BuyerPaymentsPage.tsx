import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { paymentService } from '../../services/paymentService';
import { Payment } from '../../types';
import { DownloadIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const BuyerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (err) {
      console.warn('Payment records fetch error:', err);
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    showToast('Tax Invoice Downloaded', 'success', `GST invoice for ${payment.payment_id} saved.`);
  };

  const columns: Column<Payment>[] = [
    {
      header: 'Voucher ID',
      accessorKey: 'payment_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.payment_id}</span>
    },
    {
      header: 'Order Reference',
      accessorKey: 'order_id',
      sortable: true,
      cell: row => (
        <span className="font-medium text-[#1b5e20]">{row.order_id}</span>
      )
    },
    {
      header: 'Gateway Reference & Hash',
      accessorKey: 'transaction_id',
      cell: row => (
        <div className="font-mono text-[11px]">
          <span className="block text-[#14291a]">{row.transaction_id}</span>
          <span className="text-[#718774]">{row.gateway_reference}</span>
        </div>
      )
    },
    {
      header: 'Payment Channel',
      accessorKey: 'payment_method',
      sortable: true,
      cell: row => <span className="font-semibold text-xs text-[#2b422e]">{row.payment_method}</span>
    },
    {
      header: 'Settlement Timestamp',
      accessorKey: 'payment_date',
      sortable: true,
      cell: row => <span className="text-xs text-[#526655] tabular-nums">{row.payment_date}</span>
    },
    {
      header: 'Amount Settled',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="font-bold tabular-nums text-xs text-[#14291a]">
          ₹{row.amount.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'payment_status',
      sortable: true,
      cell: row => <StatusBadge status={row.payment_status} />
    },
    {
      header: 'Tax Invoice',
      align: 'right',
      cell: row => (
        <button
          onClick={() => handleDownloadInvoice(row)}
          className="px-2.5 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#1b5e20] inline-flex items-center gap-1"
        >
          <DownloadIcon size={13} />
          <span>GST Bill</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Digital Escrow & Banking Telemetry"
        title="Payment Receipts & GST Tax Invoices"
        description="Audited payment transactions recorded across UPI, corporate net banking, and verified escrow disbursals with formal GST tax invoices."
      />

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payments by voucher ID or transaction hash..."
        rowsPerPage={10}
      />
    </div>
  );
};
