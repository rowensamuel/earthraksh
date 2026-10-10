import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';
import { PlusIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const FarmerInventoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Seed');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<InventoryItem['unit']>('Kg');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    loadInventory();
  }, [currentUser]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getInventory(currentUser?.user_id);
      setItems(data);
    } catch (err: any) {
      console.error('Failed to load inventory from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = categoryFilter === 'ALL'
    ? items
    : items.filter(i => i.category === categoryFilter);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantity || !unitPrice) {
      showToast('Validation Error', 'error', 'Please fill item name, quantity, and cost.');
      return;
    }

    const q = parseFloat(quantity);
    let status: InventoryItem['status'] = 'In Stock';
    if (q <= 5) status = 'Critical';
    else if (q <= 15) status = 'Low Stock';

    try {
      await inventoryService.addInventoryItem({
        user_id: currentUser?.user_id || '',
        item_name: itemName,
        category,
        quantity: q,
        unit,
        unit_price: parseFloat(unitPrice),
        supplier: supplier || 'Cooperative Agri Depot',
        status,
        expiry_date: expiryDate || undefined
      });

      await loadInventory();
      setIsAddModalOpen(false);
      setItemName('');
      setQuantity('');
      setUnitPrice('');
      setSupplier('');
      showToast('Supply Item Recorded', 'success', `${itemName} saved to database.`);
    } catch (err: any) {
      console.error('Failed to save inventory item to database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist inventory item.');
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Code',
      accessorKey: 'item_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.item_id}</span>
    },
    {
      header: 'Item Specification',
      accessorKey: 'item_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.item_name}</span>
          {row.expiry_date && (
            <span className="text-[11px] text-[#6b7e6e] tabular-nums">Batch Expiry: {row.expiry_date}</span>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: row => <span className="text-xs font-semibold text-[#1b5e20]">{row.category}</span>
    },
    {
      header: 'Storeroom Quantity',
      accessorKey: 'quantity',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums font-bold text-xs text-[#14291a]">
          {row.quantity} {row.unit}
        </span>
      )
    },
    {
      header: 'Unit Acquisition Cost',
      accessorKey: 'unit_price',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums text-xs text-[#1c2e22]">
          ₹{row.unit_price} / {row.unit}
        </span>
      )
    },
    {
      header: 'Supplier / Vendor',
      accessorKey: 'supplier',
      cell: row => <span className="text-xs text-[#415744]">{row.supplier}</span>
    },
    {
      header: 'Stock Status',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Storeroom & Agricultural Consumables"
        title="Farm Inventory & Input Supplies"
        description="Maintain farm-level stock of certified seeds, slow-release fertilizers, bio-pesticides, and micro-irrigation attachments with automated threshold alerts."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Add Supply Item</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#dbe3d8] w-fit">
        {(['ALL', 'Seed', 'Fertilizer', 'Pesticide', 'Equipment'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-[#1b5e20] text-white font-bold'
                : 'text-[#506352] hover:text-[#14291a]'
            }`}
          >
            {cat === 'ALL' ? 'All Supplies' : `${cat}s`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Search inventory by item name or supplier..."
        rowsPerPage={10}
      />

      {/* ADD ITEM MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Farm Input / Consumable"
        subtitle="Record new batch delivery into farm storeroom"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Material / Product Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. Bio-Potash Granules / Zinc Sulphate"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Seed">Certified Seed</option>
                <option value="Fertilizer">Fertilizer / Nutrient</option>
                <option value="Pesticide">Pesticide / Bio-Agent</option>
                <option value="Equipment">Equipment / Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Kg">Kg</option>
                <option value="Bags">Bags (50 Kg standard)</option>
                <option value="Litres">Litres</option>
                <option value="Packets">Packets</option>
                <option value="Units">Units</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Quantity In Stock *
              </label>
              <input
                type="number"
                step="0.5"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Supplier / Brand Name
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="e.g. IFFCO / Coromandel"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
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
              Save to Storeroom
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
