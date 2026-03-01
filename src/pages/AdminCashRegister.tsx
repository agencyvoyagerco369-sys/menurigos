import { useOrders } from "@/context/OrdersContext";

const AdminCashRegister = () => {
  const { orders } = useOrders();

  const delivered = orders.filter((o) => o.status === "entregado");
  const mesaOrders = delivered.filter((o) => o.orderType === "mesa");
  const deliveryOrders = delivered.filter((o) => o.orderType === "domicilio");
  const totalMesa = mesaOrders.reduce((s, o) => s + o.total, 0);
  const totalDelivery = deliveryOrders.reduce((s, o) => s + o.total, 0);
  const grandTotal = totalMesa + totalDelivery;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl text-card-foreground">Caja del Día</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Ventas en Mesa</p>
          <p className="font-display text-3xl text-primary">${totalMesa}</p>
          <p className="text-xs text-muted-foreground">{mesaOrders.length} pedidos</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Ventas a Domicilio</p>
          <p className="font-display text-3xl text-primary">${totalDelivery}</p>
          <p className="text-xs text-muted-foreground">{deliveryOrders.length} pedidos</p>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success/5 p-5 shadow-card">
          <p className="text-sm text-success">Total del Día</p>
          <p className="font-display text-4xl text-success">${grandTotal}</p>
          <p className="text-xs text-muted-foreground">{delivered.length} pedidos entregados</p>
        </div>
      </div>

      {delivered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Folio</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Hora</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {delivered.map((o) => (
                <tr key={o.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{o.id}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {o.orderType === "mesa" ? `Mesa ${o.tableNumber}` : "Domicilio"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">${o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCashRegister;
