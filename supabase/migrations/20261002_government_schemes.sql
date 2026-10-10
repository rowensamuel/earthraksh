-- ============================================================================
-- EARTHRAKSHAK ENTERPRISE RESOURCE PLANNING (ERP)
-- Migration: 20261002_government_schemes.sql
-- Module: Government Schemes & Yojana for Farmer Dashboard
-- ============================================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. GOVERNMENT SCHEMES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT NOT NULL,
    department TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'All India',
    category TEXT NOT NULL CHECK (category IN (
        'Financial Assistance',
        'Crop Insurance',
        'Irrigation & Water',
        'Farm Mechanization',
        'Soil Health & Inputs',
        'Solar & Energy',
        'Credit & Loan'
    )),
    eligibility_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_deadline TEXT,
    official_info_url TEXT NOT NULL,
    official_application_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_government_schemes_category ON public.government_schemes(category);
CREATE INDEX IF NOT EXISTS idx_government_schemes_state ON public.government_schemes(state);
CREATE INDEX IF NOT EXISTS idx_government_schemes_is_active ON public.government_schemes(is_active);

-- ============================================================================
-- 2. SCHEME REQUIRED DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scheme_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    document_help_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheme_documents_scheme_id ON public.scheme_documents(scheme_id);

-- ============================================================================
-- 3. FARMER SCHEME APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farmer_scheme_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
    application_status TEXT NOT NULL DEFAULT 'Preparing Documents' CHECK (application_status IN (
        'Not Started',
        'Preparing Documents',
        'Ready to Apply',
        'Applied',
        'Approved',
        'Rejected'
    )),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    reference_number TEXT,
    status_source TEXT NOT NULL DEFAULT 'Farmer-Reported',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_farmer_scheme UNIQUE (farmer_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_farmer_scheme_applications_farmer ON public.farmer_scheme_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_scheme_applications_scheme ON public.farmer_scheme_applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_farmer_scheme_applications_status ON public.farmer_scheme_applications(application_status);

-- ============================================================================
-- 4. FARMER SCHEME CHECKLIST PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farmer_scheme_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_application_id UUID NOT NULL REFERENCES public.farmer_scheme_applications(id) ON DELETE CASCADE,
    scheme_document_id UUID NOT NULL REFERENCES public.scheme_documents(id) ON DELETE CASCADE,
    is_ready BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_application_document UNIQUE (farmer_application_id, scheme_document_id)
);

CREATE INDEX IF NOT EXISTS idx_farmer_scheme_checklist_app ON public.farmer_scheme_checklist(farmer_application_id);
CREATE INDEX IF NOT EXISTS idx_farmer_scheme_checklist_doc ON public.farmer_scheme_checklist(scheme_document_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_scheme_checklist ENABLE ROW LEVEL SECURITY;

-- 5.1 Schemes RLS:
-- Authenticated users (Farmers, Buyers, Admins) can view active schemes.
DROP POLICY IF EXISTS "Anyone authenticated can view active government schemes" ON public.government_schemes;
CREATE POLICY "Anyone authenticated can view active government schemes"
    ON public.government_schemes
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE OR EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ));

-- Only Admins can insert, update or delete schemes
DROP POLICY IF EXISTS "Admins can manage government schemes" ON public.government_schemes;
CREATE POLICY "Admins can manage government schemes"
    ON public.government_schemes
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ));

-- 5.2 Scheme Documents RLS:
-- Authenticated users can view scheme documents
DROP POLICY IF EXISTS "Anyone authenticated can view scheme documents" ON public.scheme_documents;
CREATE POLICY "Anyone authenticated can view scheme documents"
    ON public.scheme_documents
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- Only Admins can manage scheme documents
DROP POLICY IF EXISTS "Admins can manage scheme documents" ON public.scheme_documents;
CREATE POLICY "Admins can manage scheme documents"
    ON public.scheme_documents
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ));

-- 5.3 Farmer Scheme Applications RLS:
-- Farmers can only view and edit their own applications. Admins can view for oversight.
DROP POLICY IF EXISTS "Farmers view own scheme applications" ON public.farmer_scheme_applications;
CREATE POLICY "Farmers view own scheme applications"
    ON public.farmer_scheme_applications
    FOR SELECT
    TO authenticated
    USING (farmer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
    ));

DROP POLICY IF EXISTS "Farmers insert own scheme applications" ON public.farmer_scheme_applications;
CREATE POLICY "Farmers insert own scheme applications"
    ON public.farmer_scheme_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "Farmers update own scheme applications" ON public.farmer_scheme_applications;
CREATE POLICY "Farmers update own scheme applications"
    ON public.farmer_scheme_applications
    FOR UPDATE
    TO authenticated
    USING (farmer_id = auth.uid())
    WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "Farmers delete own scheme applications" ON public.farmer_scheme_applications;
