import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { showToast } from '../../components/common/Toast';

export const AdminMarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const prods = await marketplaceService.getAllProductsAdmin();
      setProducts(prods);
    } catch (err) {
      console.warn('Admin marketplace load error:', err);
    }
  };

  const handleToggleStatus = async (product: MarketplaceProduct) => {
    const nextStatus = product.status === 'Active' ? 'Delisted' : 'Active';
    try {
      await marketplaceService.updateProduct(product.product_id, { status: nextStatus as any });
      await loadProducts();
      showToast(`Listing ${nextStatus} in Database`, 'success', `${product.product_name} is now ${nextStatus.toLowerCase()}`);
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update status.');
    }
  };

  const filteredProducts = categoryFilter === 'ALL'
    ? products
    : products.filter(p => p.category === categoryFilter);

  const columns: Column<MarketplaceProduct>[] = [
    {
      header: 'Listing ID',
      accessorKey: 'product_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.product_id}</span>
    },
    {
      header: 'Produce Name & Grade',
      accessorKey: 'product_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.product_name}</span>
          <span className="text-[11px] text-[#5e7362]">{row.grade} · {row.certification}</span>
        </div>
      )
    },
    {
      header: 'Farmer / Producer',
      accessorKey: 'seller_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="text-[#14291a] font-medium block">{row.seller_name}</span>
          <span className="text-[11px] text-[#718774]">{row.seller_location}</span>
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
      header: 'Market Price',
      accessorKey: 'price_per_unit',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums font-bold text-xs text-[#14291a]">
          ₹{row.price_per_unit.toLocaleString('en-IN')} / {row.unit}
        </span>
      )
    },
    {
      header: 'Available Stock',
      accessorKey: 'available_qty',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums text-xs font-medium text-[#1c2e22]">
          {row.available_qty} {row.unit}
        </span>
      )
    },
    {
      header: 'Trading Status',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Audit Action',
      align: 'right',
      cell: row => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2 py-0.5 text-xs font-medium border transition-colors ${
            row.status === 'Active'
              ? 'text-[#991b1b] border-[#fca5a5] hover:bg-[#fef2f2]'
              : 'text-[#1b5e20] border-[#86efac] hover:bg-[#f0fdf4]'
          }`}
        >
          {row.status === 'Active' ? 'Delist' : 'Approve'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Direct Produce Exchange"
        title="Commodity Marketplace & Listing Moderation"
        description="Oversee certified organic produce lots, grains, pulses, and spices offered directly by verified agricultural producers to institutional buyers."
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#dbe3d8] w-fit">
        {(['ALL', 'Grains', 'Fruits', 'Vegetables', 'Pulses', 'Spices'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-[#1b5e20] text-white font-bold'
                : 'text-[#506352] hover:text-[#14291a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search listings by produce name, farmer, or region..."
        rowsPerPage={10}
      />
    </div>
  );
};
