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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const chartConfig: ChartConfig = {
  pedidos: { label: "Pedidos", color: "hsl(var(--primary))" },
};

const categoryColors: Record<string, string> = {
  dogos: "bg-primary/15 text-primary",
  botanas: "bg-accent/15 text-accent",
  bebidas: "bg-secondary text-secondary-foreground",
  chiles: "bg-destructive/15 text-destructive",
  extras: "bg-muted text-muted-foreground",
};

const AdminReports = () => {
  const { orders } = useOrders();
  const [date, setDate] = useState<Date>(new Date());

  // Filter orders for selected date
  const dayOrders = useMemo(() => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return orders.filter(
      (o) => o.status === "entregado" && o.createdAt >= start && o.createdAt <= end
    );
  }, [orders, date]);

  // Stats
  const totalSales = dayOrders.reduce((s, o) => s + o.total, 0);
  const totalCompleted = dayOrders.length;
  const mesaOrders = dayOrders.filter((o) => o.orderType === "mesa").length;
  const deliveryOrders = dayOrders.filter((o) => o.orderType === "domicilio").length;
  const avgTicket = totalCompleted > 0 ? Math.round(totalSales / totalCompleted) : 0;

  // Hourly chart data
  const hourlyData = useMemo(() => {
    const counts: Record<number, number> = {};
    dayOrders.forEach((o) => {
      const h = o.createdAt.getHours();
      counts[h] = (counts[h] || 0) + 1;
    });
    return HOURS.filter((h) => h >= 8 && h <= 23).map((h) => ({
      hour: `${h}:00`,
      pedidos: counts[h] || 0,
    }));
  }, [dayOrders]);

  // Top 10 products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number; revenue: number }>();
    dayOrders.forEach((o) =>
      o.items.forEach((item) => {
        const key = item.product.id;
        const existing = map.get(key);
        const qty = item.quantity;
        const rev = item.unitPrice * item.quantity;
        if (existing) {
          existing.qty += qty;
          existing.revenue += rev;
        } else {
          map.set(key, { name: item.product.name, category: item.product.category, qty, revenue: rev });
        }
      })
    );
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [dayOrders]);

  // Sales by category
  const categorySales = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    categories.forEach((c) => map.set(c.id, { qty: 0, revenue: 0 }));
    dayOrders.forEach((o) =>
      o.items.forEach((item) => {
        const cat = item.product.category;
        const existing = map.get(cat);
        if (existing) {
          existing.qty += item.quantity;
          existing.revenue += item.unitPrice * item.quantity;
        }
        // Also count extras
        item.extras.forEach((ext) => {
          const extCat = ext.category;
          const extExisting = map.get(extCat);
          if (extExisting) {
            extExisting.qty += item.quantity;
            extExisting.revenue += ext.price * item.quantity;
          }
        });
      })
    );
    return categories.map((c) => ({
      ...c,
      ...(map.get(c.id) || { qty: 0, revenue: 0 }),
    }));
  }, [dayOrders]);

  // WhatsApp share
  const shareWhatsApp = () => {
    const dateStr = format(date, "dd/MM/yyyy");
    const topList = topProducts
      .slice(0, 5)
      .map((p, i) => `${i + 1}. ${p.name} (${p.qty}x) - $${p.revenue}`)
      .join("\n");
    const catList = categorySales
      .filter((c) => c.qty > 0)
      .map((c) => `${c.icon} ${c.name}: ${c.qty} uds - $${c.revenue}`)
      .join("\n");

    const msg = `📊 *Resumen del día ${dateStr}*\n\n💰 Ventas totales: $${totalSales}\n📦 Pedidos completados: ${totalCompleted}\n🍽 Mesa: ${mesaOrders} | 🛵 Domicilio: ${deliveryOrders}\n🎫 Ticket promedio: $${avgTicket}\n\n🏆 *Top productos:*\n${topList}\n\n📂 *Por categoría:*\n${catList}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-card-foreground">Reportes</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon size={16} />
                {format(date, "dd MMM yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={shareWhatsApp} className="gap-2 bg-success text-success-foreground hover:bg-success/90">
            <Share2 size={16} />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Ventas totales", value: `$${totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
          { label: "Pedidos completados", value: totalCompleted, icon: ShoppingCart, color: "text-primary" },
          {
            label: "Mesa / Domicilio",
            value: `${mesaOrders} / ${deliveryOrders}`,
            icon: UtensilsCrossed,
            color: "text-accent",
          },
          { label: "Ticket promedio", value: `$${avgTicket}`, icon: Receipt, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="mb-1 flex items-center gap-2">
              <s.icon size={18} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={cn("font-display text-3xl", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hourly chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pedidos por hora</CardTitle>
        </CardHeader>
        <CardContent>
          {dayOrders.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Sin datos para esta fecha</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} fill="var(--color-pedidos)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top 10 products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top 10 productos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Sin datos</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p, i) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <span className="font-medium">{p.name}</span>
                        <span
                          className={cn(
                            "ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            categoryColors[p.category] || "bg-muted text-muted-foreground"
                          )}
                        >
                          {p.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{p.qty}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-success">
                        ${p.revenue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sales by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ventas por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySales.map((cat) => {
              const maxRevenue = Math.max(...categorySales.map((c) => c.revenue), 1);
              const pct = (cat.revenue / maxRevenue) * 100;
              return (
                <div key={cat.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {cat.icon} {cat.name}
                    </span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{cat.qty} uds</span>
                      <span className="font-mono font-semibold text-success">${cat.revenue}</span>
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
