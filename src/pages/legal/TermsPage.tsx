import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';

export const TermsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        category="Legal & Compliance"
        title="Terms of Service & Direct Trade Agreement"
        description="Conditions governing peer-to-peer agricultural marketplace trades, equipment rentals, and digital escrow."
      />

      <div className="bg-white border border-[#dbe3d8] p-8 max-w-4xl space-y-6 text-xs text-[#2e4230] leading-relaxed">
        <div className="p-3 bg-[#eef4ec] border border-[#d2e0cf] text-[#1b5e20] font-semibold">
          [PLACEHOLDER NOTICE: Official Terms of Service for EarthRakshak agricultural exchange platform.]
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            1. Farmer Accreditation & Produce Authenticity
          </h2>
          <p>
            Producers listing commodities on the EarthRakshak marketplace warrant that all produce lots meet the designated certification standards (Organic India, GAP Certified, or Conventional tested) and accurate moisture/weight metrics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            2. Machinery Rental & Shared Economy
          </h2>
          <p>
            Equipment owners and hiring farmers agree to standardized day-rate operational inspection protocols. Physical equipment damages resulting from negligence are governed under local machinery sharing bylaws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a]">
            3. Digital Escrow & Payment Settlements
          </h2>
          <p>
            Produce orders are settled through registered payment gateways (UPI, NEFT/RTGS, Card). Payouts to producer accounts are released automatically upon verified receipt and APMC gate clearance.
          </p>
        </section>
      </div>
    </div>
  );
};
