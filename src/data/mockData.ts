import {
  User,
  Farm,
  Crop,
  SoilHealth,
  CropDiseaseReport,
  InventoryItem,
  Equipment,
  EquipmentMaintenance,
  MarketplaceProduct,
  Order,
  Payment,
  WeatherLog,
  FinanceRecord
} from '../types';
import {
  tractorImg,
  harvesterImg,
  rotavatorImg,
  droneImg,
  sprayerImg,
  seedDrillImg,
  solarPumpImg,
  waterPumpImg,
  riceImg,
  cornImg,
  capsicumImg,
  cauliflowerImg,
  chilliImg,
  tomatoImg,
  brinjalImg,
  cucumberImg,
  okraImg,
  onionImg
} from '../assets/assetRegistry';

export const INITIAL_USERS: User[] = [
  {
    user_id: 'USR-001',
    role: 'ADMIN',
    full_name: 'Dr. Vikram Deshmukh',
    email: 'admin.vikram@earthrakshak.org',
    mobile: '+91 98230 44910',
    address: 'Krishi Bhavan, Agri Directorate, Pune, Maharashtra 411005',
    status: 'Active',
    created_at: '2024-01-10',
    designation: 'Chief Agri Planning Administrator',
    verified: true
  },
  {
    user_id: 'USR-002',
    role: 'FARMER',
    full_name: 'Rajesh Patil',
    email: 'rajesh.patil@greenvalleyfarm.in',
    mobile: '+91 94222 88412',
    address: 'Plot 14, Ozar Rural Sector, Nashik District, Maharashtra 422206',
    status: 'Active',
    created_at: '2024-02-15',
    designation: 'Lead Organic Agronomist & Farm Owner',
    verified: true
  },
  {
    user_id: 'USR-003',
    role: 'BUYER',
    full_name: 'Sunita Sharma',
    email: 'procurement@agromart.co.in',
    mobile: '+91 98110 32789',
    address: 'AgroMart Logistics Hub, APMC Yard Vashi, Navi Mumbai 400703',
    status: 'Active',
    created_at: '2024-03-01',
    designation: 'Head of Wholesale Grain & Fresh Produce Sourcing',
    verified: true
  },
  {
    user_id: 'USR-004',
    role: 'FARMER',
    full_name: 'Sardar Balwinder Singh',
    email: 'balwinder.grain@punjabfarms.net',
    mobile: '+91 98765 43210',
    address: 'Khurd Agro Estate, Ludhiana, Punjab 141008',
    status: 'Active',
    created_at: '2024-02-20',
    designation: 'Cereal Grains Cultivator',
    verified: true
  },
  {
    user_id: 'USR-005',
    role: 'FARMER',
    full_name: 'Ananya Raman',
    email: 'ananya@kaverispices.org',
    mobile: '+91 94441 55670',
    address: 'Riverbank Agro Zone, Thanjavur, Tamil Nadu 613001',
    status: 'Active',
    created_at: '2024-04-05',
    designation: 'Spice & Paddy Cultivator',
    verified: true
  },
  {
    user_id: 'USR-006',
    role: 'BUYER',
    full_name: 'Devendra Kulkarni',
    email: 'devendra@freshharvestexports.com',
    mobile: '+91 99201 12345',
    address: 'Cold Storage Terminal 4, JNPT Special Economic Zone, Uran 400707',
    status: 'Active',
    created_at: '2024-04-12',
    designation: 'Export Procurement Manager',
    verified: true
  },
  {
    user_id: 'USR-007',
    role: 'BUYER',
    full_name: 'Meera Nambiar',
    email: 'meera.organics@southernbaskets.in',
    mobile: '+91 97450 99881',
    address: 'MG Road Central Depot, Bengaluru, Karnataka 560001',
    status: 'Inactive',
    created_at: '2024-05-18',
    designation: 'Retail Organic Supply Manager',
    verified: false
  }
];