CREATE POLICY "Farmers delete own scheme applications"
    ON public.farmer_scheme_applications
    FOR DELETE
    TO authenticated
    USING (farmer_id = auth.uid());

-- 5.4 Farmer Scheme Checklist RLS:
-- Farmers can only view and update checklist for their own applications
DROP POLICY IF EXISTS "Farmers view own checklist progress" ON public.farmer_scheme_checklist;
CREATE POLICY "Farmers view own checklist progress"
    ON public.farmer_scheme_checklist
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.farmer_scheme_applications a
        WHERE a.id = farmer_application_id AND (a.farmer_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'ADMIN'
        ))
    ));

DROP POLICY IF EXISTS "Farmers insert own checklist progress" ON public.farmer_scheme_checklist;
CREATE POLICY "Farmers insert own checklist progress"
    ON public.farmer_scheme_checklist
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.farmer_scheme_applications a
        WHERE a.id = farmer_application_id AND a.farmer_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Farmers update own checklist progress" ON public.farmer_scheme_checklist;
CREATE POLICY "Farmers update own checklist progress"
    ON public.farmer_scheme_checklist
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.farmer_scheme_applications a
        WHERE a.id = farmer_application_id AND a.farmer_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.farmer_scheme_applications a
        WHERE a.id = farmer_application_id AND a.farmer_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Farmers delete own checklist progress" ON public.farmer_scheme_checklist;
CREATE POLICY "Farmers delete own checklist progress"
    ON public.farmer_scheme_checklist
    FOR DELETE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.farmer_scheme_applications a
        WHERE a.id = farmer_application_id AND a.farmer_id = auth.uid()
    ));

-- ============================================================================
-- 6. VERIFIED OFFICIAL SEED DATA: AUTHENTIC INDIAN AGRICULTURE SCHEMES
-- ============================================================================

-- Scheme 1: PM-KISAN
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111101',
    'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    'pm-kisan',
    'A central sector direct benefit transfer scheme to augment the financial needs of landholding farmer families across the country for procuring agricultural inputs and domestic requirements.',
    'Direct financial benefit of ₹6,000 per annum paid in three equal instalments of ₹2,000 every 4 months directly into the farmer''s Aadhaar-linked bank account via DBT.',
    'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, GoI',
    'All India',
    'Financial Assistance',
    '["All landholding farmer families with cultivable land in their names.", "Valid Aadhaar card linked with active bank account.", "Excluded: Institutional landholders, constitutional post holders, serving/retired government employees, income tax payers of last assessment year, and professionals (doctors, engineers, lawyers)."]'::jsonb,
    'Continuous Enrollment (Open Year-Round)',
    'https://pmkisan.gov.in/',
    'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for PM-KISAN
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111101', 'Aadhaar Card (UIDAI)', 'Biometric identity proof of the farmer; mobile number must be linked for OTP e-KYC.', TRUE, 'https://myaadhaar.uidai.gov.in/', 1),
('11111111-1111-1111-1111-111111111101', 'Land Ownership Records (Khatauni / ROR / 7/12)', 'Official revenue record proving cultivable land ownership in the applicant''s name.', TRUE, 'https://dilrmp.gov.in/', 2),
('11111111-1111-1111-1111-111111111101', 'Bank Passbook / Aadhaar-Seeded Bank Account', 'Bank account statement showing IFSC code, account number and active NPCI DBT seeding.', TRUE, 'https://www.npci.org.in/', 3),
('11111111-1111-1111-1111-111111111101', 'Active Mobile Number', 'Mobile number linked to Aadhaar for receiving verification SMS and transaction OTPs.', TRUE, 'https://myaadhaar.uidai.gov.in/', 4)
ON CONFLICT DO NOTHING;

-- Scheme 2: PMFBY
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111102',
    'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    'pmfby-crop-insurance',
    'A national flagship crop insurance scheme providing comprehensive financial risk coverage to farmers against unforeseen crop losses arising from non-preventable natural calamities, pests, and adverse weather.',
    'Comprehensive insurance payout against localized calamity, prevented sowing, post-harvest losses, and mid-season adversity. Farmers pay nominal premium: 2% for Kharif food/oilseeds, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops. Balance premium is subsidized by GoI and State.',
    'Ministry of Agriculture & Farmers Welfare, Government of India',
    'All India',
    'Crop Insurance',
    '["All farmers including sharecroppers and tenant farmers growing notified crops in notified insurance units.", "Enrollment voluntary for non-loanee farmers; available through banks or CSCs for loanee farmers.", "Sowing must be completed within the officially declared sowing window of the season."]'::jsonb,
    '31st July (Kharif Season) / 31st December (Rabi Season)',
    'https://pmfby.gov.in/',
    'https://pmfby.gov.in/farmerRegistrationForm',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for PMFBY
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111102', 'Aadhaar Card', 'Mandatory identity and biometric verification proof.', TRUE, 'https://myaadhaar.uidai.gov.in/', 1),
('11111111-1111-1111-1111-111111111102', 'Land Possession Certificate / Khasra-Khatauni', 'Valid land revenue extract, Patta passbook, or registered tenant agreement.', TRUE, 'https://dilrmp.gov.in/', 2),
('11111111-1111-1111-1111-111111111102', 'Sowing Certificate / Crop Sowing Declaration', 'Certificate issued by Patwari, Village Revenue Officer, or Gram Panchayat head verifying the notified crop sown.', TRUE, NULL, 3),
('11111111-1111-1111-1111-111111111102', 'Bank Account Passbook / Cancelled Cheque', 'Bank account details where insurance claim settlement amount will be credited.', TRUE, NULL, 4)
ON CONFLICT DO NOTHING;

