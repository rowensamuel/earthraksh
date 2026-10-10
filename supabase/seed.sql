-- ============================================================================
-- EARTHRAKSHAK ERP SEED DATA
-- Default accounts and baseline agricultural operational records
-- ============================================================================

-- Seed Roles
INSERT INTO public.roles (role_id, role_name, description) VALUES
('ROLE_ADMIN', 'ADMIN', 'System Administrator with platform-wide oversight and management permissions'),
('ROLE_FARMER', 'FARMER', 'Agricultural Producer managing plots, crops, soil, machinery, and produce listings'),
('ROLE_BUYER', 'BUYER', 'Commercial Trader and Wholesale Buyer ordering certified agricultural produce')
ON CONFLICT (role_id) DO NOTHING;

-- Seed Sample Users into auth.users (if running locally or in Supabase Studio SQL runner)
-- Note: Replace with actual auth UID if using hosted Supabase auth
DO $$
DECLARE
    v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
    v_farmer_id UUID := '00000000-0000-0000-0000-000000000002';
    v_buyer_id UUID := '00000000-0000-0000-0000-000000000003';
    v_farm_1 UUID := '11111111-1111-1111-1111-111111111111';
    v_crop_1 UUID := '22222222-2222-2222-2222-222222222221';
    v_crop_2 UUID := '22222222-2222-2222-2222-222222222222';
    v_prod_1 UUID := '33333333-3333-3333-3333-333333333331';
    v_prod_2 UUID := '33333333-3333-3333-3333-333333333332';
BEGIN
    -- Insert users profile
    INSERT INTO public.users (user_id, role, full_name, email, mobile, address, status, verified, designation)
    VALUES
    (v_admin_id, 'ADMIN', 'Vikramaditya Singhania', 'admin.vikram@earthrakshak.org', '+91 98110 92384', 'Central Directorate, New Delhi', 'Active', true, 'Chief Operations Controller'),
    (v_farmer_id, 'FARMER', 'Rajesh Patil', 'rajesh.patil@greenvalleyfarm.in', '+91 94231 88421', 'Gat No. 142, Dindori, Nashik, Maharashtra', 'Active', true, 'Principal Cultivator & Agronomist'),
    (v_buyer_id, 'BUYER', 'AgroMart Logistics Ltd', 'procurement@agromart.co.in', '+91 88201 44521', 'Plot 45, APMC Market Hub, Navi Mumbai', 'Active', true, 'Head of Agri Procurement')
    ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- Insert Farm
    INSERT INTO public.farms (farm_id, user_id, farm_name, location, area, area_unit, soil_type, water_source, established_year)
    VALUES
    (v_farm_1, v_farmer_id, 'Sahyadri Bio-Organics Plot A', 'Dindori Taluka, Nashik District, MH', 38.50, 'Acres', 'Loamy', 'Drip Irrigation', 2018)
    ON CONFLICT (farm_id) DO NOTHING;

    -- Insert Crops
    INSERT INTO public.crops (crop_id, farm_id, crop_name, variety, season, planting_date, expected_harvest, status, expected_yield, health_score)
    VALUES
    (v_crop_1, v_farm_1, 'Sharbati Wheat', 'C-306 Heirloom', 'Rabi', '2025-11-15', '2026-04-10', 'Growing', 45.0, 92),
    (v_crop_2, v_farm_1, 'Thompson Seedless Grapes', 'Export Clone II', 'Zaid', '2025-09-01', '2026-03-25', 'Growing', 62.0, 88)
    ON CONFLICT (crop_id) DO NOTHING;

    -- Insert Soil Health
    INSERT INTO public.soil_health (farm_id, ph_level, nitrogen, phosphorus, potassium, moisture, organic_carbon, fertility_status, recommendations)
    VALUES
    (v_farm_1, 6.8, 310.5, 42.0, 280.0, 24.5, 0.85, 'High', ARRAY['Maintain mulch cover', 'Bio-fertilizer booster scheduled next week'])
    ON CONFLICT DO NOTHING;

    -- Insert Inventory
    INSERT INTO public.inventory (user_id, item_name, category, quantity, unit, unit_price, supplier, status)
    VALUES
    (v_farmer_id, 'Neem Coated Urea Booster', 'Fertilizer', 140.0, 'Bags', 268.0, 'IFFCO State Depot', 'In Stock'),
    (v_farmer_id, 'Trichoderma Viride Bio-Fungicide', 'Pesticide', 25.0, 'Litres', 450.0, 'Kisan Bio Solutions', 'In Stock')
    ON CONFLICT DO NOTHING;

    -- Insert Equipment
    INSERT INTO public.equipment (user_id, equipment_name, model, purchase_date, rental_rate_per_day, availability_status, condition_status, location)
    VALUES
    (v_farmer_id, 'Mahindra Arjun Novo 605 DI-i', '60HP 4WD CRDI', '2023-04-15', 2400.0, 'Available', 'Excellent', 'Dindori Machinery Yard')
    ON CONFLICT DO NOTHING;

    -- Insert Marketplace Products
    INSERT INTO public.marketplace_products (product_id, seller_id, product_name, category, price_per_unit, unit, available_qty, description, status, certification, rating)
    VALUES
    (v_prod_1, v_farmer_id, 'Certified Organic Sharbati Wheat', 'Grains', 3600.0, 'Quintal', 280.0, 'Cold-stone milled grade A1 high protein wheat grains from certified organic fields.', 'Active', 'Organic India', 4.9),
    (v_prod_2, v_farmer_id, 'Nashik Export Table Grapes', 'Fruits', 8200.0, 'Quintal', 150.0, 'Global GAP certified export quality Thompson seedless table grapes.', 'Active', 'GAP Certified', 4.8)
    ON CONFLICT (product_id) DO NOTHING;

    -- Insert Finance
    INSERT INTO public.finance (user_id, transaction_type, category, amount, transaction_date, description, reference_no)
    VALUES
    (v_farmer_id, 'Income', 'Crop Sales', 184000.0, CURRENT_DATE - 5, 'Wholesale batch dispatch advance', 'REF-AGRI-9921'),
    (v_farmer_id, 'Expense', 'Seeds & Fertilizer', 32400.0, CURRENT_DATE - 12, 'Micro-nutrient supplies and organic booster', 'INV-IFF-3301')
    ON CONFLICT DO NOTHING;
END $$;
