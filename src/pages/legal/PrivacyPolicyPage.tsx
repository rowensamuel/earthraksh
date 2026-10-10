import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        category="Legal & Data Governance"
        title="Privacy Policy & Agronomic Data Governance"
        description="Official privacy policy governing agricultural land data, GIS coordinates, crop yield data, and commercial trade records."
      />

      <div className="bg-white border border-[#dbe3d8] p-8 max-w-4xl space-y-6 text-xs text-[#2e4230] leading-relaxed">
        <div className="p-3 bg-[#eef4ec] border border-[#d2e0cf] text-[#1b5e20] font-semibold">
          [PLACEHOLDER NOTICE: This document outlines the planned legal privacy architecture for EarthRakshak ERP pending formal regulatory certification.]
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            1. Farmer Data Ownership & Agronomic Sovereignty
          </h2>
          <p>
            All cadastral mapping, soil health chemistry assays (NPK levels, pH readings), crop yield estimates, and on-farm machinery telemetry uploaded to EarthRakshak ERP remain the exclusive intellectual and economic property of the registering agricultural producer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            2. Commercial Transaction Data
          </h2>
          <p>
            Wholesale produce contracts, negotiated pricing, and escrow payment histories are accessible strictly between the contracting producer, verified procurement buyer, and authorized system compliance officers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            3. Row Level Security & Encryption
          </h2>
          <p>
            All records in the Supabase PostgreSQL backend are protected via role-based access control (RBAC) and Row Level Security (RLS) policies. Authentication sessions utilize encrypted JWT credentials.
          </p>
        </section>
      </div>
    </div>
  );
};
