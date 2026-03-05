-- Add 'cancelado' to the allowed order statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('recibido', 'preparando', 'listo', 'entregado', 'cancelado'));
