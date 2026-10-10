import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  GovernmentScheme,
  SchemeDocument,
  FarmerSchemeApplication,
  SchemeApplicationStatus,
  SchemeCategory
} from '../types';

// ============================================================================
// Verified Official Fallback Seed Data (Ministry of Agriculture & GoI)
// ============================================================================
export const VERIFIED_DEFAULT_SCHEMES: GovernmentScheme[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    slug: 'pm-kisan',
    description: 'A central sector direct benefit transfer scheme to augment the financial needs of landholding farmer families across the country for procuring agricultural inputs and domestic requirements.',
    benefits: 'Direct financial benefit of ₹6,000 per annum paid in three equal instalments of ₹2,000 every 4 months directly into the farmer\'s Aadhaar-linked bank account via DBT.',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, GoI',
    state: 'All India',
    category: 'Financial Assistance',
    eligibility_criteria: [
      'All landholding farmer families with cultivable land in their names.',
      'Valid Aadhaar card linked with active bank account and NPCI DBT seeding.',
      'Exclusions: Institutional landholders, constitutional post holders, serving/retired government employees, and income tax payers of last assessment year.'
    ],
    application_deadline: 'Continuous Enrollment (Open Year-Round)',
    official_info_url: 'https://pmkisan.gov.in/',
    official_application_url: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    is_active: true,
    documents: [
      {
        id: 'doc-pmkisan-1',
        scheme_id: '11111111-1111-1111-1111-111111111101',
        document_name: 'Aadhaar Card (UIDAI)',
        description: 'Biometric identity proof of the farmer; mobile number must be linked for OTP e-KYC.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-pmkisan-2',
        scheme_id: '11111111-1111-1111-1111-111111111101',
        document_name: 'Land Ownership Records (Khatauni / ROR / 7/12)',
        description: 'Official revenue record proving cultivable land ownership in the applicant\'s name.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-pmkisan-3',
        scheme_id: '11111111-1111-1111-1111-111111111101',
        document_name: 'Bank Passbook / Aadhaar-Seeded Bank Account',
        description: 'Bank account statement showing IFSC code, account number and active NPCI DBT seeding.',
        is_mandatory: true,
        document_help_url: 'https://www.npci.org.in/',
        display_order: 3
      },
      {
        id: 'doc-pmkisan-4',
        scheme_id: '11111111-1111-1111-1111-111111111101',
        document_name: 'Active Mobile Number',
        description: 'Mobile number linked to Aadhaar for receiving verification SMS and transaction OTPs.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 4
      }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    slug: 'pmfby-crop-insurance',
    description: 'A national flagship crop insurance scheme providing comprehensive financial risk coverage to farmers against unforeseen crop losses arising from non-preventable natural calamities, pests, and adverse weather.',
    benefits: 'Comprehensive insurance payout against localized calamity, prevented sowing, post-harvest losses, and mid-season adversity. Farmers pay nominal premium: 2% for Kharif food/oilseeds, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops.',
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    state: 'All India',
    category: 'Crop Insurance',
    eligibility_criteria: [
      'All farmers including sharecroppers and tenant farmers growing notified crops in notified insurance units.',
      'Enrollment voluntary for non-loanee farmers; available through banks or CSCs for loanee farmers.',
      'Sowing must be completed within the officially declared sowing window of the season.'
    ],
    application_deadline: '31st July (Kharif Season) / 31st December (Rabi Season)',
    official_info_url: 'https://pmfby.gov.in/',
    official_application_url: 'https://pmfby.gov.in/farmerRegistrationForm',
    is_active: true,
    documents: [
      {
        id: 'doc-pmfby-1',
        scheme_id: '11111111-1111-1111-1111-111111111102',
        document_name: 'Aadhaar Card',
        description: 'Mandatory identity and biometric verification proof.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-pmfby-2',
        scheme_id: '11111111-1111-1111-1111-111111111102',
        document_name: 'Land Possession Certificate / Khasra-Khatauni',
        description: 'Valid land revenue extract, Patta passbook, or registered tenant agreement.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-pmfby-3',
        scheme_id: '11111111-1111-1111-1111-111111111102',
        document_name: 'Sowing Certificate / Crop Sowing Declaration',
        description: 'Certificate issued by Patwari, Village Revenue Officer, or Gram Panchayat head verifying the notified crop sown.',
        is_mandatory: true,
        display_order: 3
      },
      {
        id: 'doc-pmfby-4',
        scheme_id: '11111111-1111-1111-1111-111111111102',
        document_name: 'Bank Account Passbook / Cancelled Cheque',
        description: 'Bank account details where insurance claim settlement amount will be credited.',
        is_mandatory: true,
        display_order: 4
      }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Kisan Credit Card (KCC) & Modified Interest Subvention',
    slug: 'kisan-credit-card-kcc',
    description: 'Timely access to affordable short-term institutional credit for farmers to meet crop cultivation expenses, post-harvest costs, and maintenance of farm assets and allied activities (dairy, fisheries).',
    benefits: 'Credit limit up to ₹3,00,000 at concessional interest rate of 7% p.a., reduced to an effective rate of 4% per annum upon prompt repayment (3% Prompt Repayment Incentive). Collateral-free agricultural loans up to ₹1.60 Lakhs.',
    department: 'Department of Agriculture & Farmers Welfare & NABARD / RBI',
    state: 'All India',
    category: 'Credit & Loan',
    eligibility_criteria: [
      'All farmers – individuals/joint borrowers who are owner cultivators.',
      'Tenant farmers, oral lessees & sharecroppers with land cultivation proof.',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.',
      'Animal husbandry, poultry, and fisheries farmers are also eligible for working capital KCC up to ₹2 Lakhs.'
    ],
    application_deadline: 'Continuous / Open Year-Round at all Commercial & Cooperative Banks',
    official_info_url: 'https://fasalrin.gov.in/',
    official_application_url: 'https://fasalrin.gov.in/',
    is_active: true,
    documents: [
      {
        id: 'doc-kcc-1',
        scheme_id: '11111111-1111-1111-1111-111111111103',
        document_name: 'Duly Filled KCC Application Form',
        description: 'Standard one-page simplified KCC form issued by the Indian Banks Association.',
        is_mandatory: true,
        document_help_url: 'https://fasalrin.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-kcc-2',
        scheme_id: '11111111-1111-1111-1111-111111111103',
        document_name: 'Aadhaar Card & PAN Card',
        description: 'Identity proof and permanent account number for KYC compliance.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-kcc-3',
        scheme_id: '11111111-1111-1111-1111-111111111103',
        document_name: 'Land Records / Revenue Extract (Khatauni/7/12)',
        description: 'Land ownership or tenancy agreement duly verified by revenue authority.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 3
      },
      {
        id: 'doc-kcc-4',
        scheme_id: '11111111-1111-1111-1111-111111111103',
        document_name: 'Recent Passport-size Photograph',
        description: 'Two recent passport-sized color photographs of applicant.',
        is_mandatory: true,
        display_order: 4
      },
      {
        id: 'doc-kcc-5',
        scheme_id: '11111111-1111-1111-1111-111111111103',
        document_name: 'No-Dues Certificate / Self-Declaration',
        description: 'Declaration that no other default KCC loan exists in any other scheduled commercial bank branch.',
        is_mandatory: false,
        display_order: 5
      }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) — Per Drop More Crop',
    slug: 'pmksy-per-drop-more-crop',
    description: 'Enhancing water use efficiency at farm level through precision micro-irrigation technologies such as Drip and Sprinkler irrigation systems.',
    benefits: 'Government subsidy of up to 55% for small and marginal farmers, and 45% for other farmers on benchmark cost of drip and sprinkler irrigation installations. Substantial savings on water and electricity with up to 30% yield boost.',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture',
    state: 'All India',
    category: 'Irrigation & Water',
    eligibility_criteria: [
      'Farmers of all categories having cultivable agricultural land with assured irrigation water source (borewell, open well, farm pond, or canal point).',
      'Land ownership must be verified in state revenue portal.',
      'Members of cooperative farming societies and water user associations.'
    ],
    application_deadline: 'Annual State-wise Allocation Window (Check State Horticulture Portal)',
    official_info_url: 'https://pmksy.gov.in/',
    official_application_url: 'https://pmksy.gov.in/',
    is_active: true,
    documents: [
      {
        id: 'doc-pmksy-1',
        scheme_id: '11111111-1111-1111-1111-111111111104',
        document_name: 'Aadhaar Card',
        description: 'Mandatory identity proof for DBT subsidy disbursement.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-pmksy-2',
        scheme_id: '11111111-1111-1111-1111-111111111104',
        document_name: 'Land Revenue Record (7/12 Extract / Khatauni)',
        description: 'Proof of agricultural land possession and cultivated crop classification.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-pmksy-3',
        scheme_id: '11111111-1111-1111-1111-111111111104',
        document_name: 'Electricity / Water Source Certificate',
        description: 'Electricity bill of pump set or certificate verifying assured water source.',
        is_mandatory: true,
        display_order: 3
      },
      {
        id: 'doc-pmksy-4',
        scheme_id: '11111111-1111-1111-1111-111111111104',
        document_name: 'Soil and Water Testing Report',
        description: 'Laboratory test report certifying suitability for micro-irrigation installation.',
        is_mandatory: false,
        display_order: 4
      },
      {
        id: 'doc-pmksy-5',
        scheme_id: '11111111-1111-1111-1111-111111111104',
        document_name: 'Bank Passbook Copy',
        description: 'Aadhaar-seeded bank account for subsidy transfer.',
        is_mandatory: true,
        display_order: 5
      }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    slug: 'smam-farm-mechanization',
    description: 'Promoting agricultural mechanization among small and marginal farmers by subsidizing modern farm machinery, tractors, rotavators, power tillers, and establishing Custom Hiring Centres (CHC).',
    benefits: '40% to 50% subsidy on procurement cost of authorized agricultural machinery for individual farmers (up to 50% for women, SC, ST, and small/marginal farmers). Up to 80% project assistance for establishing Custom Hiring Centres.',
    department: 'Mechanization & Technology Division, Ministry of Agriculture & Farmers Welfare',
    state: 'All India',
    category: 'Farm Mechanization',
    eligibility_criteria: [
      'Individual farmers possessing verified agricultural land.',
      'Priority to Small & Marginal Farmers, Women Farmers, and SC/ST farmers.',
      'Applicant must not have availed subsidy on the same equipment within past 5 years.'
    ],
    application_deadline: 'State Department Portals announce quarterly lotteries/first-come allocations',
    official_info_url: 'https://agrimachinery.nic.in/',
    official_application_url: 'https://agrimachinery.nic.in/Farmer/Management/FarmerRegistration',
    is_active: true,
    documents: [
      {
        id: 'doc-smam-1',
        scheme_id: '11111111-1111-1111-1111-111111111105',
        document_name: 'Aadhaar Card',
        description: 'Mandatory identity proof for DBT beneficiary registration.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-smam-2',
        scheme_id: '11111111-1111-1111-1111-111111111105',
        document_name: 'Land Records (Khatauni / Jamabandi)',
        description: 'Verified land holding details to determine small/marginal farmer eligibility.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-smam-3',
        scheme_id: '11111111-1111-1111-1111-111111111105',
        document_name: 'Bank Account Passbook Copy',
        description: 'Nationalized or scheduled commercial bank passbook copy.',
        is_mandatory: true,
        display_order: 3
      },
      {
        id: 'doc-smam-4',
        scheme_id: '11111111-1111-1111-1111-111111111105',
        document_name: 'Caste Certificate (SC/ST/OBC)',
        description: 'Mandatory only if applying under reserved category for 50% enhanced subsidy.',
        is_mandatory: false,
        display_order: 4
      },
      {
        id: 'doc-smam-5',
        scheme_id: '11111111-1111-1111-1111-111111111105',
        document_name: 'Dealer Quotation for Machinery',
        description: 'Official quotation from empanelled manufacturer or authorized tractor dealer.',
        is_mandatory: true,
        display_order: 5
      }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    slug: 'pm-kusum-solar',
    description: 'Providing energy and water security to farmers by de-dieselizing the agricultural sector through subsidized solar agriculture pumps and solar power generation plants on barren/cultivable land.',
    benefits: '60% subsidy on installation of stand-alone solar agriculture pumps (Component B) with 30% from GoI and 30% from State Government. Farmer pays only 10% upfront cost, with optional 30% bank loan.',
    department: 'Ministry of New and Renewable Energy (MNRE), Government of India',
    state: 'All India',
    category: 'Solar & Energy',
    eligibility_criteria: [
      'Individual farmers, groups of farmers, Water User Associations, and FPOs.',
      'Applicant must possess agricultural land with existing irrigation pump or need for new pump.',
      'Diesel pump owners looking to switch to solar.'
    ],
    application_deadline: 'Ongoing through State Nodal Renewable Energy Agencies',
    official_info_url: 'https://pmkusum.mnre.gov.in/',
    official_application_url: 'https://pmkusum.mnre.gov.in/',
    is_active: true,
    documents: [
      {
        id: 'doc-kusum-1',
        scheme_id: '11111111-1111-1111-1111-111111111106',
        document_name: 'Aadhaar Card',
        description: 'Mandatory identity proof.',
        is_mandatory: true,
        document_help_url: 'https://myaadhaar.uidai.gov.in/',
        display_order: 1
      },
      {
        id: 'doc-kusum-2',
        scheme_id: '11111111-1111-1111-1111-111111111106',
        document_name: 'Land Records / Khasra-Khatauni',
        description: 'Ownership proof of agricultural land where pump will be installed.',
        is_mandatory: true,
        document_help_url: 'https://dilrmp.gov.in/',
        display_order: 2
      },
      {
        id: 'doc-kusum-3',
        scheme_id: '11111111-1111-1111-1111-111111111106',
        document_name: 'Bank Account Passbook',
        description: 'Bank details for beneficiary registration and subsidy account.',
        is_mandatory: true,
        display_order: 3
      },
      {
        id: 'doc-kusum-4',
        scheme_id: '11111111-1111-1111-1111-111111111106',
        document_name: 'Proof of Water Source / Well / Borewell',
        description: 'Self-declaration or gram panchayat certificate confirming water availability.',
        is_mandatory: true,
        display_order: 4
      }
    ]
  }
];

// Helper to get local cache key for a farmer
const getStorageKey = (farmerId: string) => `earthrakshak_farmer_schemes_${farmerId}`;

function getLocalApplications(farmerId: string): Record<string, FarmerSchemeApplication> {
  try {
    const raw = localStorage.getItem(getStorageKey(farmerId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalApplications(farmerId: string, data: Record<string, FarmerSchemeApplication>) {
  try {
    localStorage.setItem(getStorageKey(farmerId), JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local scheme applications:', err);
  }
}

const CUSTOM_SCHEMES_KEY = 'earthrakshak_custom_government_schemes';

export function getCustomLocalSchemes(): GovernmentScheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCHEMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLocalSchemes(schemes: GovernmentScheme[]) {
  try {
    localStorage.setItem(CUSTOM_SCHEMES_KEY, JSON.stringify(schemes));
  } catch {}
}

export const schemeService = {
  /**
   * Fetch all active government schemes with their required documents.
   * Merges Supabase live records, custom created schemes, and verified defaults.
   */
  async getSchemes(): Promise<GovernmentScheme[]> {
    const custom = getCustomLocalSchemes();
    let baseSchemes: GovernmentScheme[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: schemesData, error: schemesError } = await supabase
          .from('government_schemes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!schemesError && schemesData && schemesData.length > 0) {
          // Fetch documents for all returned schemes
          const schemeIds = schemesData.map(s => s.id);
          const { data: docsData, error: docsError } = await supabase
            .from('scheme_documents')
            .select('*')
            .in('scheme_id', schemeIds)
            .order('display_order', { ascending: true });

          const docsByScheme: Record<string, SchemeDocument[]> = {};
          if (!docsError && docsData) {
            docsData.forEach(d => {
              if (!docsByScheme[d.scheme_id]) docsByScheme[d.scheme_id] = [];
              docsByScheme[d.scheme_id].push(d);
            });
          }

          baseSchemes = schemesData.map(s => ({
            ...s,
            eligibility_criteria: Array.isArray(s.eligibility_criteria)
              ? s.eligibility_criteria
              : typeof s.eligibility_criteria === 'string'
              ? JSON.parse(s.eligibility_criteria)
              : [],
            documents: docsByScheme[s.id] || []
          }));
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to verified seed schemes:', err);
      }
    }

    if (baseSchemes.length === 0) {
      baseSchemes = [...VERIFIED_DEFAULT_SCHEMES];
    }

    // Combine custom schemes and base schemes, deduplicated by ID and slug
    const combined: GovernmentScheme[] = [...custom];
    const seenIds = new Set(custom.map(s => s.id));
    const seenSlugs = new Set(custom.map(s => s.slug));

    for (const s of baseSchemes) {
      if (!seenIds.has(s.id) && !seenSlugs.has(s.slug)) {
        combined.push(s);
        seenIds.add(s.id);
        seenSlugs.add(s.slug);
      }
    }

    return combined;
  },

  /**
   * Add a new Government Scheme to Supabase and local cache
   */
  async addScheme(newScheme: Omit<GovernmentScheme, 'id' | 'created_at' | 'updated_at' | 'slug'> & { id?: string; slug?: string }): Promise<GovernmentScheme> {
    const id = newScheme.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'scheme-' + Date.now());
    const slug = newScheme.slug || newScheme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const schemeToSave: GovernmentScheme = {
      ...newScheme,
      id,
      slug,
      is_active: true,
      created_at: now,
      updated_at: now,
      documents: (newScheme.documents || []).map((doc, i) => ({
        ...doc,
        id: doc.id || `doc-${id}-${i + 1}`,
        scheme_id: id,
        display_order: doc.display_order || i + 1
      }))
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: insertErr } = await supabase
          .from('government_schemes')
          .insert({
            id: schemeToSave.id,
            name: schemeToSave.name,
            slug: schemeToSave.slug,
            description: schemeToSave.description,
            benefits: schemeToSave.benefits,
            department: schemeToSave.department,
            state: schemeToSave.state,
            category: schemeToSave.category,
            eligibility_criteria: schemeToSave.eligibility_criteria,
            application_deadline: schemeToSave.application_deadline,
            official_info_url: schemeToSave.official_info_url,
            official_application_url: schemeToSave.official_application_url,
            is_active: true,
            created_at: now,
            updated_at: now
          });

        if (!insertErr && schemeToSave.documents && schemeToSave.documents.length > 0) {
          const docPayload = schemeToSave.documents.map((d, idx) => ({
            id: d.id,
            scheme_id: id,
            document_name: d.document_name,
            description: d.description || '',
            is_mandatory: d.is_mandatory !== false,
            document_help_url: d.document_help_url || null,
            display_order: d.display_order || idx + 1
          }));
          await supabase.from('scheme_documents').insert(docPayload);
        }
      } catch (err) {
        console.warn('Supabase addScheme notice, fallback to local storage:', err);
      }
    }

    // Save to custom local schemes cache so it persists locally
    const existing = getCustomLocalSchemes().filter(s => s.id !== id && s.slug !== slug);
    existing.unshift(schemeToSave);
    saveCustomLocalSchemes(existing);

    return schemeToSave;
  },

  /**
   * Fetch a single scheme by its ID or slug with documents
   */
  async getSchemeById(idOrSlug: string): Promise<GovernmentScheme | null> {
    const all = await this.getSchemes();
    return all.find(s => s.id === idOrSlug || s.slug === idOrSlug) || null;
  },

  /**
   * Fetch all applications for a farmer, with attached scheme data & checklist progress
   */
  async getFarmerApplications(farmerId: string): Promise<FarmerSchemeApplication[]> {
    if (!farmerId) return [];

    const allSchemes = await this.getSchemes();
    const schemesMap = new Map<string, GovernmentScheme>(allSchemes.map(s => [s.id, s]));

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: appsData, error: appsError } = await supabase
          .from('farmer_scheme_applications')
          .select('*')
          .eq('farmer_id', farmerId);

        if (!appsError && appsData) {
          const appIds = appsData.map(a => a.id);
          let checklistData: any[] = [];
          if (appIds.length > 0) {
            const { data: chkData } = await supabase
              .from('farmer_scheme_checklist')
              .select('*')
              .in('farmer_application_id', appIds);
            checklistData = chkData || [];
          }

          const checklistByApp: Record<string, Record<string, boolean>> = {};
          checklistData.forEach(item => {
            if (!checklistByApp[item.farmer_application_id]) {
              checklistByApp[item.farmer_application_id] = {};
            }
            checklistByApp[item.farmer_application_id][item.scheme_document_id] = item.is_ready;
          });

          return appsData.map(app => ({
            ...app,
            scheme: schemesMap.get(app.scheme_id),
            checklist: checklistByApp[app.id] || {}
          })) as FarmerSchemeApplication[];
        }
      } catch (err) {
        console.warn('Supabase fetch applications fallback:', err);
      }
    }

    // LocalStorage fallback
    const localMap = getLocalApplications(farmerId);
    return Object.values(localMap).map(app => ({
      ...app,
      scheme: schemesMap.get(app.scheme_id) || app.scheme
    })) as FarmerSchemeApplication[];
  },

  /**
   * Get or initialize an application record for a farmer and a scheme
   */
  async getOrCreateApplication(farmerId: string, schemeId: string): Promise<FarmerSchemeApplication> {
    if (!farmerId) throw new Error('Farmer ID is required');

    const allSchemes = await this.getSchemes();
    const targetScheme = allSchemes.find(s => s.id === schemeId);
    if (!targetScheme) throw new Error('Scheme not found');

    if (isSupabaseConfigured && supabase) {
      try {
        // Check if exists
        const { data: existingApp, error: fetchErr } = await supabase
          .from('farmer_scheme_applications')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('scheme_id', schemeId)
          .maybeSingle();

        if (!fetchErr && existingApp) {
          // Fetch checklist
          const { data: chkData } = await supabase
            .from('farmer_scheme_checklist')
            .select('*')
            .eq('farmer_application_id', existingApp.id);

          const checklist: Record<string, boolean> = {};
          (chkData || []).forEach(c => {
            checklist[c.scheme_document_id] = c.is_ready;
          });

          return {
            ...existingApp,
            scheme: targetScheme,
            checklist
          };
        }

        // Create new
        const { data: newApp, error: insertErr } = await supabase
          .from('farmer_scheme_applications')
          .insert({
            farmer_id: farmerId,
            scheme_id: schemeId,
            application_status: 'Preparing Documents',
            status_source: 'Farmer-Reported',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!insertErr && newApp) {
          // Pre-populate checklist rows for scheme documents
          if (targetScheme.documents && targetScheme.documents.length > 0) {
            const checklistInserts = targetScheme.documents.map(doc => ({
              farmer_application_id: newApp.id,
              scheme_document_id: doc.id,
              is_ready: false
            }));
            await supabase.from('farmer_scheme_checklist').insert(checklistInserts);
          }

          return {
            ...newApp,
            scheme: targetScheme,
            checklist: {}
          };
        }
      } catch (err) {
        console.warn('Supabase getOrCreateApplication error, fallback to local:', err);
      }
    }

    // Fallback: LocalStorage
    const localMap = getLocalApplications(farmerId);
    if (localMap[schemeId]) {
      return {
        ...localMap[schemeId],
        scheme: targetScheme
      };
    }

    const newApp: FarmerSchemeApplication = {
      id: `app-${farmerId}-${schemeId}`,
      farmer_id: farmerId,
      scheme_id: schemeId,
      application_status: 'Preparing Documents',
      started_at: new Date().toISOString(),
      status_source: 'Farmer-Reported',
      checklist: {},
      scheme: targetScheme
    };

    localMap[schemeId] = newApp;
    saveLocalApplications(farmerId, localMap);
    return newApp;
  },

  /**
   * Update a specific checklist item for a farmer application
   */
  async updateChecklistItem(
    farmerId: string,
    applicationId: string,
    schemeId: string,
    documentId: string,
    isReady: boolean
  ): Promise<FarmerSchemeApplication> {
    const allSchemes = await this.getSchemes();
    const scheme = allSchemes.find(s => s.id === schemeId);

    if (isSupabaseConfigured && supabase) {
      try {
        // Upsert into farmer_scheme_checklist
        const { error: chkError } = await supabase
          .from('farmer_scheme_checklist')
          .upsert(
            {
              farmer_application_id: applicationId,
              scheme_document_id: documentId,
              is_ready: isReady,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'farmer_application_id,scheme_document_id' }
          );

        if (!chkError) {
          // Fetch current checklist to check if all mandatory items are ready
          const { data: allChk } = await supabase
            .from('farmer_scheme_checklist')
            .select('*')
            .eq('farmer_application_id', applicationId);

          const chkMap: Record<string, boolean> = {};
          (allChk || []).forEach(c => {
            chkMap[c.scheme_document_id] = c.is_ready;
          });

          // Check mandatory documents
          const mandatoryDocs = scheme?.documents?.filter(d => d.is_mandatory) || [];
          const allMandatoryReady = mandatoryDocs.length > 0 && mandatoryDocs.every(d => chkMap[d.id]);

          // Fetch current app status
          const { data: currApp } = await supabase
            .from('farmer_scheme_applications')
            .select('application_status')
            .eq('id', applicationId)
            .single();

          let newStatus = currApp?.application_status || 'Preparing Documents';
          if (newStatus === 'Preparing Documents' && allMandatoryReady) {
            newStatus = 'Ready to Apply';
          } else if (newStatus === 'Ready to Apply' && !allMandatoryReady) {
            newStatus = 'Preparing Documents';
          }

          if (newStatus !== currApp?.application_status) {
            await supabase
              .from('farmer_scheme_applications')
              .update({ application_status: newStatus, updated_at: new Date().toISOString() })
              .eq('id', applicationId);
          }

          return {
            id: applicationId,
            farmer_id: farmerId,
            scheme_id: schemeId,
            application_status: newStatus,
            started_at: new Date().toISOString(),
            status_source: 'Farmer-Reported',
            scheme,
            checklist: chkMap
          };
        }
      } catch (err) {
        console.warn('Supabase updateChecklistItem error, falling back:', err);
      }
    }

    // Local fallback
    const localMap = getLocalApplications(farmerId);
    let app = localMap[schemeId];
    if (!app) {
      app = {
        id: applicationId,
        farmer_id: farmerId,
        scheme_id: schemeId,
        application_status: 'Preparing Documents',
        started_at: new Date().toISOString(),
        status_source: 'Farmer-Reported',
        checklist: {},
        scheme
      };
    }

    if (!app.checklist) app.checklist = {};
    app.checklist[documentId] = isReady;

    const mandatoryDocs = scheme?.documents?.filter(d => d.is_mandatory) || [];
    const allMandatoryReady = mandatoryDocs.length > 0 && mandatoryDocs.every(d => app.checklist?.[d.id]);

    if (app.application_status === 'Preparing Documents' && allMandatoryReady) {
      app.application_status = 'Ready to Apply';
    } else if (app.application_status === 'Ready to Apply' && !allMandatoryReady) {
      app.application_status = 'Preparing Documents';
    }

    app.updated_at = new Date().toISOString();
    localMap[schemeId] = app;
    saveLocalApplications(farmerId, localMap);
    return app;
  },

  /**
   * Reset checklist items for an application
   */
  async resetChecklist(farmerId: string, applicationId: string, schemeId: string): Promise<FarmerSchemeApplication> {
    const allSchemes = await this.getSchemes();
    const scheme = allSchemes.find(s => s.id === schemeId);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('farmer_scheme_checklist')
          .update({ is_ready: false, updated_at: new Date().toISOString() })
          .eq('farmer_application_id', applicationId);

        await supabase
          .from('farmer_scheme_applications')
          .update({
            application_status: 'Preparing Documents',
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        return {
          id: applicationId,
          farmer_id: farmerId,
          scheme_id: schemeId,
          application_status: 'Preparing Documents',
          started_at: new Date().toISOString(),
          status_source: 'Farmer-Reported',
          scheme,
          checklist: {}
        };
      } catch (err) {
        console.warn('Supabase resetChecklist error, fallback:', err);
      }
    }

    // Local fallback
    const localMap = getLocalApplications(farmerId);
    if (localMap[schemeId]) {
      localMap[schemeId].checklist = {};
      if (localMap[schemeId].application_status === 'Ready to Apply') {
        localMap[schemeId].application_status = 'Preparing Documents';
      }
      localMap[schemeId].updated_at = new Date().toISOString();
      saveLocalApplications(farmerId, localMap);
      return localMap[schemeId];
    }

    return {
      id: applicationId,
      farmer_id: farmerId,
      scheme_id: schemeId,
      application_status: 'Preparing Documents',
      started_at: new Date().toISOString(),
      status_source: 'Farmer-Reported',
      scheme,
      checklist: {}
    };
  },

  /**
   * Record self-reported submission by the farmer
   */
  async recordSelfReportedSubmission(
    farmerId: string,
    applicationId: string,
    schemeId: string,
    submissionData: {
      referenceNumber?: string;
      submittedAt: string;
      notes?: string;
    }
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('farmer_scheme_applications')
          .update({
            application_status: 'Applied',
            status_source: 'Farmer-Reported',
            submitted_at: submissionData.submittedAt || new Date().toISOString(),
            reference_number: submissionData.referenceNumber?.trim() || null,
            notes: submissionData.notes?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);
        return;
      } catch (err) {
        console.warn('Supabase recordSelfReportedSubmission fallback:', err);
      }
    }

    // Local fallback
    const localMap = getLocalApplications(farmerId);
    if (localMap[schemeId]) {
      localMap[schemeId].application_status = 'Applied';
      localMap[schemeId].status_source = 'Farmer-Reported';
      localMap[schemeId].submitted_at = submissionData.submittedAt;
      localMap[schemeId].reference_number = submissionData.referenceNumber?.trim();
      localMap[schemeId].notes = submissionData.notes?.trim();
      localMap[schemeId].updated_at = new Date().toISOString();
      saveLocalApplications(farmerId, localMap);
    }
  },

  /**
   * Update application status manually (e.g. self-reported update)
   */
  async updateApplicationStatus(
    farmerId: string,
    applicationId: string,
    schemeId: string,
    status: SchemeApplicationStatus,
    referenceNumber?: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = {
          application_status: status,
          status_source: 'Farmer-Reported',
          updated_at: new Date().toISOString()
        };
        if (referenceNumber !== undefined) {
          updatePayload.reference_number = referenceNumber.trim() || null;
        }

        await supabase
          .from('farmer_scheme_applications')
          .update(updatePayload)
          .eq('id', applicationId);
        return;
      } catch (err) {
        console.warn('Supabase updateApplicationStatus error, fallback:', err);
      }
    }

    // Local fallback
    const localMap = getLocalApplications(farmerId);
    if (localMap[schemeId]) {
      localMap[schemeId].application_status = status;
      if (referenceNumber !== undefined) {
        localMap[schemeId].reference_number = referenceNumber;
      }
      localMap[schemeId].updated_at = new Date().toISOString();
      saveLocalApplications(farmerId, localMap);
    }
  }
};