export const INITIAL_FARMS: Farm[] = [
  {
    farm_id: 'FRM-101',
    user_id: 'USR-002',
    farm_name: 'Green Valley North Basin',
    location: 'Ozar Agri Cluster, Nashik, Maharashtra',
    area: 24.5,
    area_unit: 'Acres',
    soil_type: 'Black Soil',
    water_source: 'Drip Irrigation',
    active_crops_count: 2,
    established_year: 2018
  },
  {
    farm_id: 'FRM-102',
    user_id: 'USR-002',
    farm_name: 'Green Valley South Orchards',
    location: 'Niphad Tehsil, Nashik, Maharashtra',
    area: 15.0,
    area_unit: 'Acres',
    soil_type: 'Loamy',
    water_source: 'Borewell',
    active_crops_count: 2,
    established_year: 2020
  },
  {
    farm_id: 'FRM-103',
    user_id: 'USR-004',
    farm_name: 'Golden Plains Wheat Belt',
    location: 'Samrala Block, Ludhiana, Punjab',
    area: 42.0,
    area_unit: 'Acres',
    soil_type: 'Alluvial',
    water_source: 'Canal',
    active_crops_count: 1,
    established_year: 2012
  },
  {
    farm_id: 'FRM-104',
    user_id: 'USR-005',
    farm_name: 'Kaveri River Delta Organic Plots',
    location: 'Delta Green Zone, Thanjavur, Tamil Nadu',
    area: 18.5,
    area_unit: 'Acres',
    soil_type: 'Clay',
    water_source: 'River',
    active_crops_count: 1,
    established_year: 2016
  }
];

export const INITIAL_CROPS: Crop[] = [
  {
    crop_id: 'CRP-201',
    farm_id: 'FRM-101',
    farm_name: 'Green Valley North Basin',
    crop_name: 'Basmati Rice',
    variety: 'Pusa 1121 Extra Long',
    season: 'Kharif',
    planting_date: '2026-06-20',
    expected_harvest: '2026-11-15',
    status: 'Growing',
    expected_yield: 14.5,
    health_score: 94
  },
  {
    crop_id: 'CRP-202',
    farm_id: 'FRM-101',
    farm_name: 'Green Valley North Basin',
    crop_name: 'Organic Bell Peppers',
    variety: 'Indra F1 Hybrid Green',
    season: 'Rabi',
    planting_date: '2026-08-10',
    expected_harvest: '2026-12-05',
    status: 'Growing',
    expected_yield: 8.2,
    health_score: 88
  },
  {
    crop_id: 'CRP-203',
    farm_id: 'FRM-102',
    farm_name: 'Green Valley South Orchards',
    crop_name: 'Alphonso Mango',
    variety: 'Ratnagiri Geographical GI Clone',
    season: 'Zaid',
    planting_date: '2025-11-01',
    expected_harvest: '2026-05-20',
    status: 'Harvested',
    expected_yield: 11.0,
    actual_yield: 11.4,
    health_score: 96
  },
  {
    crop_id: 'CRP-204',
    farm_id: 'FRM-102',
    farm_name: 'Green Valley South Orchards',
    crop_name: 'Soybean',
    variety: 'JS-335 Seed Grade',
    season: 'Kharif',
    planting_date: '2026-07-02',
    expected_harvest: '2026-10-25',
    status: 'Growing',
    expected_yield: 9.8,
    health_score: 85
  },
  {
    crop_id: 'CRP-205',
    farm_id: 'FRM-103',
    farm_name: 'Golden Plains Wheat Belt',
    crop_name: 'Durum Wheat',
    variety: 'HD-2967 High Protein',
    season: 'Rabi',
    planting_date: '2025-11-14',
    expected_harvest: '2026-04-10',
    status: 'Harvested',
    expected_yield: 24.0,
    actual_yield: 25.2,
    health_score: 92
  }
];

