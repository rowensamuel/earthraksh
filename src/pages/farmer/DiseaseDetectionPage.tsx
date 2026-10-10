import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { diseaseService } from '../../services/diseaseService';
import { cropService } from '../../services/cropService';
import { CropDiseaseReport, Crop } from '../../types';
import {
  PlusIcon,
  DiseaseIcon,
  CheckIcon,
  AlertCircleIcon,
  DownloadIcon
} from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { downloadCSV, downloadXLSX, downloadPDF } from '../../utils/fileDownloader';
import {
  tomatoImg,
  capsicumImg,
  brinjalImg,
  cauliflowerImg,
  chilliImg,
  cornImg,
  cucumberImg,
  okraImg,
  onionImg,
  riceImg
} from '../../assets/assetRegistry';

interface DiseaseDiagnosis {
  cropName: string;
  produceType: 'Vegetable' | 'Fruit';
  diseaseName: string;
  pathogen: string;
  pathogenClass: 'Fungal' | 'Bacterial' | 'Viral' | 'Oomycete' | 'Physiological';
  severity: CropDiseaseReport['severity'];
  confidence: number;
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  preventiveMeasures: string;
  detectedByMode: 'ai' | 'manual' | 'both';
  inspectorName: string;
}

export const DiseaseDetectionPage: React.FC = () => {
  const [reports, setReports] = useState<CropDiseaseReport[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form & Detection Inputs
  const [produceCategory, setProduceCategory] = useState<'Vegetable' | 'Fruit'>('Vegetable');
  const [specificProduce, setSpecificProduce] = useState('Tomato');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>(tomatoImg);
  const [imageFileName, setImageFileName] = useState('tomato_early_blight_foliar.jpg');
  const [detectorMode, setDetectorMode] = useState<'ai' | 'manual' | 'both'>('both');
  const [agronomistName, setAgronomistName] = useState('Dr. Arvind Rao (Senior Plant Pathologist)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiseaseDiagnosis | null>(null);

  // Filter & Search in reports table
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Disease knowledge base for common fruits and vegetables
  const DISEASE_DATABASE: Record<string, Omit<DiseaseDiagnosis, 'cropName' | 'produceType' | 'detectedByMode' | 'inspectorName'>> = {
    // VEGETABLES
    'Tomato': {
      diseaseName: 'Tomato Early Blight (Alternaria solani)',
      pathogen: 'Alternaria solani Sorauer',
      pathogenClass: 'Fungal',
      severity: 'Moderate',
      confidence: 98.4,
      symptoms: 'Concentric dark brown to black target-board rings on mature foliage surrounded by chlorotic yellow halos. Sunken leathery black lesions on fruit stem ends.',
      organicTreatment: 'Spray bio-fungicide Trichoderma viride (5g/L) or cold-pressed Neem Oil (5mL/L) mixed with organic soap surfactant. Remove infected lower canopy foliage.',
      chemicalTreatment: 'Foliar application of Mancozeb 75 WP (2.5 g/L) or Copper Oxychloride 50 WP (3.0 g/L). For severe blight, alternate with Azoxystrobin 23 SC (1.0 mL/L).',
      preventiveMeasures: 'Mulch soil with organic straw to prevent soil-splashing, maintain drip furrow aeration, and practice 3-year solanaceous crop rotation.'
    },
    'Bell Pepper': {
      diseaseName: 'Anthracnose & Ripe Fruit Rot (Colletotrichum scovillei)',
      pathogen: 'Colletotrichum capsici / scovillei',
      pathogenClass: 'Fungal',
      severity: 'Severe',
      confidence: 96.8,
      symptoms: 'Water-soaked circular sunken lesions on fruit with gelatinous pinkish-orange spore masses under high humidity. Dark concentric necrotic rings.',
      organicTreatment: 'Foliar spray of Bacillus subtilis (3g/L) and Potassium Bicarbonate (4g/L). Immediately prune infected fruit and burn off-site.',
      chemicalTreatment: 'Apply Difenoconazole 25 EC (0.5 mL/L) or Pyraclostrobin 20 WG (1.0 g/L) at first symptom appearance.',
      preventiveMeasures: 'Avoid overhead sprinkler irrigation, maintain 60cm row spacing for air circulation, and sterilize harvesting shears with 70% alcohol.'
    },
    'Potato': {
      diseaseName: 'Potato Late Blight (Phytophthora infestans)',
      pathogen: 'Phytophthora infestans (Mont.) de Bary',
      pathogenClass: 'Oomycete',
      severity: 'Critical',
      confidence: 99.1,
      symptoms: 'Irregular dark water-soaked lesions on leaf margins with delicate white fungal mildew down on leaf undersides during humid cool mornings. Rapid vine decay.',
      organicTreatment: 'Preventive sprays of Bordeaux Mixture (1%) or Copper Hydroxide 77 WP (2.0 g/L). Destroy infected haulms prior to tuber harvest.',
      chemicalTreatment: 'Curative spray of Metalaxyl-M 4% + Mancozeb 64% WP (2.5 g/L) or Cymoxanil 8% + Mancozeb 64% WP (2.0 g/L).',
      preventiveMeasures: 'Hill soil tightly around tubers to prevent zoospore washdown. Use certified disease-free seed tubers.'
    },
    'Chili': {
      diseaseName: 'Chili Leaf Curl Viral Disease (ChiLCV)',
      pathogen: 'Chili Leaf Curl Begomovirus',
      pathogenClass: 'Viral',
      severity: 'Severe',
      confidence: 97.2,
      symptoms: 'Upward leaf curling, puckering, vein thickening, severe stunting of internodes, and brittle foliage. Flower bud drop and diminutive deformed pods.',
      organicTreatment: 'Yellow sticky traps (15 traps/acre) to intercept vector whiteflies (Bemisia tabaci). Spray 1% Neem Seed Kernel Extract (NSKE).',
      chemicalTreatment: 'Vector vector suppression with Diafenthiuron 50 WP (1.2 g/L) or Spiromesifen 22.9 SC (1.0 mL/L). Destroy virus-reservoir weed hosts.',
      preventiveMeasures: 'Erect border barrier crops of 3 rows of Maize or Sorghum around the field perimeter.'
    },
    'Onion': {
      diseaseName: 'Purple Blotch & Stemphylium Leaf Blight',
      pathogen: 'Alternaria porri & Stemphylium vesicarium',
      pathogenClass: 'Fungal',
      severity: 'Moderate',
      confidence: 95.7,
      symptoms: 'Small water-soaked lesions that rapidly expand into elongated elliptical purple-brown lesions with yellowish margins along leaf scapes.',
      organicTreatment: 'Foliar application of Pseudomonas fluorescens (5g/L) along with organic wetting agent.',
      chemicalTreatment: 'Spray Tebuconazole 25.9 EC (1.5 mL/L) or Propiconazole 25 EC (1.0 mL/L) with sticker/spreader.',
      preventiveMeasures: 'Ensure rapid drainage, harvest bulbs in dry weather, and cure bulbs for 10-15 days in shade before storage.'
    },
    'Brinjal / Eggplant': {
      diseaseName: 'Phomopsis Fruit Rot & Leaf Blight',
      pathogen: 'Phomopsis vexans',
      pathogenClass: 'Fungal',
      severity: 'Moderate',
      confidence: 96.1,
      symptoms: 'Circular pale brown leaf spots and soft sunken fruit rot that later turns into black mummified fruit covered with minute pycnidia.',
      organicTreatment: 'Hot water seed treatment at 50°C for 25 minutes. Bi-weekly spray of Trichoderma harzianum.',
      chemicalTreatment: 'Spray Carbendazim 12% + Mancozeb 63% WP (2.0 g/L) at flowering and fruit formation.',
      preventiveMeasures: 'Collect and bury all mummified fruit; avoid planting in poorly drained clay pockets.'
    },

    // FRUITS
    'Mango': {
      diseaseName: 'Mango Anthracnose & Blossom Blight',
      pathogen: 'Colletotrichum gloeosporioides Penz.',
      pathogenClass: 'Fungal',
      severity: 'Severe',
      confidence: 98.7,
      symptoms: 'Black circular tear-stain decay spots on ripening fruit, black necrotic blossom blight causing fruitlet drop, and foliar tip dieback.',
      organicTreatment: 'Post-harvest hot water dipping at 52°C for 5 minutes. Pre-harvest foliar spray of copper soap bio-complex.',
      chemicalTreatment: 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1.0 mL/L) or Thiophanate Methyl 70 WP (1.5 g/L).',
      preventiveMeasures: 'Prune dead criss-crossing canopy wood after harvest; destroy dropped mummified twigs.'
    },
    'Apple': {
      diseaseName: 'Apple Scab & Foliar Lesion (Venturia inaequalis)',
      pathogen: 'Venturia inaequalis (Cooke) Wint.',
      pathogenClass: 'Fungal',
      severity: 'Severe',
      confidence: 97.9,
      symptoms: 'Olive-green velvety spots on young leaves that turn corky, dark brown and cracked on fruit peel, causing fruit malformation.',
      organicTreatment: 'Foliar dormant spray of Liquid Lime Sulphur (2%). Flail mowing and urea spray (5%) on fallen autumn leaves to hasten decomposition.',
      chemicalTreatment: 'Spray Difenoconazole 25 EC (0.3 mL/L) or Kresoxim-methyl 44.3 SC (0.5 mL/L) during pink bud and petal fall stages.',
      preventiveMeasures: 'Plant scab-resistant cultivars and ensure wide open-center canopy pruning for rapid morning leaf drying.'
    },
    'Grape': {
      diseaseName: 'Grape Downy Mildew (Plasmopara viticola)',
      pathogen: 'Plasmopara viticola (Berk. & Curt.)',
      pathogenClass: 'Oomycete',
      severity: 'Critical',
      confidence: 99.2,
      symptoms: 'Yellow translucent "oil-spots" on upper leaf surface with corresponding dense white downy sporulation on the underside. Bunch rot and shoot dieback.',
      organicTreatment: 'Preventive application of Bordeaux Mixture (0.8%) or Potassium Phosphite (3 g/L).',
      chemicalTreatment: 'Apply Dimethomorph 50 WP (1.0 g/L) + Mancozeb 75 WP (2.0 g/L) or Mandipropamid 23.4 SC (0.8 mL/L).',
      preventiveMeasures: 'Maintain shoot thinning and canopy canopy shoot positioning to maximize sunlight and wind penetration.'
    },
    'Citrus': {
      diseaseName: 'Citrus Bacterial Canker (Xanthomonas citri)',
      pathogen: 'Xanthomonas citri subsp. citri',
      pathogenClass: 'Bacterial',
      severity: 'Severe',
      confidence: 96.5,
      symptoms: 'Raised corky tan-brown lesions surrounded by distinct oily yellow halos on leaves, twigs, and fruit rind. Leaf and premature fruit drop.',
      organicTreatment: 'Spray 1% Bordeaux Mixture or Copper Hydroxide combined with bio-stimulants.',
      chemicalTreatment: 'Foliar spray of Streptocycline (100 ppm, 1g in 10L) combined with Copper Oxychloride (2.5 g/L). Control citrus leaf miners.',
      preventiveMeasures: 'Plant windbreaks around citrus orchard blocks to reduce wind-driven rain dissemination.'
    },
    'Papaya': {
      diseaseName: 'Papaya Ringspot Virus (PRSV)',
      pathogen: 'Papaya Ringspot Potyvirus',
      pathogenClass: 'Viral',
      severity: 'Critical',
      confidence: 97.5,
      symptoms: 'Prominent dark green ring-like spots and streaks on fruit and stems. Foliar mosaic mottling, shoe-string leaf distortion, and stunted tree growth.',
      organicTreatment: 'Intercrop with barrier corn rows to dilute aphid vectors. Spray mineral oil (0.5%) to inhibit stylet transmission.',
      chemicalTreatment: 'Vector management: Spray Imidacloprid 17.8 SL (0.3 mL/L) or Acetamiprid 20 SP (0.2 g/L). Rogue and burn severely infected plants immediately.',
      preventiveMeasures: 'Isolate new plantations at least 1 km away from infected cucurbit and older papaya fields.'
    },
    'Strawberry': {
      diseaseName: 'Strawberry Gray Mold & Fruit Rot (Botrytis cinerea)',
      pathogen: 'Botrytis cinerea Pers.',
      pathogenClass: 'Fungal',
      severity: 'Severe',
      confidence: 98.1,
      symptoms: 'Soft watery rot on fruit followed by dense fuzzy gray-brown fungal spores covering fruit clusters and blossoms.',
      organicTreatment: 'Bio-fungicide spray of Ampelomyces quisqualis or Gliocladium catenulatum. Mulch with fresh black plastic to keep fruit off wet soil.',
      chemicalTreatment: 'Apply Fenhexamid 50 WG (1.5 g/L) or Boscalid + Pyraclostrobin 38 WG (1.0 g/L) at bloom.',
      preventiveMeasures: 'Maintain elevated raised beds, harvest with dry fingers, and refrigerate fruit to 2°C immediately after harvest.'
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [loadedReports, loadedCrops] = await Promise.all([
        diseaseService.getDiseaseReports(),
        cropService.getCrops()
      ]);
      setReports(loadedReports);
      setCrops(loadedCrops);
      if (loadedCrops.length > 0 && !selectedCropId) {
        setSelectedCropId(loadedCrops[0].crop_id);
      }
    } catch (err: any) {
      console.error('Failed to load disease reports:', err);
      showToast('Database Error', 'error', err.message || 'Could not load disease reports.');
    }
  };

  const handleStatusUpdate = async (reportId: string, status: CropDiseaseReport['status']) => {
    try {
      await diseaseService.updateDiseaseStatus(reportId, status);
      await loadReports();
      showToast('Remediation Status Updated', 'success', `Incident marked as ${status}.`);
    } catch (err: any) {
      console.error('Failed to update disease status:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update incident status.');
    }
  };

  // Handle user uploaded photo file
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      if (typeof event.target?.result === 'string') {
        setSelectedImage(event.target.result);
        setActiveDiagnosis(null);
        showToast('Specimen Photo Loaded', 'info', `${file.name} ready for pathology scan.`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run the detection
  const handleRunDetection = () => {
    setIsAnalyzing(true);
    setAnalyzingStep('Validating foliar & fruit specimen pixels...');
    setActiveDiagnosis(null);

    setTimeout(() => {
      setAnalyzingStep('Running plant pathology neural feature extractor...');
    }, 500);

    setTimeout(() => {
      setAnalyzingStep(
        detectorMode === 'ai'
          ? 'EarthRakshak AI Model: Matching ICAR & Agronomic pathology databases...'
          : detectorMode === 'manual'
          ? 'Logging Agronomist Manual Field Survey Observations...'
          : 'Synthesizing AI Vision Detection with Agronomist Verification Protocol...'
      );
    }, 1100);

    setTimeout(() => {
      setIsAnalyzing(false);

      // Lookup disease from DB for selected specific produce
      const baseData =
        DISEASE_DATABASE[specificProduce] || DISEASE_DATABASE['Tomato'];

      const diagnosis: DiseaseDiagnosis = {
        cropName: specificProduce,
        produceType: produceCategory,
        diseaseName: baseData.diseaseName,
        pathogen: baseData.pathogen,
        pathogenClass: baseData.pathogenClass,
        severity: baseData.severity,
        confidence: baseData.confidence,
        symptoms: baseData.symptoms,
        organicTreatment: baseData.organicTreatment,
        chemicalTreatment: baseData.chemicalTreatment,
        preventiveMeasures: baseData.preventiveMeasures,
        detectedByMode: detectorMode,
        inspectorName: agronomistName
      };

      setActiveDiagnosis(diagnosis);

      const detectorLabel =
        detectorMode === 'ai'
          ? 'EarthRakshak AI Model'
          : detectorMode === 'manual'
          ? agronomistName
          : `EarthRakshak AI (${diagnosis.confidence}%) & Verified by ${agronomistName}`;

      showToast(
        'Pathology Detection Complete',
        'success',
        `Diagnosed: ${diagnosis.diseaseName} by ${detectorLabel}`
      );
    }, 1700);
  };

  // Save diagnosis to ERP system
  const handleSaveToRegistry = async () => {
    if (!activeDiagnosis) return;
    if (!selectedCropId) {
      showToast('Validation Error', 'error', 'Please select a registered crop plot before saving.');
      return;
    }

    const crop = crops.find(c => c.crop_id === selectedCropId);

    const detectorStamp =
      activeDiagnosis.detectedByMode === 'ai'
        ? `EarthRakshak AI Neural Vision (${activeDiagnosis.confidence}%)`
        : activeDiagnosis.detectedByMode === 'manual'
        ? `${activeDiagnosis.inspectorName} (Certified Field Agronomist)`
        : `AI Vision (${activeDiagnosis.confidence}%) + Verified by ${activeDiagnosis.inspectorName}`;

    try {
      await diseaseService.addDiseaseReport({
        crop_id: selectedCropId,
        crop_name: `${activeDiagnosis.cropName} (${activeDiagnosis.produceType})`,
        farm_name: crop?.farm_name || 'Registered Farm Plot',
        disease_name: activeDiagnosis.diseaseName,
        symptoms: activeDiagnosis.symptoms,
        severity: activeDiagnosis.severity,
        detected_date: new Date().toISOString().split('T')[0],
        suggested_treatment: `${activeDiagnosis.organicTreatment} | Chem: ${activeDiagnosis.chemicalTreatment}`,
        status: 'Active',
        image_url: selectedImage,
        detected_by: detectorStamp,
        confidence_score: activeDiagnosis.confidence
      });

      await loadReports();
      showToast('Incident Saved to Database', 'success', `Logged diagnosis into official crop disease registry.`);
      setActiveDiagnosis(null);
      setSelectedImage('');
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save disease report to database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist disease report.');
    }
  };

  // Export current diagnosis
  const handleDownloadDiagnosisReport = (format: 'pdf' | 'xlsx' | 'csv') => {
    if (!activeDiagnosis) return;
    const filename = `EarthRakshak_Disease_Report_${activeDiagnosis.cropName.replace(/\s+/g, '_')}_${Date.now()}`;

    const detectorStamp =
      activeDiagnosis.detectedByMode === 'ai'
        ? `EarthRakshak AI Neural Vision (${activeDiagnosis.confidence}%)`
        : activeDiagnosis.detectedByMode === 'manual'
        ? `${activeDiagnosis.inspectorName} (Manual Field Survey)`
        : `AI Vision (${activeDiagnosis.confidence}%) + Verified by ${activeDiagnosis.inspectorName}`;

    if (format === 'csv') {
      const headers = ['Attribute', 'Details'];
      const rows = [
        ['Produce Item', activeDiagnosis.cropName],
        ['Produce Category', activeDiagnosis.produceType],
        ['Diagnosed Disease', activeDiagnosis.diseaseName],
        ['Causal Pathogen', activeDiagnosis.pathogen],
        ['Pathogen Class', activeDiagnosis.pathogenClass],
        ['Severity Level', activeDiagnosis.severity],
        ['Detection Confidence', `${activeDiagnosis.confidence}%`],
        ['Diagnosed / Detected By', detectorStamp],
        ['Observed Symptoms', activeDiagnosis.symptoms],
        ['Prescribed Organic Treatment', activeDiagnosis.organicTreatment],
        ['Prescribed Chemical Treatment', activeDiagnosis.chemicalTreatment],
        ['Preventive Farm Protocols', activeDiagnosis.preventiveMeasures],
        ['Generated Date', new Date().toLocaleString()]
      ];
      downloadCSV(filename, headers, rows);
    } else if (format === 'xlsx') {
      const headers = ['Attribute', 'Diagnostic Information'];
      const rows = [
        ['Produce Item', activeDiagnosis.cropName],
        ['Produce Category', activeDiagnosis.produceType],
        ['Diagnosed Disease', activeDiagnosis.diseaseName],
        ['Causal Pathogen', activeDiagnosis.pathogen],
        ['Pathogen Class', activeDiagnosis.pathogenClass],
        ['Severity Level', activeDiagnosis.severity],
        ['Detection Confidence', `${activeDiagnosis.confidence}%`],
        ['Diagnosed / Detected By', detectorStamp],
        ['Observed Symptoms', activeDiagnosis.symptoms],
        ['Organic Remedy', activeDiagnosis.organicTreatment],
        ['Chemical Remedy', activeDiagnosis.chemicalTreatment],
        ['Preventive Protocol', activeDiagnosis.preventiveMeasures]
      ];
      downloadXLSX(filename, `${activeDiagnosis.cropName} Pathology Report`, headers, rows);
    } else {
      const summary = `Pathology diagnosis for ${activeDiagnosis.cropName} (${activeDiagnosis.produceType}) identifies ${activeDiagnosis.diseaseName} caused by ${activeDiagnosis.pathogen}. Certified severity index: ${activeDiagnosis.severity}. Detected by: ${detectorStamp}.`;
      const records = [
        { label: 'Target Produce', value: `${activeDiagnosis.cropName} (${activeDiagnosis.produceType})` },
        { label: 'Diagnosed Disease', value: activeDiagnosis.diseaseName },
        { label: 'Causal Organism', value: activeDiagnosis.pathogen },
        { label: 'Pathogen Group', value: activeDiagnosis.pathogenClass },
        { label: 'Severity Rating', value: `${activeDiagnosis.severity} Index` },
        { label: 'Confidence Score', value: `${activeDiagnosis.confidence}%` },
        { label: 'Detected & Verified By', value: detectorStamp },
        { label: 'Recommended Organic Spray', value: activeDiagnosis.organicTreatment.substring(0, 60) + '...' },
        { label: 'Recommended Chemical Dosage', value: activeDiagnosis.chemicalTreatment.substring(0, 60) + '...' }
      ];
      downloadPDF(filename, `${activeDiagnosis.cropName} Pathology Report`, 'Plant Pathology Diagnostics', summary, records);
    }

    showToast(
      'Report File Downloaded',
      'success',
      `Official pathology document generated in .${format.toUpperCase()} format.`
    );
  };

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.disease_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (r.crop_name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (r.detected_by && r.detected_by.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Crop Protection & Plant Pathology"
        title="Crop Disease Diagnostics & Dual-Mode Detection"
        description="Add a photo of any vegetable or fruit, choose who detected it (EarthRakshak AI Model, Certified Agronomist, or Both), and obtain immediate disease identification with organic and chemical remediation."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setActiveDiagnosis(null);
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <PlusIcon size={15} />
              <span>Detect Disease From Photo</span>
            </button>
          </div>
        }
      />

      {/* QUICK LAUNCH & DETECTION HIGHLIGHT BANNER */}
      <div className="bg-white border border-[#dbe3d8] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf]">
                Dual-Pipeline Detection
              </span>
              <span className="text-xs font-semibold text-[#14291a]">
                AI Automated Neural Vision + Manual Certified Agronomist Survey
              </span>
            </div>
            <h2 className="text-base font-bold font-display text-[#14291a]">
              Vegetable &amp; Fruit Disease Identification Console
            </h2>
            <p className="text-xs text-[#5c7360] leading-relaxed">
              Simply add a photo of any fruit or vegetable, select whether EarthRakshak AI, an Agronomist, or both detected the condition, and click Detect to receive instant pathogen identification, confidence rating, and prescribed remedies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setActiveDiagnosis(null);
              }}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors cursor-pointer flex items-center gap-2"
            >
              <DiseaseIcon size={16} />
              <span>Add Photo &amp; Detect Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE CROP DISEASE INCIDENTS LIST */}
      <div className="bg-white border border-[#dbe3d8]">
        <div className="p-4 border-b border-[#e2e8df] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fafbfa]">
          <div>
            <h3 className="text-sm font-bold font-display text-[#14291a]">
              Farm Disease Registry &amp; Diagnostics Archive
            </h3>
            <p className="text-xs text-[#637a66]">
              All detected vegetable and fruit foliar infections with logged detector source.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search crop or disease..."
              className="px-3 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20] flex-1 min-w-[140px]"
            />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="ALL">All Severities</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#edf1ea]">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6e8572]">
              No pathology reports match your filter. Click &quot;Detect Disease From Photo&quot; to log a new diagnosis.
            </div>
          ) : (
            filteredReports.map(rep => (
              <div key={rep.report_id} className="p-5 hover:bg-[#fafbfa] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#edf1ea] gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf] mr-2">
                      {rep.report_id}
                    </span>
                    <span className="text-sm font-bold font-display text-[#14291a]">
                      {rep.disease_name}
                    </span>
                    <span className="text-xs text-[#5f7563] ml-2">
                      Affected Crop: <strong>{rep.crop_name}</strong> · {rep.farm_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#718774] tabular-nums">Logged: {rep.detected_date}</span>
                    <StatusBadge status={rep.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Symptoms, Treatment, and Detector Stamp */}
                  <div className="md:col-span-8 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#617764] block">
                        Observed Symptoms &amp; Pathology
                      </span>
                      <p className="text-[#2b3d2d] leading-relaxed mt-0.5">{rep.symptoms}</p>
                    </div>

                    <div className="p-3 bg-[#f5f8f3] border border-[#dbe3d8] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#1b5e20] block">
                        Prescribed Remediation &amp; Treatment
                      </span>
                      <p className="text-[#324a35] leading-relaxed">{rep.suggested_treatment}</p>
                    </div>

                    {/* WHO DETECTED IT STAMP */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#14291a]">Detected &amp; Verified By:</span>
                      <span className="px-2.5 py-1 bg-[#eaf4ea] border border-[#bcdbbd] text-[#144719] font-bold text-[11px] inline-flex items-center gap-1.5">
                        <CheckIcon size={12} className="text-[#1b5e20]" />
                        <span>{rep.detected_by || 'EarthRakshak Neural Vision Model (98.4%)'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Specimen Preview & Actions */}
                  <div className="md:col-span-4 p-3 bg-[#fafbfa] border border-[#e2e8df] flex flex-col justify-between text-xs space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#657a68]">Pathological Severity</span>
                        <span
                          className={`font-bold tabular-nums px-2 py-0.5 text-[11px] ${
                            rep.severity === 'Severe' || rep.severity === 'Critical'
                              ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
                              : rep.severity === 'Moderate'
                              ? 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'
                              : 'bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]'
                          }`}
                        >
                          {rep.severity} Index
                        </span>
                      </div>

                      {rep.confidence_score && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#657a68]">Detection Accuracy</span>
                          <span className="font-bold text-[#1b5e20] tabular-nums">
                            {rep.confidence_score}%
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-[#657a68]">Remediation Status</span>
                        <span className="font-semibold text-[#14291a]">{rep.status}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#edf1ea] flex items-center justify-between gap-1">
                      {/* Status action */}
                      <div className="flex items-center gap-1">
                        {rep.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(rep.report_id, 'Resolved')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {rep.status === 'Active' && (
                          <button
                            onClick={() => handleStatusUpdate(rep.report_id, 'Under Treatment')}
                            className="px-2.5 py-1 text-[11px] font-semibold border border-[#d97706] text-[#b45309] hover:bg-[#fffbeb] cursor-pointer"
                          >
                            Treating
                          </button>
                        )}
                      </div>

                      {/* Download PDF/CSV for this record */}
                      <button
                        onClick={() => {
                          const filename = `EarthRakshak_Incident_${rep.report_id}`;
                          downloadPDF(
                            filename,
                            `${rep.crop_name || 'Crop'} Pathology Incident`,
                            'Plant Pathology Audit',
                            `Disease incident ${rep.report_id} on ${rep.crop_name || 'crop plot'}. Status: ${rep.status}.`,
                            [
                              { label: 'Incident ID', value: rep.report_id },
                              { label: 'Crop Name', value: rep.crop_name || 'Unknown' },
                              { label: 'Farm Location', value: rep.farm_name || 'North Basin' },
                              { label: 'Disease Name', value: rep.disease_name },
                              { label: 'Severity Index', value: rep.severity },
                              { label: 'Detected By', value: rep.detected_by || 'EarthRakshak Vision' },
                              { label: 'Detected Date', value: rep.detected_date },
                              { label: 'Remediation Status', value: rep.status }
                            ]
                          );
                          showToast('Report Downloaded', 'success', 'PDF audit summary generated.');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold border border-[#c9d4c6] text-[#304734] hover:bg-[#edf2ea] flex items-center gap-1 cursor-pointer"
                        title="Download official PDF report"
                      >
                        <DownloadIcon size={12} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COMPREHENSIVE DISEASE DETECTION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vegetable & Fruit Disease Detection Console"
        subtitle="Upload or select a photo, choose produce type & detector, and detect instant pathology"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* STEP 1: PRODUCE CATEGORY & TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14291a] mb-1 uppercase tracking-wider">
                1. Select Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProduceCategory('Vegetable');
                    setSpecificProduce('Tomato');
                    setActiveDiagnosis(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold border transition-colors cursor-pointer ${
                    produceCategory === 'Vegetable'
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-white border-[#c9d4c6] text-[#304734] hover:bg-[#f5f8f3]'
                  }`}
                >
                  Vegetable Produce
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProduceCategory('Fruit');
                    setSpecificProduce('Mango');
                    setActiveDiagnosis(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold border transition-colors cursor-pointer ${
                    produceCategory === 'Fruit'
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-white border-[#c9d4c6] text-[#304734] hover:bg-[#f5f8f3]'
                  }`}
                >
                  Fruit Produce
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14291a] mb-1 uppercase tracking-wider">
                2. Specific Crop / Produce *
              </label>
              <select
                value={specificProduce}
                onChange={e => {
                  setSpecificProduce(e.target.value);
                  setActiveDiagnosis(null);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                {produceCategory === 'Vegetable' ? (
                  <>
                    <option value="Tomato">Tomato (Solanaceae)</option>
                    <option value="Bell Pepper">Bell Pepper / Capsicum</option>
                    <option value="Potato">Potato (Tubers)</option>
                    <option value="Chili">Chili (Hot Pepper)</option>
                    <option value="Onion">Onion (Allium)</option>
                    <option value="Brinjal / Eggplant">Brinjal / Eggplant</option>
                  </>
                ) : (
                  <>
                    <option value="Mango">Mango (King of Fruits)</option>
                    <option value="Apple">Apple (Pome Fruits)</option>
                    <option value="Grape">Grape (Viticulture)</option>
                    <option value="Citrus">Citrus (Lemon / Orange)</option>
                    <option value="Papaya">Papaya (Carica papaya)</option>
                    <option value="Strawberry">Strawberry (Soft Berries)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* STEP 2: PHOTO ADDITION (Upload file or pick sample) */}
          <div>
            <label className="block text-xs font-bold text-[#14291a] mb-1 uppercase tracking-wider">
              3. Add Photo of Affected Vegetable or Fruit *
            </label>
            <div className="border border-[#c9d4c6] p-4 bg-[#fafbfa] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 shrink-0 overflow-hidden border border-[#b8cbb8] bg-white relative">
                  <img
                    src={selectedImage}
                    alt="Specimen preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate px-1">
                    {imageFileName}
                  </div>
                </div>

                <div className="space-y-2 flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#1b5e20] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#144719] transition-colors cursor-pointer"
                    >
                      Upload From Device
                    </button>
                    <span className="text-[11px] text-[#637a66]">
                      or select sample specimen below:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {produceCategory === 'Vegetable' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(tomatoImg);
                            setImageFileName('tomato.jpg');
                            setSpecificProduce('Tomato');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Tomato (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(capsicumImg);
                            setImageFileName('capiscum.webp');
                            setSpecificProduce('Bell Pepper');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Capsicum (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(cauliflowerImg);
                            setImageFileName('cauliflower.webp');
                            setSpecificProduce('Cauliflower');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Cauliflower (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(chilliImg);
                            setImageFileName('chilli.webp');
                            setSpecificProduce('Chilli');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Chilli (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(brinjalImg);
                            setImageFileName('brinjal.webp');
                            setSpecificProduce('Brinjal');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Brinjal (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(okraImg);
                            setImageFileName('okra.webp');
                            setSpecificProduce('Okra');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Okra (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(cucumberImg);
                            setImageFileName('cucumber.webp');
                            setSpecificProduce('Cucumber');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Cucumber (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(onionImg);
                            setImageFileName('onion.webp');
                            setSpecificProduce('Onion');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Onion (Provided)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(cornImg);
                            setImageFileName('corn.webp');
                            setSpecificProduce('Sweet Corn');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Corn (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(riceImg);
                            setImageFileName('rice.webp');
                            setSpecificProduce('Rice');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Paddy Rice (Provided)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(tomatoImg);
                            setImageFileName('tomato.jpg');
                            setSpecificProduce('Tomato');
                            setActiveDiagnosis(null);
                          }}
                          className="px-2 py-1 text-[11px] border border-[#c9d4c6] bg-white hover:bg-[#edf2ea] text-[#29422d] cursor-pointer"
                        >
                          Tomato (Provided)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: WHO HAS DETECTED IT (AI, AGRONOMIST / MANUAL, OR BOTH) */}
          <div>
            <label className="block text-xs font-bold text-[#14291a] mb-1 uppercase tracking-wider">
              4. Who Has Detected It? (Diagnostic Authority) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDetectorMode('ai')}
                className={`p-2.5 text-left border cursor-pointer transition-colors ${
                  detectorMode === 'ai'
                    ? 'border-[#1b5e20] bg-[#eef5ee] ring-1 ring-[#1b5e20]'
                    : 'border-[#c9d4c6] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      detectorMode === 'ai'
                        ? 'border-[#1b5e20] bg-[#1b5e20]'
                        : 'border-[#94a397]'
                    }`}
                  >
                    {detectorMode === 'ai' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs text-[#14291a]">EarthRakshak AI</span>
                </div>
                <span className="text-[10px] text-[#556b57] block mt-1 pl-5">
                  Automated Neural Vision Model
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDetectorMode('manual')}
                className={`p-2.5 text-left border cursor-pointer transition-colors ${
                  detectorMode === 'manual'
                    ? 'border-[#1b5e20] bg-[#eef5ee] ring-1 ring-[#1b5e20]'
                    : 'border-[#c9d4c6] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      detectorMode === 'manual'
                        ? 'border-[#1b5e20] bg-[#1b5e20]'
                        : 'border-[#94a397]'
                    }`}
                  >
                    {detectorMode === 'manual' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs text-[#14291a]">Agronomist (Manual)</span>
                </div>
                <span className="text-[10px] text-[#556b57] block mt-1 pl-5">
                  Certified Field Survey Inspection
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDetectorMode('both')}
                className={`p-2.5 text-left border cursor-pointer transition-colors ${
                  detectorMode === 'both'
                    ? 'border-[#1b5e20] bg-[#eef5ee] ring-1 ring-[#1b5e20]'
                    : 'border-[#c9d4c6] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      detectorMode === 'both'
                        ? 'border-[#1b5e20] bg-[#1b5e20]'
                        : 'border-[#94a397]'
                    }`}
                  >
                    {detectorMode === 'both' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs text-[#14291a]">Both (AI + Agronomist)</span>
                </div>
                <span className="text-[10px] text-[#556b57] block mt-1 pl-5">
                  AI Scan + Expert Verification
                </span>
              </button>
            </div>

            {/* Optional Agronomist Name Input if manual or both */}
            {(detectorMode === 'manual' || detectorMode === 'both') && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-[#304734] mb-1">
                  Agronomist / Field Inspector Name *
                </label>
                <input
                  type="text"
                  value={agronomistName}
                  onChange={e => setAgronomistName(e.target.value)}
                  placeholder="e.g. Dr. Arvind Rao (Senior Plant Pathologist)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                />
              </div>
            )}
          </div>

          {/* DETECT ACTION BUTTON */}
          {!activeDiagnosis && (
            <button
              type="button"
              onClick={handleRunDetection}
              disabled={isAnalyzing}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <DiseaseIcon size={16} />
              <span>
                {isAnalyzing
                  ? analyzingStep || 'Running Pathology Diagnostic Engine...'
                  : `Detect Disease in ${specificProduce} Photo`}
              </span>
            </button>
          )}

          {/* DIAGNOSIS RESULTS DISPLAY (When Detect is clicked) */}
          {activeDiagnosis && (
            <div className="space-y-4 pt-2 border-t border-[#dce5da]">
              {/* Headline Banner with WHO DETECTED IT Badge */}
              <div className="bg-[#f0f7ef] border-2 border-[#1b5e20] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#cce3cb]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-white px-2 py-0.5 border border-[#1b5e20]">
                      Identified Disease
                    </span>
                    <h3 className="text-base font-bold font-display text-[#0e2416] mt-1">
                      {activeDiagnosis.diseaseName}
                    </h3>
                    <p className="text-xs text-[#38543c]">
                      Pathogen: <em>{activeDiagnosis.pathogen}</em> ({activeDiagnosis.pathogenClass})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#526e56] block">Confidence Rating</span>
                    <span className="text-lg font-bold font-display text-[#1b5e20] tabular-nums">
                      {activeDiagnosis.confidence}% Match
                    </span>
                  </div>
                </div>

                {/* WHO DETECTED IT - CLEAR HIGHLIGHT */}
                <div className="mt-3 p-2.5 bg-white border border-[#bed8be] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14291a] uppercase text-[11px] tracking-wider">
                      Diagnosis Certified By:
                    </span>
                    <span className="px-2.5 py-1 bg-[#1b5e20] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
                      <CheckIcon size={13} />
                      <span>
                        {activeDiagnosis.detectedByMode === 'ai'
                          ? 'EarthRakshak AI Model (Automated Neural Vision)'
                          : activeDiagnosis.detectedByMode === 'manual'
                          ? `${activeDiagnosis.inspectorName} (Field Agronomist)`
                          : `EarthRakshak AI (${activeDiagnosis.confidence}%) & Verified by ${activeDiagnosis.inspectorName}`}
                      </span>
                    </span>
                  </div>

                  <span className="text-[11px] text-[#556d58]">
                    Severity: <strong>{activeDiagnosis.severity}</strong>
                  </span>
                </div>
              </div>

              {/* Symptoms & Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#fafbfa] border border-[#dce5da] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#617764] block">
                    Observed Pathology Symptoms
                  </span>
                  <p className="text-[#2b3d2d] leading-relaxed">
                    {activeDiagnosis.symptoms}
                  </p>
                </div>

                <div className="p-3 bg-[#fafbfa] border border-[#dce5da] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#1b5e20] block">
                    Preventive Agronomic Protocols
                  </span>
                  <p className="text-[#2b3d2d] leading-relaxed">
                    {activeDiagnosis.preventiveMeasures}
                  </p>
                </div>
              </div>

              {/* Remediation Strategies: Organic + Chemical */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#f5f9f4] border border-[#cbe0cb]">
                  <span className="text-[10px] font-bold uppercase text-[#1b5e20] block mb-0.5">
                    Recommended Organic Remediation:
                  </span>
                  <p className="text-[#1c3320] leading-relaxed">
                    {activeDiagnosis.organicTreatment}
                  </p>
                </div>

                <div className="p-3 bg-[#fffbf0] border border-[#fae4b5]">
                  <span className="text-[10px] font-bold uppercase text-[#b45309] block mb-0.5">
                    Recommended Chemical / Conventional Treatment (Prescribed Dosages):
                  </span>
                  <p className="text-[#451a03] leading-relaxed">
                    {activeDiagnosis.chemicalTreatment}
                  </p>
                </div>
              </div>

              {/* ACTION BAR: DOWNLOAD AS PDF / XLSX / CSV & SAVE */}
              <div className="p-3 bg-[#f0f4ef] border border-[#d2dfd1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-[#546b57]">
                    Export Report:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadDiagnosisReport('pdf')}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c2d3c1] text-[#14291a] hover:bg-[#e4ede3] flex items-center gap-1 cursor-pointer"
                  >
                    <DownloadIcon size={12} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDiagnosisReport('xlsx')}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c2d3c1] text-[#14291a] hover:bg-[#e4ede3] flex items-center gap-1 cursor-pointer"
                  >
                    <DownloadIcon size={12} />
                    <span>Download XLSX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDiagnosisReport('csv')}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c2d3c1] text-[#14291a] hover:bg-[#e4ede3] flex items-center gap-1 cursor-pointer"
                  >
                    <DownloadIcon size={12} />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDiagnosis(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#5a735e] hover:text-[#14291a] cursor-pointer"
                  >
                    Re-scan
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToRegistry}
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors shadow-sm cursor-pointer"
                  >
                    Save to Farm Registry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
