
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- orders table
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  USING (true);

-- order_items table
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can read order items" ON public.order_items;

CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read order items"
  ON public.order_items FOR SELECT
  USING (true);
