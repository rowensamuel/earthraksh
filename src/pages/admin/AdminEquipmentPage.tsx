import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { equipmentService } from '../../services/equipmentService';
import { Equipment, EquipmentMaintenance } from '../../types';
import { Modal } from '../../components/common/Modal';
import { EyeIcon } from '../../components/common/Icons';

export const AdminEquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<EquipmentMaintenance[]>([]);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eq, maint] = await Promise.all([
        equipmentService.getEquipment(),
        equipmentService.getMaintenance()
      ]);
      setEquipment(eq);
      setMaintenance(maint);
    } catch (err) {
      console.warn('Admin equipment load error:', err);
    }
  };

  const getEqMaintenance = (id: string) => maintenance.filter(m => m.equipment_id === id);

  const columns: Column<Equipment>[] = [
    {
      header: 'Machine ID',
      accessorKey: 'equipment_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.equipment_id}</span>
    },
    {
      header: 'Equipment Name & Model',
      accessorKey: 'equipment_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.equipment_name}</span>
          <span className="text-[11px] text-[#5e7362]">{row.model}</span>
        </div>
      )
    },
    {
      header: 'Owner / Operating Hub',
      accessorKey: 'owner_name',
      cell: row => <span className="text-xs text-[#2c3f2f]">{row.owner_name}</span>
    },
    {
      header: 'Daily Tariff',
      accessorKey: 'rental_rate_per_day',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums font-bold text-xs text-[#14291a]">
          ₹{row.rental_rate_per_day.toLocaleString('en-IN')}/day
        </span>
      )
    },
    {
      header: 'Availability',
      accessorKey: 'availability_status',
      sortable: true,
      cell: row => <StatusBadge status={row.availability_status} />
    },
    {
      header: 'Mechanical Condition',
      accessorKey: 'condition_status',
      sortable: true,
      cell: row => <StatusBadge status={row.condition_status} />
    },
    {
      header: 'Actions',
      align: 'right',
      cell: row => (
        <button
          onClick={() => setSelectedEq(row)}
          className="px-2.5 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#1b5e20] inline-flex items-center gap-1"
        >
          <EyeIcon size={14} />
          <span>Details</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Machinery Fleet & Sharing Economy"
        title="Farm Machinery Fleet Oversight"
        description="Monitor multi-farmer machinery sharing pools, heavy tractor rentals, combine harvesters, drone sprayers, and automated maintenance servicing schedules."
      />

      <DataTable
        columns={columns}
        data={equipment}
        searchPlaceholder="Search machines by name, model, or ID..."
        rowsPerPage={10}
      />

      {/* EQUIPMENT DETAILS MODAL */}
      <Modal
        isOpen={!!selectedEq}
        onClose={() => setSelectedEq(null)}
        title="Machinery Technical Dossier"
        subtitle={selectedEq ? `${selectedEq.equipment_name} (${selectedEq.equipment_id})` : ''}
        maxWidth="lg"
      >
        {selectedEq && (
          <div className="space-y-4">
            <div className="p-3 bg-[#fafbfa] border border-[#e2e8df] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#607563]">Operating Custodian</span>
                <span className="font-semibold text-[#14291a]">{selectedEq.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607563]">Purchase / Registration Date</span>
                <span className="tabular-nums text-[#14291a]">{selectedEq.purchase_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607563]">Current Rental Tariff</span>
                <span className="font-bold tabular-nums text-[#1b5e20]">₹{selectedEq.rental_rate_per_day} per day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607563]">Operational Availability</span>
                <StatusBadge status={selectedEq.availability_status} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#607563]">Mechanical State</span>
                <StatusBadge status={selectedEq.condition_status} />
              </div>
            </div>

            {selectedEq.description && (
              <div>
                <span className="text-[11px] font-bold uppercase text-[#627a66] block mb-1">Specifications & Attachments</span>
                <p className="text-xs text-[#354a37] leading-relaxed p-2.5 bg-white border border-[#dbe3d8]">
                  {selectedEq.description}
                </p>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase text-[#627a66] block mb-1">Maintenance History</span>
              {getEqMaintenance(selectedEq.equipment_id).length > 0 ? (
                <div className="space-y-2">
                  {getEqMaintenance(selectedEq.equipment_id).map(m => (
                    <div key={m.maintenance_id} className="p-2.5 bg-white border border-[#dbe3d8] text-xs">
                      <div className="flex justify-between font-semibold text-[#14291a]">
                        <span>{m.maintenance_type}</span>
                        <span className="tabular-nums">Cost: ₹{m.cost}</span>
                      </div>
                      <p className="text-[11px] text-[#5e7362] mt-0.5">{m.notes}</p>
                      <div className="text-[10px] text-[#788e7b] mt-1 tabular-nums">
                        Service: {m.maintenance_date} · Next Due: {m.next_due_date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#718774] italic">No active maintenance flags recorded.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
