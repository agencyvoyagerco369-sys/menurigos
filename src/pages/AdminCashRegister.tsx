import { useOrders } from "@/context/OrdersContext";
import { DollarSign, UtensilsCrossed, Truck, Receipt } from "lucide-react";

const D = {
  card: "#1A1F2E",
  border: "#252D3D",
  text: "#F1F3F8",
  textMuted: "#8892A6",
  textDim: "#5C6478",
  brand: "#D42B2B",
};

const AdminCashRegister = () => {
  const { orders } = useOrders();

  const delivered = orders.filter((o) => o.status === "entregado");
  const mesaOrders = delivered.filter((o) => o.orderType === "mesa");
  const deliveryOrders = delivered.filter((o) => o.orderType === "domicilio");
  const totalMesa = mesaOrders.reduce((s, o) => s + o.total, 0);
  const totalDelivery = deliveryOrders.reduce((s, o) => s + o.total, 0);
  const grandTotal = totalMesa + totalDelivery;

  const cards = [
    { label: "Ventas en Mesa", value: totalMesa, count: mesaOrders.length, icon: UtensilsCrossed, color: "#3B82F6" },
    { label: "Ventas a Domicilio", value: totalDelivery, count: deliveryOrders.length, icon: Truck, color: "#A78BFA" },
    { label: "Total del Día", value: grandTotal, count: delivered.length, icon: DollarSign, color: "#10B981", highlight: true },
  ];

  return (
    <div className="space-y-6 font-pos">
      <h2 className="text-2xl font-extrabold" style={{ color: D.text }}>Caja del Día</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl p-5 transition-all duration-150"
            style={{ background: D.card, border: `1px solid ${c.highlight ? "rgba(16,185,129,0.3)" : D.border}`, boxShadow: c.highlight ? "0 0 20px rgba(16,185,129,0.1)" : "0 4px 20px rgba(0,0,0,0.2)" }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${c.color}18` }}>
                <c.icon size={20} strokeWidth={2} style={{ color: c.color }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: D.textDim }}>{c.label}</span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: c.highlight ? "#34D399" : D.text }}>${c.value.toLocaleString()}</p>
            <p className="mt-1 text-xs font-medium" style={{ color: D.textDim }}>{c.count} pedido{c.count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      {delivered.length > 0 && (
        <div className="overflow-hidden rounded-xl" style={{ background: D.card, border: `1px solid ${D.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {["Folio", "Tipo", "Hora", "Total"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"}`}
                    style={{ color: D.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {delivered.map((o) => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td className="px-4 py-3 font-pos-mono text-sm font-semibold" style={{ color: D.textMuted }}>
                    #{o.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 capitalize" style={{ color: D.textMuted }}>
                    {o.orderType === "mesa" ? `Mesa ${o.tableNumber}` : "Domicilio"}
                  </td>
                  <td className="px-4 py-3 font-pos-mono" style={{ color: D.textMuted }}>
                    {o.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: D.text }}>${o.total}</td>
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