export const INITIAL_SOIL_RECORDS: SoilHealth[] = [
  {
    soil_id: 'SL-301',
    farm_id: 'FRM-101',
    farm_name: 'Green Valley North Basin',
    ph_level: 6.8,
    nitrogen: 280,
    phosphorus: 45,
    potassium: 220,
    moisture: 24,
    organic_carbon: 0.84,
    fertility_status: 'High',
    test_date: '2026-08-15',
    recommendations: [
      'Optimal pH index for Kharif cereal crops',
      'Apply 15 kg/acre bio-potash supplement during grain fill stage',
      'Maintain drip irrigation interval at 48-hour cycles'
    ]
  },
  {
    soil_id: 'SL-302',
    farm_id: 'FRM-102',
    farm_name: 'Green Valley South Orchards',
    ph_level: 7.3,
    nitrogen: 195,
    phosphorus: 28,
    potassium: 165,
    moisture: 18,
    organic_carbon: 0.58,
    fertility_status: 'Medium',
    test_date: '2026-07-28',
    recommendations: [
      'Soil is slightly alkaline; incorporate 2 tonnes/acre vermicompost',
      'Split nitrogen dosage into 3 fertigation sessions',
      'Test micronutrient zinc and boron profile next cycle'
    ]
  },
  {
    soil_id: 'SL-303',
    farm_id: 'FRM-103',
    farm_name: 'Golden Plains Wheat Belt',
    ph_level: 7.1,
    nitrogen: 310,
    phosphorus: 52,
    potassium: 240,
    moisture: 21,
    organic_carbon: 0.91,
    fertility_status: 'High',
    test_date: '2026-06-12',
    recommendations: [
      'Excellent macro-nutrient concentration',
      'Green manuring with Dhaincha recommended post Rabi harvest'
    ]
  }
];

