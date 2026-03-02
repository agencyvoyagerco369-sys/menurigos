import { useOrders, Order } from "@/context/OrdersContext";
import { categories } from "@/data/products";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ShoppingCart, TrendingUp, Receipt, Share2, UtensilsCrossed, Truck } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const D = {
  card: "#1A1F2E",
  border: "#252D3D",
  text: "#F1F3F8",
  textMuted: "#8892A6",
  textDim: "#5C6478",
  brand: "#D42B2B",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const chartConfig: ChartConfig = { pedidos: { label: "Pedidos", color: "#3B82F6" } };

const AdminReports = () => {
  const { orders } = useOrders();
  const [date, setDate] = useState<Date>(new Date());

  const dayOrders = useMemo(() => {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    return orders.filter((o) => o.status === "entregado" && o.createdAt >= start && o.createdAt <= end);
  }, [orders, date]);

  const totalSales = dayOrders.reduce((s, o) => s + o.total, 0);
  const totalCompleted = dayOrders.length;
  const mesaOrders = dayOrders.filter((o) => o.orderType === "mesa").length;
  const deliveryOrders = dayOrders.filter((o) => o.orderType === "domicilio").length;
  const avgTicket = totalCompleted > 0 ? Math.round(totalSales / totalCompleted) : 0;

  const hourlyData = useMemo(() => {
    const counts: Record<number, number> = {};
    dayOrders.forEach((o) => { const h = o.createdAt.getHours(); counts[h] = (counts[h] || 0) + 1; });
    return HOURS.filter((h) => h >= 8 && h <= 23).map((h) => ({ hour: `${h}:00`, pedidos: counts[h] || 0 }));
  }, [dayOrders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number; revenue: number }>();
    dayOrders.forEach((o) => o.items.forEach((item) => {
      const key = item.product.id;
      const existing = map.get(key);
      if (existing) { existing.qty += item.quantity; existing.revenue += item.unitPrice * item.quantity; }
      else { map.set(key, { name: item.product.name, category: item.product.category, qty: item.quantity, revenue: item.unitPrice * item.quantity }); }
    }));
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [dayOrders]);

  const categorySales = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    categories.forEach((c) => map.set(c.id, { qty: 0, revenue: 0 }));
    dayOrders.forEach((o) => o.items.forEach((item) => {
      const existing = map.get(item.product.category);
      if (existing) { existing.qty += item.quantity; existing.revenue += item.unitPrice * item.quantity; }
      item.extras.forEach((ext) => {
        const extExisting = map.get(ext.category);
        if (extExisting) { extExisting.qty += item.quantity; extExisting.revenue += ext.price * item.quantity; }
      });
    }));
    return categories.map((c) => ({ ...c, ...(map.get(c.id) || { qty: 0, revenue: 0 }) }));
  }, [dayOrders]);

  const shareWhatsApp = () => {
    const dateStr = format(date, "dd/MM/yyyy");
    const topList = topProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} (${p.qty}x) - $${p.revenue}`).join("\n");
    const catList = categorySales.filter((c) => c.qty > 0).map((c) => `${c.icon} ${c.name}: ${c.qty} uds - $${c.revenue}`).join("\n");
    const msg = `📊 *Resumen del día ${dateStr}*\n\n💰 Ventas totales: $${totalSales}\n📦 Pedidos: ${totalCompleted}\n🍽 Mesa: ${mesaOrders} | 🛵 Domicilio: ${deliveryOrders}\n🎫 Ticket promedio: $${avgTicket}\n\n🏆 *Top productos:*\n${topList}\n\n📂 *Por categoría:*\n${catList}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const stats = [
    { label: "Ventas totales", value: `$${totalSales.toLocaleString()}`, icon: TrendingUp, color: "#10B981" },
    { label: "Pedidos completados", value: totalCompleted, icon: ShoppingCart, color: "#3B82F6" },
    { label: "Mesa / Domicilio", value: `${mesaOrders} / ${deliveryOrders}`, icon: UtensilsCrossed, color: "#F59E0B" },
    { label: "Ticket promedio", value: `$${avgTicket}`, icon: Receipt, color: "#A78BFA" },
  ];

  return (
    <div className="space-y-5 font-pos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold" style={{ color: D.text }}>Reportes</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-150"
                style={{ background: D.card, border: `1px solid ${D.border}`, color: D.textMuted }}>
                <CalendarIcon size={16} strokeWidth={2} />
                {format(date, "dd MMM yyyy", { locale: es })}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:brightness-110"
            style={{ background: "#25D366" }}>
            <Share2 size={16} strokeWidth={2} /> WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}18` }}>
                <s.icon size={16} strokeWidth={2} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: D.textDim }}>{s.label}</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: D.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hourly chart */}
      <div className="rounded-xl p-5" style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <h3 className="mb-4 text-base font-bold" style={{ color: D.text }}>Pedidos por hora</h3>
        {dayOrders.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: D.textDim }}>Sin datos para esta fecha</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252D3D" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: D.textDim }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: D.textDim }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} fill="#3B82F6" />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top 10 */}
        <div className="rounded-xl" style={{ background: D.card, border: `1px solid ${D.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${D.border}` }}>
            <h3 className="text-base font-bold" style={{ color: D.text }}>Top 10 productos</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-12 text-center text-sm" style={{ color: D.textDim }}>Sin datos</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  {["#", "Producto", "Qty", "Ingreso"].map((h, i) => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 2 ? "text-right" : "text-left"}`}
                      style={{ color: D.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td className="px-4 py-2.5 font-bold" style={{ color: D.textDim }}>{i + 1}</td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: D.text }}>{p.name}</td>
                    <td className="px-4 py-2.5 text-right font-pos-mono font-bold" style={{ color: D.textMuted }}>{p.qty}</td>
                    <td className="px-4 py-2.5 text-right font-pos-mono font-bold" style={{ color: "#34D399" }}>${p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Categories */}
        <div className="rounded-xl p-5" style={{ background: D.card, border: `1px solid ${D.border}` }}>
          <h3 className="mb-4 text-base font-bold" style={{ color: D.text }}>Ventas por categoría</h3>
          <div className="space-y-4">
            {categorySales.map((cat) => {
              const maxRevenue = Math.max(...categorySales.map((c) => c.revenue), 1);
              const pct = (cat.revenue / maxRevenue) * 100;
              return (
                <div key={cat.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: D.text }}>{cat.icon} {cat.name}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: D.textDim }}>{cat.qty} uds</span>
                      <span className="font-pos-mono font-bold" style={{ color: "#34D399" }}>${cat.revenue}</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#3B82F6" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
