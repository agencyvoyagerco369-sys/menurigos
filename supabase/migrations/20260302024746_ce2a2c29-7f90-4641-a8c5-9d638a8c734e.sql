
-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id text NOT NULL DEFAULT ('ORD-' || upper(substr(md5(random()::text), 1, 6))),
  order_type text NOT NULL CHECK (order_type IN ('mesa', 'domicilio')),
  table_number integer,
  customer_name text,
  customer_phone text,
  customer_address text,
  delivery_details jsonb,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'recibido' CHECK (status IN ('recibido', 'preparando', 'listo', 'entregado')),
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  extras jsonb DEFAULT '[]',
  notes text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can insert orders (customers don't authenticate)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read orders (needed for order tracking page)
CREATE POLICY "Anyone can read orders"
  ON public.orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can update orders (status changes)
CREATE POLICY "Authenticated users can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (true);

-- Anyone can insert order items
CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read order items
CREATE POLICY "Anyone can read order items"
  ON public.order_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
