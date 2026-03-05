-- Allow authenticated users (staff) to delete orders
CREATE POLICY "Staff can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow cascade delete of order_items (already handled by FK ON DELETE CASCADE,
-- but RLS might block it, so add a delete policy for order_items too)
CREATE POLICY "Staff can delete order items"
  ON public.order_items
  FOR DELETE
  TO authenticated
  USING (true);
