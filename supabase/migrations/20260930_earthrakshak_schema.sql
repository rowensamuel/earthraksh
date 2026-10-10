-- ============================================================================
-- EARTHRAKSHAK ENTERPRISE RESOURCE PLANNING (ERP)
-- Authoritative PostgreSQL & Supabase Database Schema
-- Specification Compliant: 15 Core Tables, Foreign Keys, RLS, Functions & Seeds
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    role_id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE CHECK (role_name IN ('ADMIN', 'FARMER', 'BUYER')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (role_id, role_name, description) VALUES
('ROLE_ADMIN', 'ADMIN', 'System Administrator with platform-wide oversight and management permissions'),
('ROLE_FARMER', 'FARMER', 'Agricultural Producer managing plots, crops, soil, machinery, and produce listings'),
('ROLE_BUYER', 'BUYER', 'Commercial Trader and Wholesale Buyer ordering certified agricultural produce')
ON CONFLICT (role_id) DO NOTHING;

-- ============================================================================
-- 2. USERS TABLE (Linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'FARMER' CHECK (role IN ('ADMIN', 'FARMER', 'BUYER')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Pending')),
    avatar_url TEXT,
    designation TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 3. FARMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farms (
    farm_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL,
    area NUMERIC(10, 2) NOT NULL CHECK (area > 0),
    area_unit TEXT NOT NULL DEFAULT 'Acres' CHECK (area_unit IN ('Acres', 'Hectares')),
    soil_type TEXT NOT NULL CHECK (soil_type IN ('Loamy', 'Sandy Loam', 'Black Soil', 'Clay', 'Alluvial')),
    water_source TEXT NOT NULL CHECK (water_source IN ('Borewell', 'Canal', 'River', 'Rainfed', 'Drip Irrigation')),
    active_crops_count INTEGER DEFAULT 0 CHECK (active_crops_count >= 0),
    established_year INTEGER CHECK (established_year >= 1900 AND established_year <= 2100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);

-- ============================================================================
-- 4. CROPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crops (
    crop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(farm_id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid')),
    planting_date DATE NOT NULL,
    expected_harvest DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planted' CHECK (status IN ('Planted', 'Growing', 'Harvested', 'Damaged')),
    expected_yield NUMERIC(10, 2) NOT NULL CHECK (expected_yield >= 0),
    actual_yield NUMERIC(10, 2) CHECK (actual_yield >= 0),
    health_score INTEGER NOT NULL DEFAULT 85 CHECK (health_score >= 0 AND health_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);

-- ============================================================================
-- 5. SOIL HEALTH TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.soil_health (
    soil_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(farm_id) ON DELETE CASCADE,
    ph_level NUMERIC(4, 2) NOT NULL CHECK (ph_level >= 0 AND ph_level <= 14),
    nitrogen NUMERIC(8, 2) NOT NULL CHECK (nitrogen >= 0),
    phosphorus NUMERIC(8, 2) NOT NULL CHECK (phosphorus >= 0),
    potassium NUMERIC(8, 2) NOT NULL CHECK (potassium >= 0),
    moisture NUMERIC(5, 2) NOT NULL CHECK (moisture >= 0 AND moisture <= 100),
    organic_carbon NUMERIC(5, 2) NOT NULL CHECK (organic_carbon >= 0),
    fertility_status TEXT NOT NULL CHECK (fertility_status IN ('Low', 'Medium', 'High')),
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soil_health_farm ON public.soil_health(farm_id);

-- ============================================================================
-- 6. CROP DISEASE REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crop_disease_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID NOT NULL REFERENCES public.crops(crop_id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Critical')),
    detected_date DATE NOT NULL DEFAULT CURRENT_DATE,
    suggested_treatment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Treatment', 'Resolved')),
    image_url TEXT,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    detected_by TEXT DEFAULT 'EarthRakshak Diagnostic Engine',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disease_reports_crop ON public.crop_disease_reports(crop_id);

-- ============================================================================
-- 7. INVENTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Seed', 'Fertilizer', 'Pesticide', 'Equipment', 'Tool')),
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN ('Kg', 'Litres', 'Bags', 'Units', 'Packets')),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    supplier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Critical')),
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON public.inventory(user_id);

-- ============================================================================
-- 8. EQUIPMENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.equipment (
    equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL,
    model TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    rental_rate_per_day NUMERIC(10, 2) NOT NULL CHECK (rental_rate_per_day >= 0),
    availability_status TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Rented', 'Under Maintenance')),
    condition_status TEXT NOT NULL DEFAULT 'Good' CHECK (condition_status IN ('Excellent', 'Good', 'Needs Repair')),
    image_url TEXT,
    description TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_user ON public.equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_availability ON public.equipment(availability_status);

-- ============================================================================
-- 9. EQUIPMENT MAINTENANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
    maintenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(equipment_id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
    maintenance_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON public.equipment_maintenance(equipment_id);

-- ============================================================================
-- 10. MARKETPLACE PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices')),
    price_per_unit NUMERIC(10, 2) NOT NULL CHECK (price_per_unit > 0),
    unit TEXT NOT NULL CHECK (unit IN ('Quintal', 'Kg', 'Tonne', 'Box')),
    available_qty NUMERIC(10, 2) NOT NULL CHECK (available_qty >= 0),
    description TEXT,
    image_url TEXT,
    harvest_date DATE,
    certification TEXT DEFAULT 'Conventional',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold Out', 'Pending Review', 'Delisted')),
    rating NUMERIC(3, 2) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
    grade TEXT DEFAULT 'Grade A',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_products(status);

-- ============================================================================
-- 11. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    shipping_address TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tracking_number TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'COD', 'Net Banking')),
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Completed', 'Pending', 'Failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- ============================================================================
-- 12. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(product_id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ============================================================================
-- 13. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'COD', 'Net Banking')),
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Completed', 'Pending', 'Failed')),
    transaction_id TEXT NOT NULL UNIQUE,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gateway_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- ============================================================================
-- 14. WEATHER LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(farm_id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    rainfall NUMERIC(6, 2) NOT NULL DEFAULT 0,
    wind_speed NUMERIC(5, 2) NOT NULL DEFAULT 0,
    condition_desc TEXT NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    forecast_advisory TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_farm ON public.weather_logs(farm_id);

-- ============================================================================
-- 15. FINANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.finance (
    finance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Income', 'Expense')),
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    reference_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_user ON public.finance(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Roles RLS: All authenticated users can view roles
CREATE POLICY "Allow public read access to roles" ON public.roles
FOR SELECT TO authenticated, anon USING (true);

-- Users RLS
CREATE POLICY "Users can view own profile or admins can view all" ON public.users
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile or admins can update any" ON public.users
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins and users can insert into users" ON public.users
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Farms RLS
CREATE POLICY "Farmers can manage own farms, Admin can view all" ON public.farms
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Crops RLS
CREATE POLICY "Farmers can manage crops on their farms, Admin can view all" ON public.crops
FOR ALL TO authenticated
USING (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
)
WITH CHECK (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- Soil Health RLS
CREATE POLICY "Farmers manage own soil records, Admin can view" ON public.soil_health
FOR ALL TO authenticated
USING (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
)
WITH CHECK (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- Crop Disease Reports RLS
CREATE POLICY "Farmers manage own disease reports, Admin can view" ON public.crop_disease_reports
FOR ALL TO authenticated
USING (
  crop_id IN (SELECT crop_id FROM public.crops WHERE farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid()))
  OR public.is_admin()
)
WITH CHECK (
  crop_id IN (SELECT crop_id FROM public.crops WHERE farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid()))
  OR public.is_admin()
);

-- Inventory RLS
CREATE POLICY "Farmers manage own inventory, Admin can view all" ON public.inventory
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Equipment RLS
CREATE POLICY "Public and users can view equipment" ON public.equipment
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Owners manage their equipment, Admin can manage all" ON public.equipment
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners update their equipment" ON public.equipment
FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners delete their equipment" ON public.equipment
FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- Equipment Maintenance RLS
CREATE POLICY "Equipment owners manage maintenance" ON public.equipment_maintenance
FOR ALL TO authenticated
USING (
  equipment_id IN (SELECT equipment_id FROM public.equipment WHERE user_id = auth.uid())
  OR public.is_admin()
)
WITH CHECK (
  equipment_id IN (SELECT equipment_id FROM public.equipment WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- Marketplace Products RLS
CREATE POLICY "Public can browse active marketplace products" ON public.marketplace_products
FOR SELECT TO authenticated, anon
USING (status = 'Active' OR seller_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only farmers can create listings" ON public.marketplace_products
FOR INSERT TO authenticated
WITH CHECK (
  seller_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'FARMER')
);

CREATE POLICY "Farmers manage own listings, Admin can manage all" ON public.marketplace_products
FOR UPDATE TO authenticated
USING (seller_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers delete own listings, Admin can delete" ON public.marketplace_products
FOR DELETE TO authenticated
USING (seller_id = auth.uid() OR public.is_admin());

-- Orders Helper functions to prevent policy recursion
CREATE OR REPLACE FUNCTION public.is_order_seller(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.marketplace_products mp ON oi.product_id = mp.product_id
    WHERE oi.order_id = p_order_id AND mp.seller_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_order_buyer(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.order_id = p_order_id AND o.buyer_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Orders RLS
CREATE POLICY "Buyers view own orders, Farmers view received, Admin views all" ON public.orders
FOR SELECT TO authenticated
USING (
  buyer_id = auth.uid()
  OR public.is_admin()
  OR public.is_order_seller(order_id, auth.uid())
);

CREATE POLICY "Buyers create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Orders updated by involved buyer/farmer or admin" ON public.orders
FOR UPDATE TO authenticated
USING (
  buyer_id = auth.uid()
  OR public.is_admin()
  OR public.is_order_seller(order_id, auth.uid())
);

-- Order Items RLS
CREATE POLICY "Order items viewable by order buyer, product seller, or admin" ON public.order_items
FOR SELECT TO authenticated
USING (
  public.is_order_buyer(order_id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.marketplace_products mp
    WHERE mp.product_id = order_items.product_id AND mp.seller_id = auth.uid()
  )
  OR public.is_admin()
);

CREATE POLICY "Order items insertable during checkout" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.order_id = order_items.order_id AND o.buyer_id = auth.uid())
);

-- Payments RLS
CREATE POLICY "Buyer can view own payments, Admin can view all" ON public.payments
FOR SELECT TO authenticated
USING (
  public.is_order_buyer(order_id, auth.uid())
  OR public.is_admin()
);

CREATE POLICY "Payment insertion" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.order_id = payments.order_id AND o.buyer_id = auth.uid())
);

-- Weather Logs RLS
CREATE POLICY "Farmers manage farm weather logs, Admin manage all" ON public.weather_logs
FOR ALL TO authenticated
USING (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
)
WITH CHECK (
  farm_id IN (SELECT farm_id FROM public.farms WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- Finance RLS
CREATE POLICY "Users manage own financial records, Admin can view" ON public.finance
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS & POLICIES (Phase 7)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
('produce-images', 'produce-images', true),
('equipment-images', 'equipment-images', true),
('profile-images', 'profile-images', true),
('soil-reports', 'soil-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public read produce images" ON storage.objects
FOR SELECT TO authenticated, anon USING (bucket_id = 'produce-images');

CREATE POLICY "Farmers upload produce images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'produce-images');

CREATE POLICY "Public read equipment images" ON storage.objects
FOR SELECT TO authenticated, anon USING (bucket_id = 'equipment-images');

CREATE POLICY "Users upload equipment images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images');

CREATE POLICY "Public read profile images" ON storage.objects
FOR SELECT TO authenticated, anon USING (bucket_id = 'profile-images');

CREATE POLICY "Users upload profile images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Private access to soil reports" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'soil-reports' AND (owner = auth.uid() OR public.is_admin()));

-- ============================================================================
-- SECURE SERVER-SIDE TRANSACTION FOR ORDERS (Phase 15 & 23)
-- Validates inventory, prevents negative quantities, computes trusted totals
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_checkout_order(
    p_buyer_id UUID,
    p_shipping_address TEXT,
    p_payment_method TEXT,
    p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC(12,2) := 0;
    v_item JSONB;
    v_product_id UUID;
    v_req_qty NUMERIC(10,2);
    v_avail_qty NUMERIC(10,2);
    v_unit_price NUMERIC(10,2);
    v_subtotal NUMERIC(12,2);
    v_tracking TEXT;
    v_txn_id TEXT;
BEGIN
    -- Verify buyer exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE user_id = p_buyer_id AND status = 'Active') THEN
        RAISE EXCEPTION 'Invalid or inactive buyer account.';
    END IF;

    -- Validate stock for each item before writing
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::NUMERIC;

        SELECT available_qty, price_per_unit INTO v_avail_qty, v_unit_price
        FROM public.marketplace_products
        WHERE product_id = v_product_id AND status = 'Active'
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is not available in active marketplace.', v_product_id;
        END IF;

        IF v_avail_qty < v_req_qty THEN
            RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', v_product_id, v_avail_qty, v_req_qty;
        END IF;

        v_subtotal := v_unit_price * v_req_qty;
        v_total := v_total + v_subtotal;
    END LOOP;

    -- Generate tracking number
    v_tracking := 'EK-AGRI-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

    -- Create Order
    INSERT INTO public.orders (
        buyer_id,
        total_amount,
        order_status,
        shipping_address,
        order_date,
        tracking_number,
        payment_method,
        payment_status
    ) VALUES (
        p_buyer_id,
        v_total,
        'Confirmed',
        p_shipping_address,
        CURRENT_DATE,
        v_tracking,
        p_payment_method,
        'Completed'
    ) RETURNING order_id INTO v_order_id;

    -- Insert items and decrement inventory atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::NUMERIC;

        SELECT price_per_unit INTO v_unit_price
        FROM public.marketplace_products
        WHERE product_id = v_product_id;

        v_subtotal := v_unit_price * v_req_qty;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
        ) VALUES (
            v_order_id,
            v_product_id,
            v_req_qty,
            v_unit_price,
            v_subtotal
        );

        -- Decrement stock and update status if sold out
        UPDATE public.marketplace_products
        SET available_qty = available_qty - v_req_qty,
            status = CASE WHEN (available_qty - v_req_qty) <= 0 THEN 'Sold Out' ELSE status END
        WHERE product_id = v_product_id;
    END LOOP;

    -- Record Payment
    v_txn_id := 'TXN-' || p_payment_method || '-' || FLOOR(RANDOM() * 900000000 + 100000000)::TEXT;
    INSERT INTO public.payments (
        order_id,
        amount,
        payment_method,
        payment_status,
        transaction_id,
        gateway_reference
    ) VALUES (
        v_order_id,
        v_total,
        p_payment_method,
        'Completed',
        v_txn_id,
        'GATEWAY_REF_' || FLOOR(RANDOM() * 900000 + 100000)::TEXT
    );

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'total_amount', v_total,
        'tracking_number', v_tracking,
        'transaction_id', v_txn_id,
        'status', 'Confirmed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTHENTICATION TRIGGER FOR AUTOMATIC PROFILE CREATION
-- Handles user registration safely: assigns role from metadata if valid, else FARMER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_mobile TEXT;
    v_address TEXT;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'FARMER');
    -- Validate role against permitted enum
    IF v_role NOT IN ('ADMIN', 'FARMER', 'BUYER') THEN
        v_role := 'FARMER';
    END IF;

    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1));
    v_mobile := new.raw_user_meta_data->>'mobile';
    v_address := COALESCE(new.raw_user_meta_data->>'address', 'Maharashtra, India');

    INSERT INTO public.users (
        user_id,
        role,
        full_name,
        email,
        mobile,
        address,
        status,
        verified
    ) VALUES (
        new.id,
        v_role,
        v_full_name,
        new.email,
        v_mobile,
        v_address,
        'Active',
        TRUE
    ) ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
