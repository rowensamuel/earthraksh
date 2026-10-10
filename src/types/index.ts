export type UserRole = 'ADMIN' | 'FARMER' | 'BUYER';

export interface User {
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  created_at: string;
  avatar_url?: string;
  designation?: string;
  verified: boolean;
}

export interface Farm {
  farm_id: string;
  user_id: string;
  farm_name: string;
  location: string;
  area: number;
  area_unit: 'Acres' | 'Hectares';
  soil_type: 'Loamy' | 'Sandy Loam' | 'Black Soil' | 'Clay' | 'Alluvial';
  water_source: 'Borewell' | 'Canal' | 'River' | 'Rainfed' | 'Drip Irrigation';
  active_crops_count: number;
  established_year: number;
}

export interface Crop {
  crop_id: string;
  farm_id: string;
  farm_name?: string;
  crop_name: string;
  variety: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  planting_date: string;
  expected_harvest: string;
  status: 'Planted' | 'Growing' | 'Harvested' | 'Damaged';
  expected_yield: number; // in metric tons
  actual_yield?: number;
  health_score: number; // 0 - 100
}

export interface SoilHealth {
  soil_id: string;
  farm_id: string;
  farm_name?: string;
  ph_level: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  moisture: number; // %
  organic_carbon: number; // %
  fertility_status: 'Low' | 'Medium' | 'High';
  test_date: string;
  recommendations: string[];
}

export interface CropDiseaseReport {
  report_id: string;
  crop_id: string;
  crop_name?: string;
  farm_name?: string;
  disease_name: string;
  symptoms: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  detected_date: string;
  suggested_treatment: string;
  status: 'Active' | 'Under Treatment' | 'Resolved';
  image_url?: string;
  detected_by?: string;
  confidence_score?: number;
}

export interface InventoryItem {
  item_id: string;
  user_id: string;
  item_name: string;
  category: 'Seed' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Tool';
  quantity: number;
  unit: 'Kg' | 'Litres' | 'Bags' | 'Units' | 'Packets';
  unit_price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Critical';
  expiry_date?: string;
}

export interface Equipment {
  equipment_id: string;
  user_id: string;
  owner_name?: string;
  equipment_name: string;
  model: string;
  purchase_date: string;
  rental_rate_per_day: number;
  availability_status: 'Available' | 'Rented' | 'Under Maintenance';
  condition_status: 'Excellent' | 'Good' | 'Needs Repair';
  image_url?: string;
  description?: string;
  location?: string;
}

export interface EquipmentMaintenance {
  maintenance_id: string;
  equipment_id: string;
  maintenance_type: 'Routine Inspection' | 'Hydraulic Overhaul' | 'Engine Oil Service' | 'Blade Replacement';
  cost: number;
  maintenance_date: string;
  next_due_date: string;
  notes: string;
}

export interface MarketplaceProduct {
  product_id: string;
  seller_id: string;
  seller_name: string;
  seller_location: string;
  product_name: string;
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Oilseeds' | 'Spices';
  price_per_unit: number;
  unit: 'Quintal' | 'Kg' | 'Tonne' | 'Box';
  available_qty: number;
  description: string;
  image_url: string;
  harvest_date: string;
  certification: 'Organic India' | 'GAP Certified' | 'Fair Trade' | 'Conventional';
  status: 'Active' | 'Sold Out' | 'Pending Review' | 'Delisted';
  rating: number;
  grade: 'Grade A1' | 'Grade A' | 'Premium Export';
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
  image_url?: string;
}

export interface Order {
  order_id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id?: string;
  total_amount: number;
  order_status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shipping_address: string;
  order_date: string;
  tracking_number?: string;
  items: OrderItem[];
  payment_method: 'UPI' | 'Card' | 'COD' | 'Net Banking';
  payment_status: 'Completed' | 'Pending' | 'Failed';
  dispatch_date?: string;
  estimated_delivery?: string;
  created_at?: string;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  payment_method: 'UPI' | 'Card' | 'COD' | 'Net Banking';
  payment_status: 'Completed' | 'Pending' | 'Failed';
  transaction_id: string;
  payment_date: string;
  gateway_reference: string;
}

export interface WeatherLog {
  log_id: string;
  farm_id: string;
  farm_name: string;
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  wind_speed: number; // km/h
  condition_desc: 'Sunny' | 'Partly Cloudy' | 'Scattered Showers' | 'Heavy Rain' | 'Humid & Overcast';
  log_date: string;
  forecast_advisory: string;
}

export interface FinanceRecord {
  finance_id: string;
  user_id: string;
  transaction_type: 'Income' | 'Expense';
  category: 'Crop Sales' | 'Equipment Rental' | 'Seeds & Fertilizer' | 'Machinery Fuel' | 'Labor Wages' | 'Govt Subsidy';
  amount: number;
  transaction_date: string;
  description: string;
  reference_no: string;
}

export interface CartItem {
  product: MarketplaceProduct;
  quantity: number;
}

// ============================================================================
// Government Schemes & Yojana Types
// ============================================================================

export type SchemeCategory =
  | 'Financial Assistance'
  | 'Crop Insurance'
  | 'Irrigation & Water'
  | 'Farm Mechanization'
  | 'Soil Health & Inputs'
  | 'Solar & Energy'
  | 'Credit & Loan';

export type SchemeApplicationStatus =
  | 'Not Started'
  | 'Preparing Documents'
  | 'Ready to Apply'
  | 'Applied'
  | 'Approved'
  | 'Rejected';

export interface GovernmentScheme {
  id: string;
  name: string;
  slug: string;
  description: string;
  benefits: string;
  department: string;
  state: string;
  category: SchemeCategory;
  eligibility_criteria: string[];
  application_deadline?: string;
  official_info_url: string;
  official_application_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  documents?: SchemeDocument[];
}

export interface SchemeDocument {
  id: string;
  scheme_id: string;
  document_name: string;
  description?: string;
  is_mandatory: boolean;
  document_help_url?: string;
  display_order: number;
  created_at?: string;
}

export interface FarmerSchemeApplication {
  id: string;
  farmer_id: string;
  scheme_id: string;
  application_status: SchemeApplicationStatus;
  started_at: string;
  submitted_at?: string;
  reference_number?: string;
  status_source: 'Farmer-Reported' | 'System-Verified';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  scheme?: GovernmentScheme;
  checklist?: Record<string, boolean>; // map of scheme_document_id -> is_ready
}

export interface FarmerSchemeChecklist {
  id: string;
  farmer_application_id: string;
  scheme_document_id: string;
  is_ready: boolean;
  updated_at?: string;
}

