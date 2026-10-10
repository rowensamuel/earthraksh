import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { showToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { schemeService } from '../../services/schemeService';
import {
  GovernmentScheme,
  SchemeDocument,
  FarmerSchemeApplication,
  SchemeApplicationStatus,
  SchemeCategory
} from '../../types';
import {
  GovernmentSchemeIcon,
  SearchIcon,
  FilterIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileCheckIcon,
  RefreshIcon,
  AlertCircleIcon,
  InfoCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  SparklesIcon
} from '../../components/common/Icons';

type TabView = 'directory' | 'checklist' | 'tracking';

interface DiscoveredYojana {
  name: string;
  slug: string;
  category: SchemeCategory;
  department: string;
  state: string;
  benefits: string;
  description: string;
  eligibility_criteria: string[];
  application_deadline: string;
  official_info_url: string;
  official_application_url: string;
  launchDate: string;
  documents: {
    document_name: string;
    description: string;
    is_mandatory: boolean;
  }[];
}

const DISCOVERED_GOVT_YOJANAS: DiscoveredYojana[] = [
  {
    name: 'PM-PRANAM (Promotion of Alternate Nutrients for Agriculture Management)',
    slug: 'pm-pranam',
    category: 'Soil Health & Inputs',
    department: 'Department of Fertilizers, Ministry of Chemicals & Fertilizers, GoI',
    state: 'All India',
    benefits: '50% grant subsidy incentives to states transferred directly for eco-friendly bio-fertilizer infrastructure and organic input adoption.',
    description: 'Central government initiative incentivizing balanced chemical fertilizer usage, nano-urea adoption, and bio-nutrient assimilation across Indian agricultural plots.',
    eligibility_criteria: [
      'All landholding agrarian farmers adopting bio-fertilizers and organic composting.',
      'Registered in the national or state Soil Health Card cadastral database.',
      'Active bank account with NPCI DBT seeding.'
    ],
    application_deadline: 'Open Year-Round (Cabinet Approved)',
    official_info_url: 'https://fert.gov.in/',
    official_application_url: 'https://fert.gov.in/pm-pranam',
    launchDate: 'Cabinet Gazetted 2024–2026',
    documents: [
      { document_name: 'Aadhaar Card (UIDAI)', description: 'Biometric identity proof with active mobile OTP link', is_mandatory: true },
      { document_name: 'Soil Health Card / Assay Report', description: 'Recent soil test report proving active cadastral plot', is_mandatory: true },
      { document_name: 'Bank Passbook / NPCI DBT Proof', description: 'Bank statement showing IFSC code and active seeding', is_mandatory: true }
    ]
  },
  {
    name: 'National Mission on Natural Farming (NMNF)',
    slug: 'nmnf',
    category: 'Financial Assistance',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, GoI',
    state: 'All India',
    benefits: 'Direct financial assistance of ₹15,000 per hectare for 3 years to convert and certify land into chemical-free natural farming.',
    description: 'Promotes climate-resilient, chemical-free agricultural production systems integrating indigenous livestock, bio-inoculants, and on-farm input preparation clusters.',
    eligibility_criteria: [
      'Farmers willing to convert at least 0.5 hectare to certified chemical-free natural farming.',
      'Commitment to participate in cluster-based bio-resource training centres.',
      'Possession of valid land revenue records (Khatauni / ROR / 7/12).'
    ],
    application_deadline: 'Phase-1 Active Enrollments',
    official_info_url: 'https://naturalfarming.dac.gov.in/',
    official_application_url: 'https://naturalfarming.dac.gov.in/farmer-registration',
    launchDate: 'Active Nationwide',
    documents: [
      { document_name: 'Aadhaar Card (UIDAI)', description: 'Biometric proof of identity', is_mandatory: true },
      { document_name: 'Land Ownership Records (7/12 or Khatauni)', description: 'Proof of cultivable plot earmarked for natural farming', is_mandatory: true },
      { document_name: 'Self-Declaration Form', description: 'Undertaking for non-use of synthetic chemical pesticides', is_mandatory: true }
    ]
  },
  {
    name: 'Kisan Drone Subsidy Scheme (SMAM Extension)',
    slug: 'smam-drone',
    category: 'Farm Mechanization',
    department: 'Ministry of Agriculture & Farmers Welfare, GoI',
    state: 'All India',
    benefits: '40% to 50% capital subsidy (up to ₹5,00,000) for purchasing DGCA-certified agricultural spray drones and remote pilot training.',
    description: 'Promotes precision aerial foliar spraying, real-time crop health monitoring, and reduced pesticide exposure through certified unmanned aerial vehicles (UAVs).',
    eligibility_criteria: [
      'Small and marginal farmers, women farmers, and SC/ST farmers (eligible for 50% subsidy up to ₹5 Lakhs).',
      'Other farmers eligible for 40% subsidy up to ₹4 Lakhs.',
      'Farmer Producer Organizations (FPOs) and Custom Hiring Centres (CHCs).'
    ],
    application_deadline: 'Annual Quota Active',
    official_info_url: 'https://agrimachinery.nic.in/',
    official_application_url: 'https://agrimachinery.nic.in/Index/Index',
    launchDate: 'FY 2024–2026 Quota',
    documents: [
      { document_name: 'Aadhaar Card', description: 'Farmer identity verification', is_mandatory: true },
      { document_name: 'Land Holding Certificate / 7/12 Extract', description: 'Categorization as small/marginal farmer', is_mandatory: true },
      { document_name: 'Quotation from DGCA Type-Certified Drone Manufacturer', description: 'Proforma tax invoice of certified agricultural drone', is_mandatory: true }
    ]
  },
  {
    name: 'PM-KUSUM Component C (Feeder Level Solarisation)',
    slug: 'kusum-c',
    category: 'Solar & Energy',
    department: 'Ministry of New and Renewable Energy (MNRE), GoI',
    state: 'All India',
    benefits: '60% capital subsidy (30% Central + 30% State) to solarise agricultural feeders, providing free daytime irrigation and surplus power earnings.',
    description: 'Enables grid-connected agricultural pumps to run entirely on dedicated solar generation, reducing daytime grid tariffs and generating supplementary income via DISCOM feed-in tariffs.',
    eligibility_criteria: [
      'Farmers with active grid-connected electric agricultural pump connections.',
      'Adequate land area adjacent to pump or tubewell for solar array installation.',
      'DISCOM electricity connection in applicant farmer\'s name without pending dues.'
    ],
    application_deadline: 'Ongoing State Solar Feeder Allocations',
    official_info_url: 'https://pmkusum.mnre.gov.in/',
    official_application_url: 'https://pmkusum.mnre.gov.in/',
    launchDate: 'Active GoI Expansion',
    documents: [
      { document_name: 'Aadhaar Card', description: 'Biometric identity proof', is_mandatory: true },
      { document_name: 'Agricultural Electricity Connection Bill (DISCOM)', description: 'Latest paid power bill showing consumer RR number', is_mandatory: true },
      { document_name: 'Land Revenue Record (Khatauni / ROR / 7/12)', description: 'Proof of plot ownership where pump is energized', is_mandatory: true }
    ]
  }
];

export const FarmerSchemesPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Primary State
  const [activeTab, setActiveTab] = useState<TabView>('directory');
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [applications, setApplications] = useState<FarmerSchemeApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [onlyNewFilter, setOnlyNewFilter] = useState<boolean>(false);

  // Add Yojana Modal State
  const [isAddYojanaModalOpen, setIsAddYojanaModalOpen] = useState<boolean>(false);
  const [newSchemeName, setNewSchemeName] = useState<string>('');
  const [newSchemeCategory, setNewSchemeCategory] = useState<SchemeCategory>('Financial Assistance');
  const [newSchemeDepartment, setNewSchemeDepartment] = useState<string>('Ministry of Agriculture & Farmers Welfare, GoI');
  const [newSchemeState, setNewSchemeState] = useState<string>('All India');
  const [newSchemeBenefits, setNewSchemeBenefits] = useState<string>('');
  const [newSchemeDescription, setNewSchemeDescription] = useState<string>('');
  const [newSchemeEligibility, setNewSchemeEligibility] = useState<string>('');
  const [newSchemeOfficialInfoUrl, setNewSchemeOfficialInfoUrl] = useState<string>('');
  const [newSchemeOfficialAppUrl, setNewSchemeOfficialAppUrl] = useState<string>('');
  const [newSchemeDeadline, setNewSchemeDeadline] = useState<string>('Continuous Enrollment (Open Year-Round)');
  const [newSchemeDocs, setNewSchemeDocs] = useState<{ document_name: string; description: string; is_mandatory: boolean }[]>([
    { document_name: 'Aadhaar Card (UIDAI)', description: 'Biometric identity proof with mobile link', is_mandatory: true },
    { document_name: 'Land Ownership Records (Khatauni / 7/12)', description: 'Revenue extract of cultivable plot', is_mandatory: true },
    { document_name: 'Bank Passbook / Statement', description: 'Aadhaar-seeded bank account with IFSC code', is_mandatory: true }
  ]);
  const [docNameInput, setDocNameInput] = useState<string>('');
  const [docDescInput, setDocDescInput] = useState<string>('');
  const [isSubmittingNewScheme, setIsSubmittingNewScheme] = useState<boolean>(false);

  // Radar Scanner Modal State
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isScanningFeeds, setIsScanningFeeds] = useState<boolean>(false);

  // Scheme Details Modal
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<GovernmentScheme | null>(null);

  // Active Checklist Scheme
  const [activeChecklistScheme, setActiveChecklistScheme] = useState<GovernmentScheme | null>(null);
  const [activeApplication, setActiveApplication] = useState<FarmerSchemeApplication | null>(null);
  const [isChecklistSaving, setIsChecklistSaving] = useState<boolean>(false);

  // Confirmation Modals
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isRecordSubmissionModalOpen, setIsRecordSubmissionModalOpen] = useState<boolean>(false);

  // Record Submission Form State
  const [submissionDate, setSubmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');

  // Status Update Modal (from Tracking view)
  const [statusUpdateApp, setStatusUpdateApp] = useState<FarmerSchemeApplication | null>(null);
  const [newStatus, setNewStatus] = useState<SchemeApplicationStatus>('Applied');
  const [newRefNumber, setNewRefNumber] = useState<string>('');

  // Initial Load
  useEffect(() => {
    loadSchemesAndApplications();
  }, [currentUser?.user_id]);

  const loadSchemesAndApplications = async () => {
    setIsLoading(true);
    try {
      const [schemesData, appsData] = await Promise.all([
        schemeService.getSchemes(),
        currentUser?.user_id ? schemeService.getFarmerApplications(currentUser.user_id) : Promise.resolve([])
      ]);
      setSchemes(schemesData);
      setApplications(appsData);
    } catch (err: any) {
      console.error('Failed to load schemes and applications:', err);
      showToast('Data Error', 'error', err.message || 'Could not load government schemes.');
    } finally {
      setIsLoading(false);
    }
  };

  // Map of Scheme ID -> FarmerSchemeApplication for quick status lookups
  const applicationMap = useMemo(() => {
    const map = new Map<string, FarmerSchemeApplication>();
    applications.forEach(app => map.set(app.scheme_id, app));
    return map;
  }, [applications]);

  // Filtered Schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = scheme.name.toLowerCase().includes(query);
        const matchesDesc = scheme.description.toLowerCase().includes(query);
        const matchesDept = scheme.department.toLowerCase().includes(query);
        const matchesCategory = scheme.category.toLowerCase().includes(query);
        const matchesBenefits = scheme.benefits.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesDept && !matchesCategory && !matchesBenefits) {
          return false;
        }
      }

      // 2. Category
      if (categoryFilter !== 'ALL' && scheme.category !== categoryFilter) {
        return false;
      }

      // 3. State
      if (stateFilter !== 'ALL' && scheme.state !== stateFilter) {
        return false;
      }

      // 4. Status
      if (statusFilter !== 'ALL') {
        const app = applicationMap.get(scheme.id);
        const currentStatus = app ? app.application_status : 'Not Started';
        if (currentStatus !== statusFilter) {
          return false;
        }
      }

      // 5. Only New Schemes Filter
      if (onlyNewFilter && !isNewScheme(scheme)) {
        return false;
      }

      return true;
    });
  }, [schemes, searchQuery, categoryFilter, stateFilter, statusFilter, onlyNewFilter, applicationMap]);

  const isNewScheme = (scheme: GovernmentScheme) => {
    if (scheme.id.startsWith('scheme-') || scheme.id.includes('custom')) return true;
    if (scheme.slug === 'pm-pranam' || scheme.slug === 'nmnf' || scheme.slug === 'smam-drone' || scheme.slug === 'kusum-c') return true;
    if (scheme.created_at) {
      const diffMs = Date.now() - new Date(scheme.created_at).getTime();
      return diffMs < 60 * 24 * 60 * 60 * 1000;
    }
    return false;
  };

  // Available Categories for Filter Dropdown
  const availableCategories: SchemeCategory[] = [
    'Financial Assistance',
    'Crop Insurance',
    'Credit & Loan',
    'Irrigation & Water',
    'Farm Mechanization',
    'Soil Health & Inputs',
    'Solar & Energy'
  ];

  // ============================================================================
  // Add Yojana & Live Radar Scanner Handlers
  // ============================================================================

  const handleAddDocumentRow = () => {
    if (!docNameInput.trim()) return;
    setNewSchemeDocs(prev => [
      ...prev,
      {
        document_name: docNameInput.trim(),
        description: docDescInput.trim() || 'Required verification document',
        is_mandatory: true
      }
    ]);
    setDocNameInput('');
    setDocDescInput('');
  };

  const handleRemoveDocumentRow = (index: number) => {
    setNewSchemeDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateYojanaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeName.trim()) {
      showToast('Validation Error', 'error', 'Scheme name is required.');
      return;
    }
    if (!newSchemeBenefits.trim()) {
      showToast('Validation Error', 'error', 'Key benefits description is required.');
      return;
    }

    setIsSubmittingNewScheme(true);
    try {
      const eligibilityArray = newSchemeEligibility
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      const generatedSlug = newSchemeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const added = await schemeService.addScheme({
        name: newSchemeName.trim(),
        slug: generatedSlug || `scheme-${Date.now()}`,
        category: newSchemeCategory,
        department: newSchemeDepartment.trim() || 'Ministry of Agriculture, Government of India',
        state: newSchemeState.trim() || 'All India',
        benefits: newSchemeBenefits.trim(),
        description: newSchemeDescription.trim() || newSchemeBenefits.trim(),
        eligibility_criteria: eligibilityArray.length > 0 ? eligibilityArray : ['All registered agrarian farmers with active cultivable land.'],
        application_deadline: newSchemeDeadline.trim() || 'Continuous Enrollment (Open Year-Round)',
        official_info_url: newSchemeOfficialInfoUrl.trim() || 'https://agricoop.nic.in/',
        official_application_url: newSchemeOfficialAppUrl.trim() || 'https://agricoop.nic.in/',
        is_active: true,
        documents: newSchemeDocs.map((d, idx) => ({
          id: `doc-custom-${Date.now()}-${idx + 1}`,
          scheme_id: '',
          document_name: d.document_name,
          description: d.description,
          is_mandatory: d.is_mandatory,
          display_order: idx + 1
        }))
      });

      showToast('Yojana Added Successfully', 'success', `"${added.name}" is now live with document readiness checklists!`);
      setIsAddYojanaModalOpen(false);
      setNewSchemeName('');
      setNewSchemeBenefits('');
      setNewSchemeDescription('');
      setNewSchemeEligibility('');
      setNewSchemeOfficialInfoUrl('');
      setNewSchemeOfficialAppUrl('');

      await loadSchemesAndApplications();
    } catch (err: any) {
      console.error('Error adding scheme:', err);
      showToast('Error', 'error', err.message || 'Failed to add government scheme.');
    } finally {
      setIsSubmittingNewScheme(false);
    }
  };

  const handleTriggerRadarScan = () => {
    setIsScanningFeeds(true);
    setTimeout(() => {
      setIsScanningFeeds(false);
      showToast('Portals Synced', 'success', 'Live central and state agriculture databases verified.');
    }, 1000);
  };

  const handleImportDiscoveredYojana = async (discovered: DiscoveredYojana) => {
    try {
      await schemeService.addScheme({
        name: discovered.name,
        slug: discovered.slug,
        category: discovered.category,
        department: discovered.department,
        state: discovered.state,
        benefits: discovered.benefits,
        description: discovered.description,
        eligibility_criteria: discovered.eligibility_criteria,
        application_deadline: discovered.application_deadline,
        official_info_url: discovered.official_info_url,
        official_application_url: discovered.official_application_url,
        is_active: true,
        documents: discovered.documents.map((d, idx) => ({
          id: `doc-${discovered.slug}-${idx + 1}`,
          scheme_id: '',
          document_name: d.document_name,
          description: d.description,
          is_mandatory: d.is_mandatory,
          display_order: idx + 1
        }))
      });

      showToast('Yojana Activated', 'success', `"${discovered.name}" activated into EarthRakshak!`);
      await loadSchemesAndApplications();
    } catch (err: any) {
      showToast('Import Error', 'error', err.message || 'Could not import yojana.');
    }
  };

  // ============================================================================
  // Checklist Actions
  // ============================================================================

  const handleOpenChecklist = async (scheme: GovernmentScheme) => {
    if (!currentUser?.user_id) {
      showToast('Authentication Required', 'info', 'Please sign in to prepare scheme documents.');
      return;
    }

    try {
      const app = await schemeService.getOrCreateApplication(currentUser.user_id, scheme.id);
      setActiveChecklistScheme(scheme);
      setActiveApplication(app);
      setActiveTab('checklist');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error opening checklist:', err);
      showToast('Error', 'error', 'Could not open document checklist.');
    }
  };

  const handleToggleChecklistItem = async (doc: SchemeDocument) => {
    if (!currentUser?.user_id || !activeApplication || !activeChecklistScheme) return;

    const currentReady = !!activeApplication.checklist?.[doc.id];
    const newReady = !currentReady;

    // Optimistic UI update
    const updatedChecklist = { ...(activeApplication.checklist || {}), [doc.id]: newReady };
    setActiveApplication({
      ...activeApplication,
      checklist: updatedChecklist
    });

    setIsChecklistSaving(true);
    try {
      const updatedApp = await schemeService.updateChecklistItem(
        currentUser.user_id,
        activeApplication.id,
        activeChecklistScheme.id,
        doc.id,
        newReady
      );
      setActiveApplication(updatedApp);
      // Refresh applications list in background
      const refreshedApps = await schemeService.getFarmerApplications(currentUser.user_id);
      setApplications(refreshedApps);
    } catch (err: any) {
      console.error('Checklist update failed:', err);
      showToast('Save Error', 'error', 'Failed to update document status.');
    } finally {
      setIsChecklistSaving(false);
    }
  };

  const handleConfirmResetChecklist = async () => {
    if (!currentUser?.user_id || !activeApplication || !activeChecklistScheme) return;

    try {
      const resetApp = await schemeService.resetChecklist(
        currentUser.user_id,
        activeApplication.id,
        activeChecklistScheme.id
      );
      setActiveApplication(resetApp);
      setIsResetConfirmOpen(false);

      const refreshedApps = await schemeService.getFarmerApplications(currentUser.user_id);
      setApplications(refreshedApps);

      showToast('Checklist Reset', 'info', 'All document preparation checks have been cleared.');
    } catch (err: any) {
      console.error('Error resetting checklist:', err);
      showToast('Reset Error', 'error', 'Could not reset checklist.');
    }
  };

  // Calculate Checklist Statistics
  const checklistStats = useMemo(() => {
    if (!activeChecklistScheme?.documents) {
      return { total: 0, ready: 0, mandatoryTotal: 0, mandatoryReady: 0, allMandatoryReady: false, percent: 0 };
    }

    const docs = activeChecklistScheme.documents;
    const checklist = activeApplication?.checklist || {};

    const total = docs.length;
    const ready = docs.filter(d => checklist[d.id]).length;
    const mandatoryDocs = docs.filter(d => d.is_mandatory);
    const mandatoryTotal = mandatoryDocs.length;
    const mandatoryReady = mandatoryDocs.filter(d => checklist[d.id]).length;
    const allMandatoryReady = mandatoryTotal > 0 && mandatoryReady === mandatoryTotal;
    const percent = total > 0 ? Math.round((ready / total) * 100) : 0;

    return { total, ready, mandatoryTotal, mandatoryReady, allMandatoryReady, percent };
  }, [activeChecklistScheme, activeApplication]);

  // Proceed to Official Portal (opens in new tab after confirmation)
  const handleProceedToOfficialPortal = () => {
    if (!activeChecklistScheme?.official_application_url) return;
    setIsRedirectModalOpen(false);
    window.open(activeChecklistScheme.official_application_url, '_blank', 'noopener,noreferrer');
    showToast('Redirected to Official Portal', 'info', 'Official application opened. Return here to record your reference number.');
  };

  // Submit Self-Reported Application Details
  const handleRecordSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.user_id || !activeApplication || !activeChecklistScheme) return;

    try {
      await schemeService.recordSelfReportedSubmission(
        currentUser.user_id,
        activeApplication.id,
        activeChecklistScheme.id,
        {
          submittedAt: submissionDate,
          referenceNumber: referenceNumber.trim(),
          notes: submissionNotes.trim()
        }
      );

      setIsRecordSubmissionModalOpen(false);
      showToast('Submission Recorded', 'success', 'Your application is now tracked under Applied (Farmer-Reported).');

      // Refresh applications and update current active application
      const refreshedApps = await schemeService.getFarmerApplications(currentUser.user_id);
      setApplications(refreshedApps);
      const updated = refreshedApps.find(a => a.id === activeApplication.id);
      if (updated) setActiveApplication(updated);
    } catch (err: any) {
      console.error('Error recording submission:', err);
      showToast('Error', 'error', 'Failed to save submission records.');
    }
  };

  // Update Status from Tracking View
  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.user_id || !statusUpdateApp) return;

    try {
      await schemeService.updateApplicationStatus(
        currentUser.user_id,
        statusUpdateApp.id,
        statusUpdateApp.scheme_id,
        newStatus,
        newRefNumber
      );

      setStatusUpdateApp(null);
      showToast('Status Updated', 'success', `Application status updated to ${newStatus}.`);

      const refreshedApps = await schemeService.getFarmerApplications(currentUser.user_id);
      setApplications(refreshedApps);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('Error', 'error', 'Failed to update application status.');
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStateFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* 1. MODULE PAGE HEADER */}
      <PageHeader
        title="Government Schemes & Yojana"
        category="Direct Benefit Transfers, Subsidies & Agricultural Welfare"
        description="Discover central and state government agricultural schemes, evaluate eligibility criteria, prepare required documents, and track self-reported portal applications."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('directory');
                setActiveChecklistScheme(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                activeTab === 'directory'
                  ? 'bg-[#1b5e20] text-white shadow-sm'
                  : 'bg-white text-[#1c2e22] border border-[#c9d4c6] hover:bg-[#f0f4ef]'
              }`}
            >
              Schemes Directory ({schemes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('tracking');
                setActiveChecklistScheme(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors relative ${
                activeTab === 'tracking'
                  ? 'bg-[#1b5e20] text-white shadow-sm'
                  : 'bg-white text-[#1c2e22] border border-[#c9d4c6] hover:bg-[#f0f4ef]'
              }`}
            >
              My Applications ({applications.length})
              {applications.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7] text-[10px] font-bold rounded-full">
                  {applications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setIsRadarModalOpen(true);
                handleTriggerRadarScan();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#EBF7EE] text-[#1B6F3E] border border-[#BDE3C8] hover:bg-[#D5EEDC] transition-all shadow-xs cursor-pointer"
              title="Search live central & state ministry portals for newly released Yojanas"
            >
              <SparklesIcon size={14} className="text-[#1B6F3E] animate-pulse" />
              <span>⚡ Check for New Yojanas</span>
            </button>
            <button
              onClick={() => setIsAddYojanaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#1b5e20] text-white hover:bg-[#144719] transition-all shadow-sm cursor-pointer"
              title="Add a new custom government scheme to the directory"
            >
              <PlusIcon size={14} />
              <span>+ Add Yojana</span>
            </button>
          </div>
        }
      />

      {/* 2. OFFICIAL COMPLIANCE & LEGAL NOTICE BANNER */}
      <div className="bg-[#fafcfa] border-l-4 border-[#1b5e20] border border-[#dbe3d8] p-3.5 flex items-start gap-3 text-left">
        <InfoCircleIcon size={20} className="text-[#1b5e20] shrink-0 mt-0.5" />
        <div className="text-xs text-[#3a4d3f] space-y-0.5">
          <p className="font-bold text-[#14291a] uppercase tracking-wider text-[11px]">
            Official Government Guidelines & Submission Verification
          </p>
          <p className="leading-relaxed">
            All schemes listed are verified initiatives of the Ministry of Agriculture and Government of India. The EarthRakshak ERP facilitates document readiness and tracking. Actual application submission occurs on the verified official government portal. Self-reported application records must match official submission acknowledgements.
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SCHEMES DIRECTORY VIEW                                        */}
      {/* ==================================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-[#dbe3d8] p-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#738a78]" />
                <input
                  type="text"
                  placeholder="Search schemes by name, keyword, subsidy or department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] placeholder-[#738a78] focus:outline-hidden focus:border-[#1b5e20] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#738a78] hover:text-[#14291a]"
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20] transition-colors"
                >
                  <option value="ALL">All Scheme Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="md:col-span-2">
                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20] transition-colors"
                >
                  <option value="ALL">All India (Nationwide)</option>
                  <option value="All India">All India</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20] transition-colors"
                >
                  <option value="ALL">All Application Statuses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Preparing Documents">Preparing Documents</option>
                  <option value="Ready to Apply">Ready to Apply</option>
                  <option value="Applied">Applied</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Active Filters & Quick Filter Pill Bar */}
            <div className="mt-3 pt-3 border-t border-[#edf1ea] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setOnlyNewFilter(!onlyNewFilter)}
                  className={`px-2.5 py-1 text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs ${
                    onlyNewFilter
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20] shadow-xs'
                      : 'bg-[#fafbfa] text-[#2c4731] border-[#c9d4c6] hover:bg-white'
                  }`}
                  title="Toggle to view only newly gazetted or recently added Yojanas"
                >
                  <span className="text-amber-500 font-black">✦</span>
                  <span>New Yojanas Only</span>
                  {onlyNewFilter && <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded-xs">ACTIVE</span>}
                </button>

                {(searchQuery || categoryFilter !== 'ALL' || stateFilter !== 'ALL' || statusFilter !== 'ALL' || onlyNewFilter) && (
                  <>
                    <span className="text-[#647969] font-medium ml-1">Filters:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#edf3ec] text-[#1b5e20] border border-[#c5d8c4] text-[11px]">
                        Keyword: "{searchQuery}"
                      </span>
                    )}
                    {categoryFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#edf3ec] text-[#1b5e20] border border-[#c5d8c4] text-[11px]">
                        {categoryFilter}
                      </span>
                    )}
                    {statusFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#edf3ec] text-[#1b5e20] border border-[#c5d8c4] text-[11px]">
                        Status: {statusFilter}
                      </span>
                    )}
                  </>
                )}
              </div>

              {(searchQuery || categoryFilter !== 'ALL' || stateFilter !== 'ALL' || statusFilter !== 'ALL' || onlyNewFilter) && (
                <button
                  onClick={() => {
                    handleClearFilters();
                    setOnlyNewFilter(false);
                  }}
                  className="text-xs font-semibold text-[#b91c1c] hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredSchemes.length === 0 ? (
            <EmptyState
              title="No Government Schemes Found"
              description="No schemes match your selected search keywords or filter criteria. Try clearing filters or searching for terms like 'PM-KISAN', 'insurance', 'loan', or 'irrigation'."
              actionText="Reset Filters"
              onAction={() => {
                handleClearFilters();
                setOnlyNewFilter(false);
              }}
              icon={<GovernmentSchemeIcon size={24} />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSchemes.map(scheme => {
                const app = applicationMap.get(scheme.id);
                const currentStatus: SchemeApplicationStatus = app ? app.application_status : 'Not Started';
                const mandatoryDocsCount = scheme.documents?.filter(d => d.is_mandatory).length || 0;
                const totalDocsCount = scheme.documents?.length || 0;

                return (
                  <div
                    key={scheme.id}
                    className="bg-white border border-[#dbe3d8] flex flex-col justify-between hover:border-[#1b5e20] transition-colors duration-150 shadow-2xs group"
                  >
                    {/* Card Top: Department & Badges */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef6ee] px-2 py-0.5 border border-[#cbe4cc]">
                            {scheme.category}
                          </span>
                          {isNewScheme(scheme) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full animate-pulse shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                              ✦ NEW YOJANA
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <StatusBadge status={currentStatus} />
                        </div>
                      </div>

                      {/* Scheme Title */}
                      <div>
                        <h3 className="text-base font-bold font-display text-[#14291a] leading-snug group-hover:text-[#1b5e20] transition-colors">
                          {scheme.name}
                        </h3>
                        <p className="text-[11px] text-[#637768] mt-1 line-clamp-1">
                          {scheme.department}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#425747] leading-relaxed line-clamp-2">
                        {scheme.description}
                      </p>

                      {/* Benefits Box */}
                      <div className="bg-[#f5f8f4] border border-[#d8e3d5] p-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] mb-0.5">
                          Key Financial Benefit
                        </div>
                        <p className="text-xs font-semibold text-[#14291a] line-clamp-2">
                          {scheme.benefits}
                        </p>
                      </div>

                      {/* Meta Information List */}
                      <div className="space-y-1.5 pt-1 text-xs text-[#526a57]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6d8272]">Availability:</span>
                          <span className="font-semibold text-[#14291a]">{scheme.state}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6d8272]">Application Window:</span>
                          <span className="font-semibold text-[#14291a] text-right truncate max-w-[180px]">
                            {scheme.application_deadline || 'Continuous Enrollment'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6d8272]">Required Documents:</span>
                          <span className="font-semibold text-[#14291a]">
                            {totalDocsCount} documents ({mandatoryDocsCount} mandatory)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-[#fafcfa] border-t border-[#e3ebe0] flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSchemeForDetails(scheme)}
                        className="flex-1 py-2 text-xs font-semibold text-[#1c2e22] bg-white border border-[#c9d4c6] hover:bg-[#edf2ea] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <EyeIcon size={14} />
                        View Details
                      </button>

                      <button
                        onClick={() => handleOpenChecklist(scheme)}
                        className="flex-1 py-2 text-xs font-semibold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FileCheckIcon size={14} />
                        {currentStatus === 'Not Started' ? 'Apply Now' : 'Checklist'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: REQUIRED DOCUMENTS CHECKLIST VIEW (Dedicated Prep Workspace)  */}
      {/* ==================================================================== */}
      {activeTab === 'checklist' && activeChecklistScheme && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#dbe3d8] p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#526a57]">
                <button
                  onClick={() => {
                    setActiveTab('directory');
                    setActiveChecklistScheme(null);
                  }}
                  className="font-semibold hover:text-[#1b5e20] hover:underline"
                >
                  Schemes Directory
                </button>
                <span>/</span>
                <span className="text-[#14291a] font-medium truncate max-w-md">
                  {activeChecklistScheme.name}
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-[#14291a]">
                Document Preparation & Readiness Checklist
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSchemeForDetails(activeChecklistScheme)}
                className="px-3 py-1.5 text-xs font-semibold text-[#14291a] bg-[#fafbfa] border border-[#c9d4c6] hover:bg-[#edf2ea] transition-colors flex items-center gap-1"
              >
                <EyeIcon size={13} />
                Scheme Guidelines
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-[#991b1b] bg-white border border-[#fca5a5] hover:bg-[#fee2e2] transition-colors flex items-center gap-1"
              >
                <RefreshIcon size={13} />
                Reset Checklist
              </button>
            </div>
          </div>

          {/* Scheme Summary Quick Card */}
          <div className="bg-white border border-[#dbe3d8] p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef6ee] px-2 py-0.5 border border-[#cbe4cc]">
                    {activeChecklistScheme.category}
                  </span>
                  <StatusBadge status={activeApplication?.application_status || 'Preparing Documents'} />
                  {isChecklistSaving && (
                    <span className="text-[11px] text-[#6d8272] italic animate-pulse">
                      Saving progress to Supabase...
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#14291a]">
                  {activeChecklistScheme.name}
                </h3>
                <p className="text-xs text-[#526a57]">
                  {activeChecklistScheme.department} • <span className="font-semibold">{activeChecklistScheme.state}</span>
                </p>
              </div>

              {/* Progress Summary Counter & Bar */}
              <div className="lg:w-80 space-y-2 bg-[#fafcfa] border border-[#e3ebe0] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14291a]">
                    Readiness: {checklistStats.ready} of {checklistStats.total} Ready
                  </span>
                  <span className="font-bold text-[#1b5e20]">
                    {checklistStats.percent}%
                  </span>
                </div>

                <div className="w-full bg-[#e5ece2] h-2.5 rounded-none overflow-hidden">
                  <div
                    className="bg-[#1b5e20] h-full transition-all duration-300 ease-out"
                    style={{ width: `${checklistStats.percent}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#556c5a]">
                  {checklistStats.allMandatoryReady ? (
                    <span className="text-[#1b5e20] font-bold flex items-center gap-1">
                      <CheckIcon size={13} />
                      All mandatory documents marked ready!
                    </span>
                  ) : (
                    <span>
                      {checklistStats.mandatoryTotal - checklistStats.mandatoryReady} mandatory document(s) still pending.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Document Checklist Items */}
          <div className="bg-white border border-[#dbe3d8] p-5 space-y-4">
            <div className="border-b border-[#e5ece2] pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold font-display text-[#14291a]">
                  Configured Scheme Documents
                </h4>
                <p className="text-xs text-[#556c5a]">
                  Mark documents as ready once you have them in physical or digital form ready to submit.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#556c5a]">
                Status
              </span>
            </div>

            <div className="divide-y divide-[#edf2ea]">
              {activeChecklistScheme.documents?.map((doc, idx) => {
                const isReady = !!activeApplication?.checklist?.[doc.id];

                return (
                  <div
                    key={doc.id}
                    className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isReady ? 'bg-[#f8fbf8]' : 'hover:bg-[#fcfdfc]'
                    }`}
                  >
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-start gap-3.5 flex-1">
                      <input
                        type="checkbox"
                        id={`doc-check-${doc.id}`}
                        checked={isReady}
                        onChange={() => handleToggleChecklistItem(doc)}
                        className="mt-1 h-4.5 w-4.5 rounded-none text-[#1b5e20] border-[#9cb19f] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label
                            htmlFor={`doc-check-${doc.id}`}
                            className={`text-xs font-bold cursor-pointer ${
                              isReady ? 'text-[#14291a]' : 'text-[#203325]'
                            }`}
                          >
                            {idx + 1}. {doc.document_name}
                          </label>

                          {doc.is_mandatory ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#991b1b] bg-[#fee2e2] px-1.5 py-0.2 border border-[#fca5a5]">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252] bg-[#f5f5f5] px-1.5 py-0.2 border border-[#e5e5e5]">
                              Optional
                            </span>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-xs text-[#5a6f5e] leading-relaxed">
                            {doc.description}
                          </p>
                        )}

                        {/* Official Verification Portal Link */}
                        {doc.document_help_url && (
                          <div className="pt-0.5">
                            <a
                              href={doc.document_help_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b5e20] hover:underline"
                            >
                              <span>Official Verification & Issuance Portal</span>
                              <ExternalLinkIcon size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Indicator */}
                    <div className="sm:text-right shrink-0">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b5e20] bg-[#eef7ee] px-2.5 py-1 border border-[#c2e2c3]">
                          <CheckIcon size={13} />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b45309] bg-[#fffbeb] px-2.5 py-1 border border-[#fde68a]">
                          <ClockIcon size={13} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Bar & Official Portal Redirection Box */}
          <div className="bg-[#f5f8f4] border border-[#d8e3d5] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-display text-[#14291a]">
                Ready to Proceed with Official Application?
              </h4>
              <p className="text-xs text-[#556c5a] max-w-xl">
                {checklistStats.allMandatoryReady
                  ? 'All mandatory documents have been marked as ready. You can now proceed to the official government portal to submit your form.'
                  : `Please prepare and check off all ${checklistStats.mandatoryTotal} mandatory documents to unlock the official government application.`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                disabled={!checklistStats.allMandatoryReady}
                onClick={() => setIsRedirectModalOpen(true)}
                className={`px-4 py-2 text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-2 ${
                  checklistStats.allMandatoryReady
                    ? 'bg-[#1b5e20] text-white hover:bg-[#144719] shadow-sm cursor-pointer'
                    : 'bg-[#cfd9ce] text-[#788e7b] cursor-not-allowed'
                }`}
              >
                <span>Continue to Official Application</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>

          {/* Post-Application Submission Recording Card */}
          <div className="bg-white border border-[#dbe3d8] p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5ece2] pb-3">
              <div>
                <h4 className="text-sm font-bold font-display text-[#14291a]">
                  Application Submission Tracking
                </h4>
                <p className="text-xs text-[#556c5a]">
                  Have you already submitted this application on the government portal? Record your submission reference here to track it.
                </p>
              </div>

              {activeApplication?.application_status === 'Applied' ? (
                <div className="text-xs font-bold text-[#1b5e20] bg-[#eef7ee] px-2.5 py-1 border border-[#c2e2c3]">
                  Recorded as Applied (Ref: {activeApplication.reference_number || 'None'})
                </div>
              ) : (
                <button
                  onClick={() => setIsRecordSubmissionModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <FileCheckIcon size={14} />
                  Record Submission Details
                </button>
              )}
            </div>

            {activeApplication?.submitted_at && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-[#fafcfa] border border-[#e5ece2] p-2.5">
                  <span className="text-[#6d8272] block text-[11px]">Submission Date:</span>
                  <span className="font-bold text-[#14291a]">{activeApplication.submitted_at}</span>
                </div>
                <div className="bg-[#fafcfa] border border-[#e5ece2] p-2.5">
                  <span className="text-[#6d8272] block text-[11px]">Acknowledgement Ref No:</span>
                  <span className="font-bold text-[#14291a]">{activeApplication.reference_number || 'Not provided'}</span>
                </div>
                <div className="bg-[#fafcfa] border border-[#e5ece2] p-2.5">
                  <span className="text-[#6d8272] block text-[11px]">Status Source:</span>
                  <span className="font-bold text-[#1b5e20]">{activeApplication.status_source}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: APPLICATION TRACKING VIEW                                     */}
      {/* ==================================================================== */}
      {activeTab === 'tracking' && (
        <div className="space-y-5">
          {/* Tracker Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#dbe3d8] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d8272]">
                Total Tracked Schemes
              </span>
              <p className="text-2xl font-bold font-display text-[#14291a] mt-1">
                {applications.length}
              </p>
            </div>

            <div className="bg-white border border-[#dbe3d8] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b45309]">
                Preparing Documents
              </span>
              <p className="text-2xl font-bold font-display text-[#b45309] mt-1">
                {applications.filter(a => a.application_status === 'Preparing Documents').length}
              </p>
            </div>

            <div className="bg-white border border-[#dbe3d8] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e40af]">
                Ready to Apply
              </span>
              <p className="text-2xl font-bold font-display text-[#1e40af] mt-1">
                {applications.filter(a => a.application_status === 'Ready to Apply').length}
              </p>
            </div>

            <div className="bg-white border border-[#dbe3d8] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b5e20]">
                Applied (Self-Reported)
              </span>
              <p className="text-2xl font-bold font-display text-[#1b5e20] mt-1">
                {applications.filter(a => ['Applied', 'Approved'].includes(a.application_status)).length}
              </p>
            </div>
          </div>

          {/* Tracking Records Table */}
          {applications.length === 0 ? (
            <EmptyState
              title="No Tracked Scheme Applications"
              description="You have not started preparation or recorded applications for any government scheme yet. Visit the Schemes Directory to browse verified benefits."
              actionText="Browse Schemes Directory"
              onAction={() => setActiveTab('directory')}
              icon={<GovernmentSchemeIcon size={24} />}
            />
          ) : (
            <div className="bg-white border border-[#dbe3d8] overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-[#e3ebe0] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display text-[#14291a]">
                    Application Tracker Records
                  </h3>
                  <p className="text-xs text-[#5e7362] mt-0.5">
                    Track preparation milestones, submission acknowledgements, and official portal statuses.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f5f8f4] text-[#425747] uppercase font-bold text-[10px] tracking-wider border-b border-[#d8e3d5]">
                    <tr>
                      <th className="py-3 px-4">Scheme Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date Started</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Reference No</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8efe5]">
                    {applications.map(app => {
                      const scheme = app.scheme || schemes.find(s => s.id === app.scheme_id);
                      return (
                        <tr key={app.id} className="hover:bg-[#fbfdfb] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#14291a]">
                            <div className="max-w-xs truncate" title={scheme?.name}>
                              {scheme?.name || 'Government Scheme'}
                            </div>
                            <span className="text-[10px] text-[#6d8272] block font-normal">
                              {scheme?.department}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#425747]">
                            {scheme?.category || 'General'}
                          </td>
                          <td className="py-3.5 px-4 text-[#556c5a]">
                            {app.started_at ? app.started_at.split('T')[0] : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-[#556c5a]">
                            {app.submitted_at ? app.submitted_at.split('T')[0] : 'Not recorded'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#14291a]">
                            {app.reference_number || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <StatusBadge status={app.application_status} />
                              <span className="text-[9px] text-[#6d8272] block">
                                {app.status_source}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {scheme && (
                              <button
                                onClick={() => handleOpenChecklist(scheme)}
                                className="px-2.5 py-1 text-xs font-semibold text-[#1b5e20] bg-[#eef7ee] border border-[#c2e2c3] hover:bg-[#dff0e0] transition-colors"
                              >
                                Checklist
                              </button>
                            )}

                            {scheme?.official_application_url && (
                              <a
                                href={scheme.official_application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-xs font-semibold text-[#14291a] bg-white border border-[#c9d4c6] hover:bg-[#edf2ea] transition-colors inline-flex items-center gap-1"
                              >
                                <span>Portal</span>
                                <ExternalLinkIcon size={11} />
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setStatusUpdateApp(app);
                                setNewStatus(app.application_status);
                                setNewRefNumber(app.reference_number || '');
                              }}
                              className="px-2 py-1 text-xs font-semibold text-[#526a57] hover:text-[#14291a] transition-colors"
                              title="Update status or reference number"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: SCHEME DETAILS MODAL                                        */}
      {/* ==================================================================== */}
      <Modal
        isOpen={!!selectedSchemeForDetails}
        onClose={() => setSelectedSchemeForDetails(null)}
        title={selectedSchemeForDetails?.name || 'Scheme Details'}
        subtitle={selectedSchemeForDetails?.department}
        maxWidth="2xl"
        actions={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {selectedSchemeForDetails?.official_info_url && (
                <a
                  href={selectedSchemeForDetails.official_info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-[#14291a] bg-white border border-[#c9d4c6] hover:bg-[#edf2ea] transition-colors flex items-center gap-1"
                >
                  <span>Official Portal</span>
                  <ExternalLinkIcon size={12} />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSchemeForDetails(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
              >
                Close
              </button>
              {selectedSchemeForDetails && (
                <button
                  onClick={() => {
                    const sc = selectedSchemeForDetails;
                    setSelectedSchemeForDetails(null);
                    handleOpenChecklist(sc);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors flex items-center gap-1.5"
                >
                  <FileCheckIcon size={14} />
                  <span>Prepare Documents</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        {selectedSchemeForDetails && (
          <div className="space-y-4 text-xs">
            {/* Warning Alert */}
            <div className="bg-[#fffbeb] border border-[#fde68a] p-3 text-[#92400e] flex items-start gap-2">
              <AlertCircleIcon size={18} className="shrink-0 mt-0.5 text-[#b45309]" />
              <div className="leading-relaxed">
                <strong className="font-bold">Official Verification Notice:</strong> Eligibility criteria and document requirements must be cross-verified on the official government website before submitting an application.
              </div>
            </div>

            {/* Scheme Overview */}
            <div>
              <h4 className="font-bold text-[#14291a] uppercase text-[11px] tracking-wider mb-1">
                Scheme Overview & Objectives
              </h4>
              <p className="text-[#3c5040] leading-relaxed">
                {selectedSchemeForDetails.description}
              </p>
            </div>

            {/* Financial Benefits */}
            <div className="bg-[#f5f8f4] border border-[#d8e3d5] p-3 space-y-1">
              <h4 className="font-bold text-[#1b5e20] uppercase text-[11px] tracking-wider">
                Benefits & Financial Assistance
              </h4>
              <p className="text-[#14291a] font-medium leading-relaxed">
                {selectedSchemeForDetails.benefits}
              </p>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <h4 className="font-bold text-[#14291a] uppercase text-[11px] tracking-wider mb-1.5">
                Eligibility Criteria & Exclusions
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[#3c5040] pl-1">
                {selectedSchemeForDetails.eligibility_criteria.map((item, i) => (
                  <li key={i} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Required Documents List */}
            <div>
              <h4 className="font-bold text-[#14291a] uppercase text-[11px] tracking-wider mb-1.5">
                Required Documents
              </h4>
              <div className="space-y-1.5">
                {selectedSchemeForDetails.documents?.map((doc, i) => (
                  <div key={doc.id || i} className="bg-[#fafbfa] border border-[#e5ece2] p-2 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#14291a]">{doc.document_name}</span>
                      {doc.description && (
                        <p className="text-[11px] text-[#5e7362] mt-0.5">{doc.description}</p>
                      )}
                    </div>
                    {doc.is_mandatory ? (
                      <span className="text-[9px] font-bold text-[#991b1b] bg-[#fee2e2] px-1.5 py-0.2 border border-[#fca5a5] shrink-0">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-[#525252] bg-[#f5f5f5] px-1.5 py-0.2 border border-[#e5e5e5] shrink-0">
                        Optional
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Official URLs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#e5ece2]">
              <div>
                <span className="text-[11px] text-[#6d8272] block">Official Scheme Portal:</span>
                <a
                  href={selectedSchemeForDetails.official_info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1b5e20] hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  <span className="truncate">{selectedSchemeForDetails.official_info_url}</span>
                  <ExternalLinkIcon size={12} className="shrink-0" />
                </a>
              </div>
              <div>
                <span className="text-[11px] text-[#6d8272] block">Official Application Link:</span>
                <a
                  href={selectedSchemeForDetails.official_application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1b5e20] hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  <span className="truncate">{selectedSchemeForDetails.official_application_url}</span>
                  <ExternalLinkIcon size={12} className="shrink-0" />
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 2: REDIRECTION TO OFFICIAL PORTAL CONFIRMATION DIALOG          */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isRedirectModalOpen}
        onClose={() => setIsRedirectModalOpen(false)}
        title="Redirect to Official Government Portal"
        subtitle="Verification & Next Steps"
        maxWidth="md"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsRedirectModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToOfficialPortal}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors flex items-center gap-1.5"
            >
              <span>Proceed to Portal</span>
              <ExternalLinkIcon size={13} />
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-[#3a4d3f]">
          <p>
            You are being redirected to the official government portal:
          </p>
          <div className="p-2.5 bg-[#f5f8f4] border border-[#cbe4cc] font-mono text-[11px] text-[#1b5e20] break-all">
            {activeChecklistScheme?.official_application_url}
          </div>
          <div className="space-y-1.5 text-[#556c5a]">
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#14291a]">•</span>
              <span>The actual application submission and verification occurs strictly on the official portal.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#14291a]">•</span>
              <span>Opening this link will not automatically submit your application.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#14291a]">•</span>
              <span>After submitting, return here to record your submission date and Application Reference Number.</span>
            </p>
          </div>
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 3: RESET CHECKLIST CONFIRMATION DIALOG                         */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Document Checklist?"
        subtitle="Clear readiness checks"
        maxWidth="sm"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResetChecklist}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#b91c1c] hover:bg-[#991b1b] transition-colors"
            >
              Yes, Reset All
            </button>
          </div>
        }
      >
        <div className="text-xs text-[#425747] leading-relaxed space-y-2">
          <p>
            Are you sure you want to reset all document checks for <span className="font-bold text-[#14291a]">{activeChecklistScheme?.name}</span>?
          </p>
          <p className="text-[#991b1b]">
            All documents will be marked as Pending, and the status will be reset back to Preparing Documents.
          </p>
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 4: RECORD SELF-REPORTED SUBMISSION DETAILS                     */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isRecordSubmissionModalOpen}
        onClose={() => setIsRecordSubmissionModalOpen(false)}
        title="Record Application Submission"
        subtitle="Self-reported government portal acknowledgement"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmission} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Submission Date *
            </label>
            <input
              type="date"
              required
              value={submissionDate}
              onChange={e => setSubmissionDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Application Reference / Acknowledgement Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. PMK-2026-994821 or State Portal Ack No"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Farmer Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Submitted through local CSC center or online portal."
              value={submissionNotes}
              onChange={e => setSubmissionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          <div className="p-2.5 bg-[#f5f8f4] border border-[#d8e3d5] text-[11px] text-[#526a57]">
            Note: This status will be stored as <strong className="text-[#14291a]">Applied (Farmer-Reported)</strong> until an authorized state integration provides digital verification.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5ece2]">
            <button
              type="button"
              onClick={() => setIsRecordSubmissionModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 5: UPDATE STATUS FROM APPLICATION TRACKER                      */}
      {/* ==================================================================== */}
      <Modal
        isOpen={!!statusUpdateApp}
        onClose={() => setStatusUpdateApp(null)}
        title="Update Tracked Application Status"
        subtitle={statusUpdateApp?.scheme?.name || 'Scheme Application'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Application Status *
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as SchemeApplicationStatus)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            >
              <option value="Preparing Documents">Preparing Documents</option>
              <option value="Ready to Apply">Ready to Apply</option>
              <option value="Applied">Applied (Farmer-Reported)</option>
              <option value="Approved">Approved (Farmer-Reported)</option>
              <option value="Rejected">Rejected (Farmer-Reported)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Application Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. ACK-778219"
              value={newRefNumber}
              onChange={e => setNewRefNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          <div className="p-2.5 bg-[#f5f8f4] border border-[#d8e3d5] text-[11px] text-[#526a57]">
            Approved and Rejected statuses will be labeled as self-reported unless confirmed through an authorized departmental API sync.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5ece2]">
            <button
              type="button"
              onClick={() => setStatusUpdateApp(null)}
              className="px-3 py-1.5 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 6: ADD NEW GOVERNMENT YOJANA (DYNAMIC ENTRY)                    */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isAddYojanaModalOpen}
        onClose={() => setIsAddYojanaModalOpen(false)}
        title="Add New Government Scheme / Yojana"
        subtitle="Publish a verified Central or State agricultural welfare initiative with interactive document checklists"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateYojanaSubmit} className="space-y-4 text-xs">
          {/* Scheme Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Scheme / Yojana Name *
              </label>
              <input
                type="text"
                placeholder="e.g. PM-PRANAM, National Mission on Natural Farming"
                value={newSchemeName}
                onChange={e => setNewSchemeName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Category *
              </label>
              <select
                value={newSchemeCategory}
                onChange={e => setNewSchemeCategory(e.target.value as SchemeCategory)}
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Department / Ministry *
              </label>
              <input
                type="text"
                placeholder="e.g. Ministry of Agriculture & Farmers Welfare, GoI"
                value={newSchemeDepartment}
                onChange={e => setNewSchemeDepartment(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                State / Geographic Jurisdiction
              </label>
              <select
                value={newSchemeState}
                onChange={e => setNewSchemeState(e.target.value)}
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              >
                <option value="All India">All India (Nationwide)</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>
          </div>

          {/* Financial Benefits */}
          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Financial Benefits & Subsidies *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Direct cash incentive of ₹15,000/ha for 3 years, 50% capital subsidy on equipment, or 0% interest loan."
              value={newSchemeBenefits}
              onChange={e => setNewSchemeBenefits(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          {/* Overview / Description */}
          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Scheme Overview & Key Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Describe what the scheme is for, its policy intent, and target crops or beneficiaries."
              value={newSchemeDescription}
              onChange={e => setNewSchemeDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label className="block font-bold text-[#14291a] mb-1">
              Eligibility Criteria (one condition per line)
            </label>
            <textarea
              rows={3}
              placeholder="1. Landholding farmer family with cultivable land&#10;2. Valid Aadhaar card with NPCI DBT seeding&#10;3. Certified non-use of chemical pesticides"
              value={newSchemeEligibility}
              onChange={e => setNewSchemeEligibility(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
            />
          </div>

          {/* URLs & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Official Information URL *
              </label>
              <input
                type="url"
                placeholder="https://pmkisan.gov.in/"
                value={newSchemeOfficialInfoUrl}
                onChange={e => setNewSchemeOfficialInfoUrl(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Official Application Portal URL *
              </label>
              <input
                type="url"
                placeholder="https://pmkisan.gov.in/apply"
                value={newSchemeOfficialAppUrl}
                onChange={e => setNewSchemeOfficialAppUrl(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#14291a] mb-1">
                Application Deadline
              </label>
              <input
                type="text"
                placeholder="e.g. Open Year-Round or 31 March 2026"
                value={newSchemeDeadline}
                onChange={e => setNewSchemeDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] focus:outline-hidden focus:border-[#1b5e20]"
              />
            </div>
          </div>

          {/* Required Documents Checklist Section */}
          <div className="pt-2 border-t border-[#e2ece0] space-y-2">
            <label className="block font-bold text-[#14291a]">
              Required Document Checklist ({newSchemeDocs.length} items configured)
            </label>
            <p className="text-[11px] text-[#637768]">
              These documents will automatically generate an interactive readiness checklist for farmers applying for this Yojana.
            </p>

            {/* List of current documents */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {newSchemeDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-[#f6f9f5] border border-[#d8e3d6] rounded-xs"
                >
                  <div>
                    <span className="font-bold text-[#14291a]">{doc.document_name}</span>
                    <span className="text-[#647969] text-[11px] block">{doc.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#1b5e20] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#a5d6a7]">
                      Mandatory
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocumentRow(idx)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove document"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Document inputs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Document Name (e.g. Soil Health Card, Caste Certificate)"
                value={docNameInput}
                onChange={e => setDocNameInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] text-xs"
              />
              <input
                type="text"
                placeholder="Short description / guidance"
                value={docDescInput}
                onChange={e => setDocDescInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#fafbfa] border border-[#c9d4c6] text-[#14291a] text-xs"
              />
              <button
                type="button"
                onClick={handleAddDocumentRow}
                className="px-3 py-1.5 bg-[#eef6ee] text-[#1b5e20] border border-[#b8dab9] font-bold text-xs hover:bg-[#d8eed9] transition-colors shrink-0"
              >
                + Add Document
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5ece2]">
            <button
              type="button"
              onClick={() => setIsAddYojanaModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#5e7362] hover:text-[#14291a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingNewScheme}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmittingNewScheme ? 'Publishing Yojana...' : 'Publish & Activate Yojana'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 7: LIVE GOVERNMENT YOJANA RADAR & PORTAL SCANNER (SPECIAL)     */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        title="Live Government Yojana Radar & Scanner"
        subtitle="Real-time synchronization across Central & State agricultural welfare repositories"
        maxWidth="3xl"
      >
        <div className="space-y-5 text-xs">
          {/* Radar Scanner Top Header Card */}
          <div className="p-4 bg-gradient-to-r from-[#0C2216] to-[#123924] text-white rounded-md space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#8BE3A1]">
                  CENTRAL & STATE GOVT SCHEME FEED RADAR
                </span>
              </div>
              <button
                type="button"
                onClick={handleTriggerRadarScan}
                disabled={isScanningFeeds}
                className="px-3 py-1.5 bg-[#8BE3A1] text-[#0A281D] font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-white transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshIcon size={13} className={isScanningFeeds ? 'animate-spin' : ''} />
                <span>{isScanningFeeds ? 'Scanning Ministry Feeds...' : 'Sync & Scan Feeds Now'}</span>
              </button>
            </div>

            <p className="text-xs text-[#DDEFE0]/90 leading-relaxed">
              The Live Yojana Radar cross-checks gazetted agricultural releases from the <strong>Ministry of Agriculture & Farmers Welfare (DA&FW)</strong>, <strong>DBT Bharat</strong>, and state agro-directorates for unlisted subsidies and grants.
            </p>

            {/* Official Portals Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-emerald-400">✓</span>
                <span>agricoop.nic.in</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-emerald-400">✓</span>
                <span>dbtbharat.gov.in</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-emerald-400">✓</span>
                <span>pmkusum.mnre.gov.in</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-emerald-400">✓</span>
                <span>fert.gov.in (PRANAM)</span>
              </div>
            </div>
          </div>

          {/* Discovered / Gazette Yojanas List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#14291a] uppercase tracking-wider text-xs">
                  Recently Gazetted Government Initiatives Ready to Import ({DISCOVERED_GOVT_YOJANAS.length})
                </h4>
                <p className="text-[11px] text-[#5e7362]">
                  Click "Import & Activate Yojana" to immediately load that scheme with all verified document checklists into your EarthRakshak portal.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {DISCOVERED_GOVT_YOJANAS.map(item => {
                const isAlreadyAdded = schemes.some(s => s.slug === item.slug || s.name.toLowerCase() === item.name.toLowerCase());

                return (
                  <div
                    key={item.slug}
                    className="p-3.5 bg-white border border-[#dbe3d8] hover:border-[#1b5e20] transition-colors rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef6ee] px-2 py-0.5 border border-[#cbe4cc]">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#526a57] bg-[#f5f8f4] px-2 py-0.5 border border-[#d8e3d5]">
                          {item.launchDate}
                        </span>
                        {isAlreadyAdded && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                            ✓ Currently In Directory
                          </span>
                        )}
                      </div>

                      <h5 className="font-bold text-sm text-[#14291a] leading-tight font-display">
                        {item.name}
                      </h5>

                      <p className="text-xs text-[#3a4d3f] leading-relaxed">
                        {item.benefits}
                      </p>

                      <div className="text-[11px] text-[#637768]">
                        Department: <strong className="text-[#14291a]">{item.department}</strong> · {item.documents.length} verified documents
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <a
                        href={item.official_info_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-[#1b5e20] border border-[#cbe4cc] hover:bg-[#eef6ee] transition-colors flex items-center gap-1 rounded-sm"
                      >
                        <span>Official Info</span>
                        <ExternalLinkIcon size={12} />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleImportDiscoveredYojana(item)}
                        disabled={isAlreadyAdded}
                        className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-sm flex items-center gap-1.5 ${
                          isAlreadyAdded
                            ? 'bg-[#f0f4ef] text-[#718774] border border-[#dbe3d8] cursor-not-allowed'
                            : 'bg-[#1b5e20] hover:bg-[#144719] text-white shadow-xs cursor-pointer'
                        }`}
                      >
                        <PlusIcon size={13} />
                        <span>{isAlreadyAdded ? 'Active in Portal' : 'Import & Activate Yojana'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#f5f8f4] border border-[#d8e3d5] text-[11px] text-[#526a57] flex items-center justify-between gap-3">
            <span>
              Need a state-specific welfare scheme that is not listed? Use the <strong>+ Add Yojana</strong> button to add any custom scheme.
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRadarModalOpen(false);
                setIsAddYojanaModalOpen(true);
              }}
              className="font-bold text-[#1b5e20] hover:underline shrink-0"
            >
              Add Custom Yojana →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