export const INITIAL_DISEASE_REPORTS: CropDiseaseReport[] = [
  {
    report_id: 'DIS-401',
    crop_id: 'CRP-201',
    crop_name: 'Basmati Rice',
    farm_name: 'Green Valley North Basin',
    disease_name: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    symptoms: 'Water-soaked translucent lesions along leaf margins expanding into yellowish-white stripes.',
    severity: 'Mild',
    detected_date: '2026-09-22',
    suggested_treatment: 'Drain standing water for 48 hours. Spray Copper Oxychloride 50 WP (2.5 g/L) + Streptocycline (100 mg/L).',
    status: 'Under Treatment'
  },
  {
    report_id: 'DIS-402',
    crop_id: 'CRP-204',
    crop_name: 'Soybean',
    farm_name: 'Green Valley South Orchards',
    disease_name: 'Yellow Mosaic Virus (MYMV)',
    symptoms: 'Bright yellow scattered patches on foliage with slight leaf curling and stunted node formation.',
    severity: 'Moderate',
    detected_date: '2026-09-18',
    suggested_treatment: 'Eradicate rogue diseased plants. Apply neem-based repellent 1500 ppm or Thiamethoxam 25 WG to control whitefly vector.',
    status: 'Active'
  },
  {
    report_id: 'DIS-403',
    crop_id: 'CRP-202',
    crop_name: 'Organic Bell Peppers',
    farm_name: 'Green Valley North Basin',
    disease_name: 'Powdery Mildew (Leveillula taurica)',
    symptoms: 'White powdery patches on underside of leaves accompanied by chlorotic spots on upper lamina.',
    severity: 'Mild',
    detected_date: '2026-09-02',
    suggested_treatment: 'Foliar application of bio-fungicide Ampelomyces quisqualis or Wettable Sulphur 80 WP at 2 g/L.',
    status: 'Resolved'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    item_id: 'INV-501',
    user_id: 'USR-002',
    item_name: 'Certified Basmati Pusa-1121 Seed Stock',
    category: 'Seed',
    quantity: 120,
    unit: 'Kg',
    unit_price: 140,
    supplier: 'National Seeds Corporation Ltd.',
    status: 'In Stock',
    expiry_date: '2027-05-30'
  },
  {
    item_id: 'INV-502',
    user_id: 'USR-002',
    item_name: 'Neem-Coated Urea (Slow Release)',
    category: 'Fertilizer',
    quantity: 45,
    unit: 'Bags',
    unit_price: 268,
    supplier: 'IFFCO Farmers Cooperative',
    status: 'In Stock',
    expiry_date: '2028-01-01'
  },
  {
    item_id: 'INV-503',
    user_id: 'USR-002',
    item_name: 'Di-Ammonium Phosphate (DAP 18-46-0)',
    category: 'Fertilizer',
    quantity: 6,
    unit: 'Bags',
    unit_price: 1350,
    supplier: 'Coromandel International',
    status: 'Low Stock',
    expiry_date: '2027-12-15'
  },
  {
    item_id: 'INV-504',
    user_id: 'USR-002',
    item_name: 'Trichoderma Viride Bio-Fungicide Powder',
    category: 'Pesticide',
    quantity: 2,
    unit: 'Kg',
    unit_price: 360,
    supplier: 'AgriBio Solutions Ltd.',
    status: 'Critical',
    expiry_date: '2026-11-20'
  },
  {
    item_id: 'INV-505',
    user_id: 'USR-002',
    item_name: 'Drip Lateral Irrigation Line (16mm inline)',
    category: 'Equipment',
    quantity: 16,
    unit: 'Units',
    unit_price: 1850,
    supplier: 'Jain Irrigation Systems',
    status: 'In Stock'
  },
  {
    item_id: 'INV-506',
    user_id: 'USR-002',
    item_name: 'Emamectin Benzoate 5% SG Caterpillar Control',
    category: 'Pesticide',
    quantity: 14,
    unit: 'Packets',
    unit_price: 520,
    supplier: 'Syngenta Crop Protection',
    status: 'In Stock',
    expiry_date: '2027-08-30'
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    equipment_id: 'EQP-601',
    user_id: 'USR-002',
    owner_name: 'Rajesh Patil (Green Valley Farms)',
    equipment_name: 'John Deere 5050D 4WD Utility Tractor',
    model: '50 HP Heavy Duty PowerReverser, 2022',
    purchase_date: '2022-03-10',
    rental_rate_per_day: 2400,
    availability_status: 'Available',
    condition_status: 'Excellent',
    description: 'Equipped with dual clutch, power steering, and auxiliary hydraulic remotes for tilling and hauling.',
    image_url: tractorImg
  },
  {
    equipment_id: 'EQP-602',
    user_id: 'USR-002',
    owner_name: 'Rajesh Patil (Green Valley Farms)',
    equipment_name: 'Shaktiman 7-Foot Heavy Duty Rotary Tiller',
    model: 'Rotavator SRT-7 with Boron Steel L-Blades',
    purchase_date: '2023-01-18',
    rental_rate_per_day: 1100,
    availability_status: 'Available',
    condition_status: 'Excellent',
    description: 'Deep seedbed preparation attachment compatible with 45-60 HP tractors.',
    image_url: rotavatorImg
  },
  {
    equipment_id: 'EQP-603',
    user_id: 'USR-004',
    owner_name: 'Sardar Balwinder Singh',
    equipment_name: 'Preet 987 Self-Propelled Multi-Crop Combine Harvester',
    model: 'Heavy Duty 101 HP Turbocharged Engine, 2021',
    purchase_date: '2021-08-05',
    rental_rate_per_day: 5800,
    availability_status: 'Rented',
    condition_status: 'Good',
    description: '14-foot cutter bar, high grain tank capacity suitable for wheat, paddy, and soybean.',
    image_url: harvesterImg
  },
  {
    equipment_id: 'EQP-604',
    user_id: 'USR-002',
    owner_name: 'Rajesh Patil (Green Valley Farms)',
    equipment_name: 'AgriBot Precision Hexacopter Drone Sprayer',
    model: '16-Litre Quad-Nozzle RTK Precision GPS, 2024',
    purchase_date: '2024-02-14',
    rental_rate_per_day: 3200,
    availability_status: 'Available',
    condition_status: 'Excellent',
    description: 'Autonomous waypoint flight, terrain following radar, covers 25 acres in a single day.',
    image_url: droneImg
  },
  {
    equipment_id: 'EQP-605',
    user_id: 'USR-002',
    owner_name: 'Rajesh Patil (Green Valley Farms)',
    equipment_name: 'High-Pressure Orchard & Field Sprayer',
    model: 'ASPEE Heavy Duty Boom Sprayer with 500L Tank',
    purchase_date: '2023-05-20',
    rental_rate_per_day: 950,
    availability_status: 'Available',
    condition_status: 'Good',
    description: 'Tractor-mounted diaphragm pump sprayer for pest control and foliar nutrition.',
    image_url: sprayerImg
  },
  {
    equipment_id: 'EQP-606',
    user_id: 'USR-004',
    owner_name: 'Sardar Balwinder Singh',
    equipment_name: 'Precision Automatic Seed Drill & Fertilizer Planter',
    model: '11-Tyne Multi-Crop Zero-Till Seed Drill, 2023',
    purchase_date: '2023-10-11',
    rental_rate_per_day: 1400,
    availability_status: 'Available',
    condition_status: 'Excellent',
    description: 'Accurate seed meter fluted rollers with dual box for simultaneous fertilizer placement.',
    image_url: seedDrillImg
  },
  {
    equipment_id: 'EQP-607',
    user_id: 'USR-002',
    owner_name: 'Rajesh Patil (Green Valley Farms)',
    equipment_name: 'Solar-Powered DC Submersible Agricultural Pump',
    model: '5 HP High-Discharge Solar Water Pump Unit',
    purchase_date: '2024-01-05',
    rental_rate_per_day: 1200,
    availability_status: 'Available',
    condition_status: 'Excellent',
    description: 'Eco-friendly MPPT solar drive pump providing high water head for drip irrigation lines.',
    image_url: solarPumpImg
  },
  {
    equipment_id: 'EQP-608',
    user_id: 'USR-005',
    owner_name: 'Ananya Raman',
    equipment_name: 'Heavy Duty High-Discharge Centrifugal Water Pump',
    model: 'Kirloskar 7.5 HP Diesel Dewatering & Irrigation Pump',
    purchase_date: '2022-11-15',
    rental_rate_per_day: 750,
    availability_status: 'Available',
    condition_status: 'Good',
    description: 'Portable cast iron centrifugal pump for canal and river water intake lift irrigation.',
    image_url: waterPumpImg
  }
];

