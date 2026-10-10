import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { FinanceRecord } from '../../types';
import { PlusIcon, FinanceIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const FarmerFinancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'Income' | 'Expense'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [type, setType] = useState<FinanceRecord['transaction_type']>('Income');
  const [category, setCategory] = useState<FinanceRecord['category']>('Crop Sales');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  useEffect(() => {
    loadFinance();
  }, [currentUser]);

  const loadFinance = async () => {
    try {
      const data = await financeService.getFinance(currentUser?.user_id);
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load finance records from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load finance records.');
    }
  };

  const totalIncome = records.filter(r => r.transaction_type === 'Income').reduce((a, r) => a + r.amount, 0);
  const totalExpense = records.filter(r => r.transaction_type === 'Expense').reduce((a, r) => a + r.amount, 0);
  const netSurplus = totalIncome - totalExpense;

  const filteredRecords = filterType === 'ALL'
    ? records
    : records.filter(r => r.transaction_type === filterType);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      showToast('Validation Error', 'error', 'Please fill amount and description.');
      return;
    }

    try {
      await financeService.addFinanceRecord({
        user_id: currentUser?.user_id || '',
        transaction_type: type,
        category,
        amount: parseFloat(amount),
        transaction_date: new Date().toISOString().split('T')[0],
        description,
        reference_no: referenceNo || `REF-${Math.floor(10000 + Math.random() * 90000)}`
      });

      await loadFinance();
      setIsAddModalOpen(false);
      setAmount('');
      setDescription('');
      setReferenceNo('');
      showToast('Transaction Saved to Database', 'success', `${type} entry logged into farm books.`);
    } catch (err: any) {
      console.error('Failed to persist transaction to database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist transaction in database.');
    }
  };

  const columns: Column<FinanceRecord>[] = [
    {
      header: 'Txn Voucher',
      accessorKey: 'finance_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.finance_id}</span>
    },
    {
      header: 'Category & Reference',
      accessorKey: 'category',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.category}</span>
          <span className="text-[11px] text-[#6b7e6e] tabular-nums">{row.reference_no}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: row => <span className="text-xs text-[#314533]">{row.description}</span>
    },
    {
      header: 'Type',
      accessorKey: 'transaction_type',
      sortable: true,
      cell: row => (
        <span className={`text-xs font-bold ${row.transaction_type === 'Income' ? 'text-[#1b5e20]' : 'text-[#b91c1c]'}`}>
          {row.transaction_type}
        </span>
      )
    },
    {
      header: 'Settlement Date',
      accessorKey: 'transaction_date',
      sortable: true,
      cell: row => <span className="tabular-nums text-xs text-[#59705c]">{row.transaction_date}</span>
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className={`font-bold tabular-nums text-xs ${
          row.transaction_type === 'Income' ? 'text-[#1b5e20]' : 'text-[#b91c1c]'
        }`}>
          {row.transaction_type === 'Income' ? '+' : '-'}₹{row.amount.toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Farm Financial Bookkeeping & Cashflow"
        title="Income, Expenses & Ledger Accounting"
        description="Maintain digital double-entry bookkeeping for produce sales, machinery rental revenues, diesel fuel expenditures, seed purchases, and government micro-irrigation subsidies."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Record Entry</span>
          </button>
        }
      />

      {/* Financial KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Seasonal Revenue"
          value={`₹${totalIncome.toLocaleString('en-IN')}`}
          subtext="Produce sales & machinery rentals"
          icon={<FinanceIcon size={18} />}
        />
        <StatCard
          label="Total Operating Expenses"
          value={`₹${totalExpense.toLocaleString('en-IN')}`}
          subtext="Seeds, fuel, labor & fertilizers"
          icon={<FinanceIcon size={18} />}
        />
        <StatCard
          label="Net Farm Operating Surplus"
          value={`₹${netSurplus.toLocaleString('en-IN')}`}
          subtext="Cashflow buffer retained"
          icon={<FinanceIcon size={18} />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#dbe3d8] w-fit">
        {(['ALL', 'Income', 'Expense'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              filterType === f
                ? 'bg-[#1b5e20] text-white font-bold'
                : 'text-[#506352] hover:text-[#14291a]'
            }`}
          >
            {f === 'ALL' ? 'All Transactions' : f}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        searchPlaceholder="Search ledger by category, description or reference..."
        rowsPerPage={10}
      />

      {/* RECORD ENTRY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Financial Transaction"
        subtitle="Log income or operational farm expenditure voucher"
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Transaction Type *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Income">Income (Revenue / Credit)</option>
                <option value="Expense">Expense (Debit / Payment)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Accounting Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Crop Sales">Crop Produce Sales</option>
                <option value="Equipment Rental">Equipment Rental Inflow</option>
                <option value="Seeds & Fertilizer">Seeds & Chemical Purchase</option>
                <option value="Machinery Fuel">Machinery Fuel & Diesel</option>
                <option value="Labor Wages">Field Labor Wages</option>
                <option value="Govt Subsidy">Government Subsidy / DBT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Settled Amount (₹) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Receipt / Invoice Voucher No
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                placeholder="e.g. INV-2026-99"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Description / Notes *
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Payment for 10 bags DAP fertilizer from Agro Depot"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
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
              Save Ledger Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
