import { useOrders } from "@/context/OrdersContext";
import { T, STATUS, ACCENT } from "@/lib/admin-theme";
import { DollarSign, UtensilsCrossed, Truck, Banknote, CreditCard, Smartphone } from "lucide-react";

const AdminCashRegister = () => {
  const { orders } = useOrders();

  const delivered = orders.filter((o) => o.status === "entregado");
  const mesaOrders = delivered.filter((o) => o.orderType === "mesa");
  const deliveryOrders = delivered.filter((o) => o.orderType === "domicilio");
  const totalMesa = mesaOrders.reduce((s, o) => s + o.total, 0);
  const totalDelivery = deliveryOrders.reduce((s, o) => s + o.total, 0);
  const grandTotal = totalMesa + totalDelivery;

  const efectivo = delivered.filter((o) => o.paymentMethod === "efectivo");
  const transferencia = delivered.filter((o) => o.paymentMethod === "transferencia");
  const terminal = delivered.filter((o) => o.paymentMethod === "terminal");
  const totalEfectivo = efectivo.reduce((s, o) => s + o.total, 0);
  const totalTransferencia = transferencia.reduce((s, o) => s + o.total, 0);
  const totalTerminal = terminal.reduce((s, o) => s + o.total, 0);

  const cards = [
    { label: "Ventas en Mesa", value: totalMesa, count: mesaOrders.length, icon: UtensilsCrossed, color: ACCENT.blue },
    { label: "Ventas a Domicilio", value: totalDelivery, count: deliveryOrders.length, icon: Truck, color: ACCENT.purple },
    { label: "Total del Día", value: grandTotal, count: delivered.length, icon: DollarSign, color: ACCENT.green, highlight: true },
  ];

  const paymentCards = [
    { label: "Efectivo", value: totalEfectivo, count: efectivo.length, icon: Banknote, color: ACCENT.green },
    { label: "Transferencia", value: totalTransferencia, count: transferencia.length, icon: Smartphone, color: ACCENT.blue },
    { label: "Terminal", value: totalTerminal, count: terminal.length, icon: CreditCard, color: ACCENT.purple },
  ];

  return (
    <div className="space-y-6 font-pos">
      <h2 className="text-2xl font-extrabold" style={{ color: T.text }}>Caja del Día</h2>

      {/* Totales */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl p-5 transition-all duration-150"
            style={{
              background: T.card,
              border: `1px solid ${c.highlight ? "rgba(16,185,129,0.3)" : T.border}`,
              boxShadow: c.highlight ? "0 0 20px rgba(16,185,129,0.1)" : "0 4px 20px rgba(0,0,0,0.2)",
            }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${c.color}18` }}>
                <c.icon size={20} strokeWidth={2} style={{ color: c.color }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: T.textDim }}>{c.label}</span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: c.highlight ? "#34D399" : T.text }}>${c.value.toLocaleString()}</p>
            <p className="mt-1 text-xs font-medium" style={{ color: T.textDim }}>{c.count} pedido{c.count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      {/* Por método de pago */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Por método de pago</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {paymentCards.map((c) => (
            <div key={c.label} className="rounded-xl p-5 transition-all duration-150"
              style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${c.color}18` }}>
                  <c.icon size={20} strokeWidth={2} style={{ color: c.color }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: T.textDim }}>{c.label}</span>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: T.text }}>${c.value.toLocaleString()}</p>
              <p className="mt-1 text-xs font-medium" style={{ color: T.textDim }}>{c.count} pedido{c.count !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de transacciones */}
      {delivered.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Transacciones</h3>
          <div className="overflow-hidden rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Folio", "Tipo", "Pago", "Hora", "Total"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                      style={{ color: T.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {delivered.map((o) => {
                  const sc = STATUS[o.status];
                  return (
                    <tr key={o.id} className="transition-colors" style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td className="px-4 py-3 font-pos-mono text-sm font-semibold" style={{ color: T.textMuted }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3" style={{ color: T.textMuted }}>
                        {o.orderType === "mesa" ? `Mesa ${o.tableNumber}` : "Domicilio"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-bold capitalize"
                          style={{
                            background: o.paymentMethod === "efectivo" ? "rgba(16,185,129,0.12)" : o.paymentMethod === "terminal" ? "rgba(167,139,250,0.12)" : "rgba(59,130,246,0.12)",
                            color: o.paymentMethod === "efectivo" ? "#34D399" : o.paymentMethod === "terminal" ? "#A78BFA" : "#60A5FA",
                          }}>
                          {o.paymentMethod === "efectivo" ? <Banknote size={12} strokeWidth={2} /> : o.paymentMethod === "terminal" ? <CreditCard size={12} strokeWidth={2} /> : <Smartphone size={12} strokeWidth={2} />}
                          {o.paymentMethod || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-pos-mono" style={{ color: T.textMuted }}>
                        {o.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: T.text }}>${o.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCashRegister;