export const INITIAL_MAINTENANCE: EquipmentMaintenance[] = [
  {
    maintenance_id: 'MNT-701',
    equipment_id: 'EQP-601',
    maintenance_type: 'Engine Oil Service',
    cost: 4200,
    maintenance_date: '2026-08-10',
    next_due_date: '2027-02-10',
    notes: 'Engine oil 15W-40 replaced, hydraulic filter renewed, radiator flushed.'
  },
  {
    maintenance_id: 'MNT-702',
    equipment_id: 'EQP-602',
    maintenance_type: 'Blade Replacement',
    cost: 3100,
    maintenance_date: '2026-07-20',
    next_due_date: '2027-01-20',
    notes: 'Installed set of 42 high carbon wear-resistant rotary tiller blades.'
  },
  {
    maintenance_id: 'MNT-703',
    equipment_id: 'EQP-605',
    maintenance_type: 'Hydraulic Overhaul',
    cost: 5800,
    maintenance_date: '2026-09-25',
    next_due_date: '2027-03-25',
    notes: 'Repairing drive shaft bearings and threshing cylinder teeth.'
  }
];

export const INITIAL_PRODUCTS: MarketplaceProduct[] = [
  {
    product_id: 'PRD-801',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Heritage Basmati Rice 1121 Extra Long',
    category: 'Grains',
    price_per_unit: 4250,
    unit: 'Quintal',
    available_qty: 85,
    description: 'Naturally aged 18 months, unadulterated slender grains with average uncooked length of 8.4mm. Distinct floral aroma, perfect for culinary and export procurement.',
    image_url: riceImg,
    harvest_date: '2025-11-20',
    certification: 'Organic India',
    status: 'Active',
    rating: 4.9,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-802',
    seller_id: 'USR-004',
    seller_name: 'Sardar Balwinder Singh',
    seller_location: 'Ludhiana, Punjab',
    product_name: 'Sweet Corn & Golden Grain Lot (Hybrid Syngenta)',
    category: 'Grains',
    price_per_unit: 2850,
    unit: 'Quintal',
    available_qty: 140,
    description: 'Lustrous, heavy golden grains with elevated nutrient profile. Machine cleaned, destoned, moisture tested under 11%.',
    image_url: cornImg,
    harvest_date: '2026-04-12',
    certification: 'GAP Certified',
    status: 'Active',
    rating: 4.8,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-803',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Farm Fresh Vine-Ripened Red Tomatoes (Vaishali)',
    category: 'Vegetables',
    price_per_unit: 38,
    unit: 'Kg',
    available_qty: 1500,
    description: 'High-firmness table and processing tomatoes, naturally ripened with high brix sweetness and uniform crimson hue.',
    image_url: tomatoImg,
    harvest_date: '2026-09-29',
    certification: 'Organic India',
    status: 'Active',
    rating: 5.0,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-804',
    seller_id: 'USR-005',
    seller_name: 'Ananya Raman',
    seller_location: 'Thanjavur, Tamil Nadu',
    product_name: 'Fresh Pungent Guntur Green Chillies',
    category: 'Vegetables',
    price_per_unit: 65,
    unit: 'Kg',
    available_qty: 350,
    description: 'High capsaicin vibrant green chillies harvested at peak pungency, double sorted and free from blossom end rot.',
    image_url: chilliImg,
    harvest_date: '2026-09-30',
    certification: 'Organic India',
    status: 'Active',
    rating: 4.9,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-805',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Greenhouse Crisp Bell Peppers (Capsicum)',
    category: 'Vegetables',
    price_per_unit: 68,
    unit: 'Kg',
    available_qty: 1200,
    description: 'Polyhouse hydroponic-grown dark green thick-walled bell peppers with minimum shelf life of 12 days in cold storage.',
    image_url: capsicumImg,
    harvest_date: '2026-09-28',
    certification: 'GAP Certified',
    status: 'Active',
    rating: 4.7,
    grade: 'Grade A'
  },
  {
    product_id: 'PRD-806',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Pure White Compact Snowball Cauliflower',
    category: 'Vegetables',
    price_per_unit: 42,
    unit: 'Kg',
    available_qty: 800,
    description: 'Pristine white dense curd heads protected by wrapper leaves, harvested early morning for crisp texture and zero discoloration.',
    image_url: cauliflowerImg,
    harvest_date: '2026-09-27',
    certification: 'GAP Certified',
    status: 'Active',
    rating: 4.8,
    grade: 'Grade A'
  },
  {
    product_id: 'PRD-807',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Export Cluster Dark Purple Glossy Brinjal',
    category: 'Vegetables',
    price_per_unit: 35,
    unit: 'Kg',
    available_qty: 950,
    description: 'Tender calyx, seedless interior, smooth glossy skin harvested from certified pest-monitored drip irrigation blocks.',
    image_url: brinjalImg,
    harvest_date: '2026-09-29',
    certification: 'Organic India',
    status: 'Active',
    rating: 4.9,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-808',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Hydrated Farm Crisp Green Salad Cucumbers',
    category: 'Vegetables',
    price_per_unit: 30,
    unit: 'Kg',
    available_qty: 1100,
    description: 'Seedless parthenocarpic greenhouse cucumbers with thin skin, excellent crunch, and high moisture retention.',
    image_url: cucumberImg,
    harvest_date: '2026-09-30',
    certification: 'GAP Certified',
    status: 'Active',
    rating: 4.8,
    grade: 'Grade A'
  },
  {
    product_id: 'PRD-809',
    seller_id: 'USR-004',
    seller_name: 'Sardar Balwinder Singh',
    seller_location: 'Ludhiana, Punjab',
    product_name: 'Tender Fresh Green Okra (Bhindi Special)',
    category: 'Vegetables',
    price_per_unit: 48,
    unit: 'Kg',
    available_qty: 600,
    description: 'Slender, deep green, snap-fresh pods with zero fiber toughness. Hand-harvested and graded for immediate kitchen wholesale dispatch.',
    image_url: okraImg,
    harvest_date: '2026-09-29',
    certification: 'Organic India',
    status: 'Active',
    rating: 4.9,
    grade: 'Grade A1'
  },
  {
    product_id: 'PRD-810',
    seller_id: 'USR-002',
    seller_name: 'Rajesh Patil',
    seller_location: 'Nashik, Maharashtra',
    product_name: 'Nashik Geographic Indication Red Cured Onions',
    category: 'Vegetables',
    price_per_unit: 26,
    unit: 'Kg',
    available_qty: 5000,
    description: 'Pungent globe-shaped cured red onions with tight skin and multi-month storage resilience, free from sprouting.',
    image_url: onionImg,
    harvest_date: '2026-09-20',
    certification: 'GAP Certified',
    status: 'Active',
    rating: 5.0,
    grade: 'Premium Export'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    order_id: 'ORD-901',
    buyer_id: 'USR-003',
    buyer_name: 'Sunita Sharma (AgroMart Wholesales)',
    seller_id: 'USR-002',
    total_amount: 85000,
    order_status: 'Shipped',
    shipping_address: 'AgroMart Logistics Hub, APMC Yard Gate 4, Vashi, Navi Mumbai 400703',
    order_date: '2026-09-26',
    tracking_number: 'EK-AGRI-882194',
    items: [
      {
        order_item_id: 'ORI-1001',
        order_id: 'ORD-901',
        product_id: 'PRD-801',
        product_name: 'Heritage Basmati Rice 1121 Extra Long',
        category: 'Grains',
        quantity: 20,
        unit: 'Quintal',
        unit_price: 4250,
        subtotal: 85000
      }
    ],
    payment_method: 'UPI',
    payment_status: 'Completed',
    dispatch_date: '2026-09-28',
    estimated_delivery: '2026-10-02'
  },
  {
    order_id: 'ORD-902',
    buyer_id: 'USR-006',
    buyer_name: 'Devendra Kulkarni (FreshHarvest Exports)',
    seller_id: 'USR-002',
    total_amount: 145000,
    order_status: 'Confirmed',
    shipping_address: 'Cold Storage Terminal 4, JNPT Special Economic Zone, Uran 400707',
    order_date: '2026-09-29',
    tracking_number: 'EK-AGRI-882205',
    items: [
      {
        order_item_id: 'ORI-1002',
        order_id: 'ORD-902',
        product_id: 'PRD-803',
        product_name: 'Export Grade Alphonso Mangoes (GI Certified)',
        category: 'Fruits',
        quantity: 100,
        unit: 'Box',
        unit_price: 1450,
        subtotal: 145000
      }
    ],
    payment_method: 'Net Banking',
    payment_status: 'Completed',
    dispatch_date: '2026-10-01',
    estimated_delivery: '2026-10-03'
  },
  {
    order_id: 'ORD-903',
    buyer_id: 'USR-003',
    buyer_name: 'Sunita Sharma (AgroMart Wholesales)',
    seller_id: 'USR-002',
    total_amount: 34000,
    order_status: 'Delivered',
    shipping_address: 'AgroMart Logistics Hub, APMC Yard Gate 4, Vashi, Navi Mumbai 400703',
    order_date: '2026-09-12',
    tracking_number: 'EK-AGRI-881902',
    items: [
      {
        order_item_id: 'ORI-1003',
        order_id: 'ORD-903',
        product_id: 'PRD-805',
        product_name: 'Greenhouse Crisp Bell Peppers (Capsicum)',
        category: 'Vegetables',
        quantity: 500,
        unit: 'Kg',
        unit_price: 68,
        subtotal: 34000
      }
    ],
    payment_method: 'Card',
    payment_status: 'Completed',
    dispatch_date: '2026-09-13',
    estimated_delivery: '2026-09-15'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    payment_id: 'PAY-1101',
    order_id: 'ORD-901',
    amount: 85000,
    payment_method: 'UPI',
    payment_status: 'Completed',
    transaction_id: 'TXN-UPI-994821034',
    payment_date: '2026-09-26 14:22:10',
    gateway_reference: 'RAZORPAY_REF_991823'
  },
  {
    payment_id: 'PAY-1102',
    order_id: 'ORD-902',
    amount: 145000,
    payment_method: 'Net Banking',
    payment_status: 'Completed',
    transaction_id: 'TXN-HDFC-884029112',
    payment_date: '2026-09-29 11:05:44',
    gateway_reference: 'SBI_AGGREGATOR_00291'
  },
  {
    payment_id: 'PAY-1103',
    order_id: 'ORD-903',
    amount: 34000,
    payment_method: 'Card',
    payment_status: 'Completed',
    transaction_id: 'TXN-CARD-119283011',
    payment_date: '2026-09-12 16:48:32',
    gateway_reference: 'ICICI_CORP_448102'
  }
];

