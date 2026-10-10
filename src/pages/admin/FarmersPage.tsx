import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { farmService } from '../../services/farmService';
import { cropService } from '../../services/cropService';
import { equipmentService } from '../../services/equipmentService';
import { marketplaceService } from '../../services/marketplaceService';
import { User, Farm, Crop, Equipment, MarketplaceProduct } from '../../types';
import { EyeIcon } from '../../components/common/Icons';

export const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, f, c, e, p] = await Promise.all([
        adminService.getFarmers(),
        farmService.getFarms(),
        cropService.getCrops(),
        equipmentService.getEquipment(),
        marketplaceService.getAllProductsAdmin()
      ]);
      setFarmers(u);
      setFarms(f);
      setCrops(c);
      setEquipment(e);
      setProducts(p);
    } catch (err) {
      console.warn('Admin farmers data fetch:', err);
    }
  };

  const getFarmerFarms = (userId: string) => farms.filter(f => f.user_id === userId);
  const getFarmerEquipment = (userId: string) => equipment.filter(e => e.user_id === userId);
  const getFarmerProducts = (userId: string) => products.filter(p => p.seller_id === userId);

  const columns: Column<User>[] = [
    {
      header: 'Farmer ID',
      accessorKey: 'user_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.user_id}</span>
    },
    {
      header: 'Farmer Name & Estate',
      accessorKey: 'full_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.full_name}</span>
          <span className="text-[11px] text-[#5c7360]">{row.designation}</span>
        </div>
      )
    },
    {
      header: 'Location',
      accessorKey: 'address',
      cell: row => <span className="text-xs text-[#2c3d2e]">{row.address}</span>
    },
    {
      header: 'Registered Land',
      cell: row => {
        const userFarms = getFarmerFarms(row.user_id);
        const totalArea = userFarms.reduce((a, f) => a + f.area, 0);
        return (
          <div className="tabular-nums">
            <span className="font-semibold text-[#14291a]">{totalArea} Acres</span>
            <span className="text-[11px] text-[#6b7e6e] block">{userFarms.length} Farm Plots</span>
          </div>
        );
      }
    },
    {
      header: 'Machinery Listed',
      cell: row => {
        const count = getFarmerEquipment(row.user_id).length;
        return <span className="tabular-nums font-medium text-[#1c2e22]">{count} Machines</span>;
      }
    },
    {
      header: 'Market Listings',
      cell: row => {
        const count = getFarmerProducts(row.user_id).length;
        return <span className="tabular-nums font-medium text-[#1b5e20]">{count} Active</span>;
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
          onClick={() => setSelectedFarmer(row)}
          className="px-2.5 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#1b5e20] inline-flex items-center gap-1"
        >
          <EyeIcon size={14} />
          <span>Inspect</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Registry & Agricultural Holdings"
        title="Verified Farmers & Farm Holdings"
        description="Comprehensive audit of all registered producers, land boundaries, seasonal crop cycles, machinery inventory, and live direct-to-consumer marketplace offerings."
      />

      <DataTable
        columns={columns}
        data={farmers}
        searchPlaceholder="Search farmers by name, district, or ID..."
        rowsPerPage={10}
      />

      {/* INSPECT FARMER MODAL */}
      <Modal
        isOpen={!!selectedFarmer}
        onClose={() => setSelectedFarmer(null)}
        title="Farmer Operational Portfolio"
        subtitle={selectedFarmer ? `${selectedFarmer.full_name} · ${selectedFarmer.user_id}` : ''}
        maxWidth="2xl"
      >
        {selectedFarmer && (
          <div className="space-y-6">
            {/* Primary Details */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#fafbfa] border border-[#e2e8df]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Phone Contact</span>
                <span className="text-xs font-semibold tabular-nums text-[#1c2e22]">{selectedFarmer.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Account Status</span>
                <StatusBadge status={selectedFarmer.status} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Registration Date</span>
                <span className="text-xs tabular-nums text-[#1c2e22]">{selectedFarmer.created_at}</span>
              </div>
            </div>

            {/* Farm Plots Registered */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14291a] mb-2">
                Registered Land Parcels ({getFarmerFarms(selectedFarmer.user_id).length})
              </h4>
              <div className="space-y-2">
                {getFarmerFarms(selectedFarmer.user_id).map(f => (
                  <div key={f.farm_id} className="p-3 border border-[#dbe3d8] flex justify-between items-center bg-white">
                    <div>
                      <span className="text-xs font-bold text-[#14291a]">{f.farm_name}</span>
                      <span className="text-[11px] text-[#637966] block">{f.location} · {f.soil_type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#1b5e20] tabular-nums">{f.area} {f.area_unit}</span>
                      <span className="text-[11px] text-[#637966] block">{f.water_source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Machinery Portfolio */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14291a] mb-2">
                Machinery Sharing Portfolio ({getFarmerEquipment(selectedFarmer.user_id).length})
              </h4>
              <div className="space-y-2">
                {getFarmerEquipment(selectedFarmer.user_id).map(e => (
                  <div key={e.equipment_id} className="p-3 border border-[#dbe3d8] flex justify-between items-center bg-white">
                    <div>
                      <span className="text-xs font-bold text-[#14291a]">{e.equipment_name}</span>
                      <span className="text-[11px] text-[#637966] block">{e.model}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold tabular-nums text-[#14291a]">₹{e.rental_rate_per_day}/day</span>
                      <StatusBadge status={e.availability_status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace Listings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14291a] mb-2">
                Marketplace Produce Listings ({getFarmerProducts(selectedFarmer.user_id).length})
              </h4>
              <div className="space-y-2">
                {getFarmerProducts(selectedFarmer.user_id).map(p => (
                  <div key={p.product_id} className="p-3 border border-[#dbe3d8] flex justify-between items-center bg-white">
                    <div>
                      <span className="text-xs font-bold text-[#14291a]">{p.product_name}</span>
                      <span className="text-[11px] text-[#637966] block">{p.category} · {p.certification}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold tabular-nums text-[#14291a]">₹{p.price_per_unit}/{p.unit}</span>
                      <span className="text-[11px] text-[#1b5e20] block font-semibold">{p.available_qty} {p.unit} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
