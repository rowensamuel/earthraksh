// ============================================================================
// EARTHRAKSHAK ERP — CENTRAL ASSET REGISTRY
// Imports and exports all authenticated project media assets.
// Vite bundles these with hashed URLs for reliable dev & production builds.
// ============================================================================

// 1. Home Page Hero & Authentication Backgrounds
import homeHeroImage from './images/home page/46506fc2-a581-454f-8287-92a1a168c2d8.jpg';

// 2. Farmer Walking Navigation Animation Video
import farmerWalkingVideo from './images/walking animation/Farmer planting.mp4';

// 3. Vegetable & Produce Assets (Accredited Agricultural Harvests)
import brinjalImg from './images/diease detection/brinjal.webp';
import capsicumImg from './images/diease detection/capiscum.webp';
import cauliflowerImg from './images/diease detection/cauliflower.webp';
import chilliImg from './images/diease detection/chilli.webp';
import cornImg from './images/diease detection/corn.webp';
import cucumberImg from './images/diease detection/cucumber.webp';
import okraImg from './images/diease detection/okra.webp';
import onionImg from './images/diease detection/onion.webp';
import riceImg from './images/diease detection/rice.webp';
import tomatoImg from './images/diease detection/tomato.jpg';

// 4. Equipment & Machinery Assets (Machinery Sharing Pool)
import droneImg from './images/my equipment/drone.webp';
import harvesterImg from './images/my equipment/harvestor.webp';
import rotavatorImg from './images/my equipment/rotovatar.webp';
import seedDrillImg from './images/my equipment/seed drill.webp';
import solarPumpImg from './images/my equipment/solar pump.webp';
import sprayerImg from './images/my equipment/sprayer.webp';
import tractorImg from './images/my equipment/tractor.webp';
import waterPumpImg from './images/my equipment/water pump.webp';

// 5. Agronomic Storytelling Assets (Split-Screen Sticky Storytelling)
import soilHealthImg from './images/soil-health.jpg.png';
import soilAnalysisImg from './images/analysis.png';
import cropDiagnosisImg from './images/crop-diagnosis.jpg.png';
import smartFarmingImg from './images/smart-farming.jpg.png';

export {
  homeHeroImage,
  farmerWalkingVideo,
  soilHealthImg,
  soilAnalysisImg,
  cropDiagnosisImg,
  smartFarmingImg,
  brinjalImg,
  capsicumImg,
  cauliflowerImg,
  chilliImg,
  cornImg,
  cucumberImg,
  okraImg,
  onionImg,
  riceImg,
  tomatoImg,
  droneImg,
  harvesterImg,
  rotavatorImg,
  seedDrillImg,
  solarPumpImg,
  sprayerImg,
  tractorImg,
  waterPumpImg
};

/**
 * Maps an equipment item or name to its corresponding high-fidelity asset image.
 */
export const getEquipmentImage = (nameOrType?: string): string => {
  if (!nameOrType) return tractorImg;
  const lower = nameOrType.toLowerCase();
  if (lower.includes('drone')) return droneImg;
  if (lower.includes('harvester') || lower.includes('harvestor') || lower.includes('combine')) return harvesterImg;
  if (lower.includes('rotavator') || lower.includes('rotovatar') || lower.includes('tiller')) return rotavatorImg;
  if (lower.includes('seed drill') || lower.includes('planter') || lower.includes('sowing')) return seedDrillImg;
  if (lower.includes('solar')) return solarPumpImg;
  if (lower.includes('sprayer') || lower.includes('spray')) return sprayerImg;
  if (lower.includes('pump') || lower.includes('water pump')) return waterPumpImg;
  if (lower.includes('tractor') || lower.includes('utility') || lower.includes('4wd')) return tractorImg;
  return tractorImg;
};

/**
 * Maps a produce/crop item or category to its corresponding agricultural harvest image.
 */
export const getProduceImage = (nameOrCategory?: string): string => {
  if (!nameOrCategory) return tomatoImg;
  const lower = nameOrCategory.toLowerCase();
  if (lower.includes('tomato')) return tomatoImg;
  if (lower.includes('brinjal') || lower.includes('eggplant')) return brinjalImg;
  if (lower.includes('capsicum') || lower.includes('capiscum') || lower.includes('pepper')) return capsicumImg;
  if (lower.includes('cauliflower') || lower.includes('cabbage')) return cauliflowerImg;
  if (lower.includes('chilli') || lower.includes('chili') || lower.includes('mirchi')) return chilliImg;
  if (lower.includes('corn') || lower.includes('maize')) return cornImg;
  if (lower.includes('cucumber') || lower.includes('kheera')) return cucumberImg;
  if (lower.includes('okra') || lower.includes('ladyfinger') || lower.includes('bhindi')) return okraImg;
  if (lower.includes('onion') || lower.includes('pyaz')) return onionImg;
  if (lower.includes('rice') || lower.includes('basmati') || lower.includes('paddy') || lower.includes('grain')) return riceImg;
  if (lower.includes('vegetable')) return cauliflowerImg;
  return tomatoImg;
};

export const PRODUCE_IMAGE_MAP: Record<string, string> = {
  Tomato: tomatoImg,
  Brinjal: brinjalImg,
  Capsicum: capsicumImg,
  Cauliflower: cauliflowerImg,
  Chilli: chilliImg,
  Corn: cornImg,
  Cucumber: cucumberImg,
  Okra: okraImg,
  Onion: onionImg,
  Rice: riceImg
};

export const EQUIPMENT_IMAGE_MAP: Record<string, string> = {
  Tractor: tractorImg,
  Harvester: harvesterImg,
  Rotavator: rotavatorImg,
  'Seed Drill': seedDrillImg,
  'Solar Pump': solarPumpImg,
  Sprayer: sprayerImg,
  Drone: droneImg,
  'Water Pump': waterPumpImg
};