export const INITIAL_WEATHER_LOGS: WeatherLog[] = [
  {
    log_id: 'WTH-1201',
    farm_id: 'FRM-101',
    farm_name: 'Green Valley North Basin',
    temperature: 28.4,
    humidity: 68,
    rainfall: 0.0,
    wind_speed: 12.5,
    condition_desc: 'Sunny',
    log_date: '2026-09-30',
    forecast_advisory: 'Clear skies favorable for pesticide application. Soil evaporation rate moderate; follow standard drip schedule.'
  },
  {
    log_id: 'WTH-1202',
    farm_id: 'FRM-102',
    farm_name: 'Green Valley South Orchards',
    temperature: 29.1,
    humidity: 64,
    rainfall: 0.0,
    wind_speed: 14.0,
    condition_desc: 'Partly Cloudy',
    log_date: '2026-09-30',
    forecast_advisory: 'Scattered clouds expected late afternoon. Favorable conditions for orchard canopy pruning and field survey.'
  },
  {
    log_id: 'WTH-1203',
    farm_id: 'FRM-103',
    farm_name: 'Golden Plains Wheat Belt',
    temperature: 31.0,
    humidity: 52,
    rainfall: 0.0,
    wind_speed: 18.2,
    condition_desc: 'Sunny',
    log_date: '2026-09-30',
    forecast_advisory: 'Warm and dry wind currents. Ensure secondary irrigation channel gates remain closed during peak daylight.'
  }
];