-- Scheme 3: Kisan Credit Card (KCC)
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111103',
    'Kisan Credit Card (KCC) & Modified Interest Subvention',
    'kisan-credit-card-kcc',
    'Timely access to affordable short-term institutional credit for farmers to meet crop cultivation expenses, post-harvest costs, and maintenance of farm assets and allied activities (dairy, fisheries).',
    'Credit limit up to ₹3,00,000 at concessional interest rate of 7% p.a., reduced to an effective rate of 4% per annum upon prompt repayment (3% Prompt Repayment Incentive). Collateral-free agricultural loans up to ₹1.60 Lakhs.',
    'Department of Agriculture & Farmers Welfare & NABARD / RBI',
    'All India',
    'Credit & Loan',
    '["All farmers – individuals/joint borrowers who are owner cultivators.", "Tenant farmers, oral lessees & sharecroppers.", "Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.", "Animal husbandry, poultry, and fisheries farmers are also eligible for working capital KCC up to ₹2 Lakhs."]'::jsonb,
    'Continuous / Open Year-Round at all Commercial & Cooperative Banks',
    'https://fasalrin.gov.in/',
    'https://fasalrin.gov.in/',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for KCC
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111103', 'Duly Filled KCC Application Form', 'Standard one-page simplified KCC form issued by the Indian Banks Association.', TRUE, 'https://fasalrin.gov.in/', 1),
('11111111-1111-1111-1111-111111111103', 'Aadhaar Card & PAN Card', 'Identity proof and permanent account number for KYC compliance.', TRUE, 'https://myaadhaar.uidai.gov.in/', 2),
('11111111-1111-1111-1111-111111111103', 'Land Records / Revenue Extract (Khatauni/7/12)', 'Land ownership or tenancy agreement duly verified by revenue authority.', TRUE, 'https://dilrmp.gov.in/', 3),
('11111111-1111-1111-1111-111111111103', 'Recent Passport-size Photograph', 'Two recent passport-sized color photographs of applicant.', TRUE, NULL, 4),
('11111111-1111-1111-1111-111111111103', 'No-Dues Certificate / Self-Declaration', 'Declaration that no other default KCC loan exists in any other scheduled commercial bank branch.', FALSE, NULL, 5)
ON CONFLICT DO NOTHING;

-- Scheme 4: PMKSY - Per Drop More Crop
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111104',
    'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) — Per Drop More Crop',
    'pmksy-per-drop-more-crop',
    'Enhancing water use efficiency at farm level through precision micro-irrigation technologies such as Drip and Sprinkler irrigation systems.',
    'Government subsidy of up to 55% for small and marginal farmers, and 45% for other farmers on benchmark cost of drip and sprinkler irrigation installations. Substantial savings on water and electricity with up to 30% yield boost.',
    'Department of Agriculture & Farmers Welfare, Ministry of Agriculture',
    'All India',
    'Irrigation & Water',
    '["Farmers of all categories having cultivable agricultural land with assured irrigation water source (borewell, open well, farm pond, or canal point).", "Land ownership must be verified in state revenue portal.", "Members of cooperative farming societies and water user associations."]'::jsonb,
    'Annual State-wise Allocation Window (Check State Horticulture Portal)',
    'https://pmksy.gov.in/',
    'https://pmksy.gov.in/',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for PMKSY
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111104', 'Aadhaar Card', 'Mandatory identity proof for DBT subsidy disbursement.', TRUE, 'https://myaadhaar.uidai.gov.in/', 1),
('11111111-1111-1111-1111-111111111104', 'Land Revenue Record (7/12 Extract / Khatauni)', 'Proof of agricultural land possession and cultivated crop classification.', TRUE, 'https://dilrmp.gov.in/', 2),
('11111111-1111-1111-1111-111111111104', 'Electricity / Water Source Certificate', 'Electricity bill of pump set or certificate verifying assured water source.', TRUE, NULL, 3),
('11111111-1111-1111-1111-111111111104', 'Soil and Water Testing Report', 'Laboratory test report certifying suitability for micro-irrigation installation.', FALSE, NULL, 4),
('11111111-1111-1111-1111-111111111104', 'Bank Passbook Copy', 'Aadhaar-seeded bank account for subsidy transfer.', TRUE, NULL, 5)
ON CONFLICT DO NOTHING;

