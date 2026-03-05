
CREATE POLICY "Staff can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Staff can delete order items"
  ON public.order_items
  FOR DELETE
  TO authenticated
  USING (true);