export const INITIAL_FINANCE: FinanceRecord[] = [
  {
    finance_id: 'FIN-1301',
    user_id: 'USR-002',
    transaction_type: 'Income',
    category: 'Crop Sales',
    amount: 85000,
    transaction_date: '2026-09-26',
    description: 'Sale of 20 Quintals Basmati Rice 1121 to AgroMart Wholesales',
    reference_no: 'INV-2026-092'
  },
  {
    finance_id: 'FIN-1302',
    user_id: 'USR-002',
    transaction_type: 'Income',
    category: 'Equipment Rental',
    amount: 12000,
    transaction_date: '2026-09-24',
    description: '5 Days Rental of John Deere 5050D Tractor to Neighboring Plot 18',
    reference_no: 'RENT-EQP-401'
  },
  {
    finance_id: 'FIN-1303',
    user_id: 'USR-002',
    transaction_type: 'Expense',
    category: 'Machinery Fuel',
    amount: 4800,
    transaction_date: '2026-09-22',
    description: 'High-speed diesel 55 Litres for farm power generator and tractor',
    reference_no: 'FUEL-HPCL-77'
  },
  {
    finance_id: 'FIN-1304',
    user_id: 'USR-002',
    transaction_type: 'Expense',
    category: 'Labor Wages',
    amount: 14500,
    transaction_date: '2026-09-20',
    description: 'Weekly field weeding and canal bunding labor settlement (10 workers)',
    reference_no: 'WAGE-WK-38'
  },
  {
    finance_id: 'FIN-1305',
    user_id: 'USR-002',
    transaction_type: 'Income',
    category: 'Govt Subsidy',
    amount: 25000,
    transaction_date: '2026-09-15',
    description: 'Maharashtra State Micro-Irrigation Capital Subsidy Disbursal',
    reference_no: 'DBT-AGRI-551029'
  }
];