-- Scheme 5: SMAM (Agricultural Mechanization)
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111105',
    'Sub-Mission on Agricultural Mechanization (SMAM)',
    'smam-farm-mechanization',
    'Promoting agricultural mechanization among small and marginal farmers by subsidizing modern farm machinery, tractors, rotavators, power tillers, and establishing Custom Hiring Centres (CHC).',
    '40% to 50% subsidy on procurement cost of authorized agricultural machinery for individual farmers (up to 50% for women, SC, ST, and small/marginal farmers). Up to 80% project assistance for establishing Custom Hiring Centres.',
    'Mechanization & Technology Division, Ministry of Agriculture & Farmers Welfare',
    'All India',
    'Farm Mechanization',
    '["Individual farmers possessing verified agricultural land.", "Priority to Small & Marginal Farmers, Women Farmers, and SC/ST farmers.", "Applicant must not have availed subsidy on the same equipment within past 5 years."]'::jsonb,
    'State Department Portals announce quarterly lotteries/first-come allocations',
    'https://agrimachinery.nic.in/',
    'https://agrimachinery.nic.in/Farmer/Management/FarmerRegistration',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for SMAM
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111105', 'Aadhaar Card', 'Mandatory identity proof for DBT beneficiary registration.', TRUE, 'https://myaadhaar.uidai.gov.in/', 1),
('11111111-1111-1111-1111-111111111105', 'Land Records (Khatauni / Jamabandi)', 'Verified land holding details to determine small/marginal farmer eligibility.', TRUE, 'https://dilrmp.gov.in/', 2),
('11111111-1111-1111-1111-111111111105', 'Bank Account Passbook Copy', 'Nationalized or scheduled commercial bank passbook copy.', TRUE, NULL, 3),
('11111111-1111-1111-1111-111111111105', 'Caste Certificate (SC/ST/OBC)', 'Mandatory only if applying under reserved category for 50% enhanced subsidy.', FALSE, NULL, 4),
('11111111-1111-1111-1111-111111111105', 'Dealer Quotation for Machinery', 'Official quotation from empanelled manufacturer or authorized tractor dealer.', TRUE, NULL, 5)
ON CONFLICT DO NOTHING;

-- Scheme 6: PM-KUSUM (Solar Pumps & Grid-Connected Solar Plants)
INSERT INTO public.government_schemes (
    id, name, slug, description, benefits, department, state, category,
    eligibility_criteria, application_deadline, official_info_url, official_application_url, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111106',
    'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    'pm-kusum-solar',
    'Providing energy and water security to farmers by de-dieselizing the agricultural sector through subsidized solar agriculture pumps and solar power generation plants on barren/cultivable land.',
    '60% subsidy on installation of stand-alone solar agriculture pumps (Component B) with 30% from GoI and 30% from State Government. Farmer pays only 10% upfront cost, with optional 30% bank loan.',
    'Ministry of New and Renewable Energy (MNRE), Government of India',
    'All India',
    'Solar & Energy',
    '["Individual farmers, groups of farmers, Water User Associations, and FPOs.", "Applicant must possess agricultural land with existing irrigation pump or need for new pump.", "Diesel pump owners looking to switch to solar."]'::jsonb,
    'Ongoing through State Nodal Renewable Energy Agencies',
    'https://pmkusum.mnre.gov.in/',
    'https://pmkusum.mnre.gov.in/',
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefits = EXCLUDED.benefits,
    description = EXCLUDED.description;

-- Documents for PM-KUSUM
INSERT INTO public.scheme_documents (scheme_id, document_name, description, is_mandatory, document_help_url, display_order) VALUES
('11111111-1111-1111-1111-111111111106', 'Aadhaar Card', 'Mandatory identity proof.', TRUE, 'https://myaadhaar.uidai.gov.in/', 1),
('11111111-1111-1111-1111-111111111106', 'Land Records / Khasra-Khatauni', 'Ownership proof of agricultural land where pump will be installed.', TRUE, 'https://dilrmp.gov.in/', 2),
('11111111-1111-1111-1111-111111111106', 'Bank Account Passbook', 'Bank details for beneficiary registration and subsidy account.', TRUE, NULL, 3),
('11111111-1111-1111-1111-111111111106', 'Proof of Water Source / Well / Borewell', 'Self-declaration or gram panchayat certificate confirming water availability.', TRUE, NULL, 4)
ON CONFLICT DO NOTHING;

-- End of migration
