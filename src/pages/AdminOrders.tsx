import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  ChefHat,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  X,
  ShoppingCart,
  TrendingUp,
  Zap,
  Receipt,
  Phone,
  User,
  Navigation,
  MessageSquare,
  Home,
  Building2,
  Timer,
  ArrowRight,
  Utensils,
  Package,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ViewMode = "todo" | "mesas" | "domicilio";

// ── Elapsed timer hook ──
const useElapsed = (date: Date) => {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - date.getTime()) / 1000));
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - date.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);
  return elapsed;
};

const formatElapsed = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ── Elapsed badge ──
const ElapsedBadge = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const minutes = Math.floor(elapsed / 60);
  const isUrgent = minutes >= 20;
  const isWarning = minutes >= 10 && minutes < 20;

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs font-bold tabular-nums",
        isUrgent && "bg-destructive/20 text-destructive animate-pulse",
        isWarning && "bg-accent/20 text-accent",
        !isUrgent && !isWarning && "bg-muted text-muted-foreground"
      )}
    >
      <Timer size={11} />
      {formatElapsed(elapsed)}
    </span>
  );
};

// ── Status config ──
const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string }> = {
  recibido: { label: "Recibido", emoji: "🔔", color: "text-accent", bg: "bg-accent/15" },
  preparando: { label: "Preparando", emoji: "🍳", color: "text-primary", bg: "bg-primary/15" },
  listo: { label: "Listo", emoji: "✅", color: "text-success", bg: "bg-success/15" },
  entregado: { label: "Entregado", emoji: "🏁", color: "text-muted-foreground", bg: "bg-muted" },
};

// ── Payment dialog ──
const PaymentDialog = ({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: (method: "efectivo" | "transferencia") => void;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="relative mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
        <X size={20} />
      </button>
      <div className="mb-5 text-center">
        <span className="text-4xl">💰</span>
        <h3 className="mt-2 font-display text-2xl text-card-foreground">Entregar y Cobrar</h3>
        <p className="mt-1 text-xs text-muted-foreground">{order.id}</p>
        <p className="mt-2 text-3xl font-bold text-primary">${order.total}</p>
      </div>
      <p className="mb-3 text-center text-sm text-muted-foreground">¿Cómo pagó el cliente?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onConfirm("efectivo")}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-muted/50 py-5 text-foreground transition-all hover:border-success hover:bg-success/10 hover:scale-[1.02] active:scale-95"
        >
          <Banknote size={28} className="text-success" />
          <span className="text-sm font-bold">Efectivo 💵</span>
        </button>
        <button
          onClick={() => onConfirm("transferencia")}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-muted/50 py-5 text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-95"
        >
          <CreditCard size={28} className="text-primary" />
          <span className="text-sm font-bold">Transferencia 🏦</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Stat pill ──
const StatPill = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color.replace("text-", "bg-") + "/15")}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-display text-xl leading-tight", color)}>{value}</p>
    </div>
  </div>
);

// ── Order card (mesa) ──
const MesaOrderCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const isDelivered = order.status === "entregado";
  const cfg = STATUS_CONFIG[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex flex-col rounded-2xl border transition-all",
        isDelivered ? "border-border/40 opacity-50" : "border-border hover:border-primary/30 hover:shadow-brand/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-secondary px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Utensils size={14} className="text-secondary-foreground/70" />
          <span className="text-sm font-bold text-secondary-foreground">Mesa {order.tableNumber}</span>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.bg, cfg.color)}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col bg-card p-3.5">
        {/* Meta */}
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground/70">{order.id}</p>
            <p className="text-xs text-muted-foreground">
              {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {!isDelivered && <ElapsedBadge createdAt={order.createdAt} />}
        </div>

        {/* Items */}
        <div className="mb-3 flex-1 space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">{item.quantity}x {item.product.name}</span>
                <span className="tabular-nums text-muted-foreground">${item.unitPrice * item.quantity}</span>
              </div>
              {item.extras.length > 0 && (
                <p className="ml-4 text-[11px] text-muted-foreground">+ {item.extras.map((e) => e.name).join(", ")}</p>
              )}
              {item.notes && (
                <p className="ml-4 text-[11px] italic text-accent">📝 {item.notes}</p>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mb-3 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-primary">${order.total}</span>
          </div>
        </div>

        {/* Actions */}
        {!isDelivered && <OrderActions order={order} onAction={onAction} />}
      </div>
    </motion.div>
  );
};

// ── Order card (domicilio) ──
const DeliveryOrderCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const isDelivered = order.status === "entregado";
  const cfg = STATUS_CONFIG[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex flex-col rounded-2xl border transition-all",
        isDelivered ? "border-border/40 opacity-50" : "border-border hover:border-accent/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-primary/90 to-accent/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">Domicilio</span>
        </div>
        <span className={cn("rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground")}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col bg-card p-3.5">
        {/* Meta */}
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground/70">{order.id}</p>
            <p className="text-xs text-muted-foreground">
              {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {!isDelivered && <ElapsedBadge createdAt={order.createdAt} />}
        </div>

        {/* Customer & delivery info */}
        <div className="mb-3 space-y-2 rounded-xl border border-border/50 bg-muted/40 p-3">
          {order.customerName && (
            <div className="flex items-center gap-2 text-xs">
              <User size={12} className="shrink-0 text-primary" />
              <span className="font-semibold text-foreground">{order.customerName}</span>
            </div>
          )}
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-xs">
              <Phone size={12} className="shrink-0 text-success" />
              <a href={`tel:${order.customerPhone}`} className="text-success hover:underline">{order.customerPhone}</a>
            </div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-2 text-xs">
              <MapPin size={12} className="mt-0.5 shrink-0 text-accent" />
              <span className="text-foreground">{order.customerAddress}</span>
            </div>
          )}
          {dd && (
            <>
              <div className="flex items-center gap-2 text-xs">
                {dd.type === "casa" ? (
                  <Home size={12} className="text-muted-foreground" />
                ) : (
                  <Building2 size={12} className="text-muted-foreground" />
                )}
                <span className="capitalize text-muted-foreground">
                  {dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}
                </span>
              </div>
              {dd.references && (
                <div className="flex items-start gap-2 text-xs">
                  <Navigation size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{dd.references}</span>
                </div>
              )}
              {dd.hasControlledAccess && dd.accessInstructions && (
                <div className="flex items-start gap-2 text-xs">
                  <MessageSquare size={12} className="mt-0.5 shrink-0 text-destructive" />
                  <span className="text-destructive/80">{dd.accessInstructions}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                {dd.paymentMethod === "efectivo" ? (
                  <Banknote size={12} className="text-success" />
                ) : (
                  <CreditCard size={12} className="text-primary" />
                )}
                <span className="font-semibold capitalize text-foreground">{dd.paymentMethod}</span>
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div className="mb-3 flex-1 space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">{item.quantity}x {item.product.name}</span>
                <span className="tabular-nums text-muted-foreground">${item.unitPrice * item.quantity}</span>
              </div>
              {item.extras.length > 0 && (
                <p className="ml-4 text-[11px] text-muted-foreground">+ {item.extras.map((e) => e.name).join(", ")}</p>
              )}
              {item.notes && (
                <p className="ml-4 text-[11px] italic text-accent">📝 {item.notes}</p>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mb-3 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-accent">${order.total}</span>
          </div>
        </div>

        {/* WhatsApp quick link for delivery */}
        {!isDelivered && order.customerPhone && (
          <a
            href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-success/10 py-2 text-xs font-bold text-success transition-colors hover:bg-success/20"
          >
            📱 Contactar por WhatsApp
          </a>
        )}

        {/* Actions */}
        {!isDelivered && <OrderActions order={order} onAction={onAction} isDelivery />}
      </div>
    </motion.div>
  );
};

// ── Action buttons (shared) ──
const OrderActions = ({
  order,
  onAction,
  isDelivery,
}: {
  order: Order;
  onAction: (id: string, status: OrderStatus) => void;
  isDelivery?: boolean;
}) => (
  <div className="flex gap-2">
    {order.status === "recibido" && (
      <>
        <button
          onClick={() => onAction(order.id, "preparando")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/90 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary active:scale-95"
        >
          <ChefHat size={14} /> Preparar
        </button>
        <button
          onClick={() => onAction(order.id, "listo")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-xs font-bold text-success-foreground transition-all hover:bg-success/90 active:scale-95"
        >
          <CheckCircle size={14} /> Listo
        </button>
      </>
    )}
    {order.status === "preparando" && (
      <button
        onClick={() => onAction(order.id, "listo")}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-xs font-bold text-success-foreground transition-all hover:bg-success/90 active:scale-95"
      >
        <CheckCircle size={14} /> Marcar listo ✓
      </button>
    )}
    {order.status === "listo" && (
      <button
        onClick={() => onAction(order.id, "entregado")}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-95"
      >
        <Package size={14} /> {isDelivery ? "Entregado 🛵" : "Entregar y cobrar 💰"}
      </button>
    )}
  </div>
);

// ── Kanban column ──
const KanbanColumn = ({
  status,
  orders,
  renderCard,
}: {
  status: OrderStatus;
  orders: Order[];
  renderCard: (o: Order) => React.ReactNode;
}) => {
  const cfg = STATUS_CONFIG[status];
  if (orders.length === 0 && status === "entregado") return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wider", cfg.bg, cfg.color)}>
          {cfg.emoji} {cfg.label}
        </span>
        {orders.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {orders.length}
          </span>
        )}
      </div>
      <AnimatePresence>
        {orders.map((o) => (
          <div key={o.id}>{renderCard(o)}</div>
        ))}
      </AnimatePresence>
      {orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/50 py-8 text-center text-xs text-muted-foreground/50">
          Sin pedidos
        </div>
      )}
    </div>
  );
};

// ── Empty state ──
const EmptyState = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl">{type === "mesas" ? "🍽" : "🛵"}</span>
    <p className="mt-3 text-sm text-muted-foreground">
      No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}
    </p>
    <p className="text-xs text-muted-foreground/60">Aparecerán aquí en tiempo real</p>
  </div>
);

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════
const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  // Handle deliver with payment dialog for mesa orders
  const handleAction = useCallback(
    (id: string, status: OrderStatus) => {
      if (status === "entregado") {
        const order = orders.find((o) => o.id === id);
        if (order && order.orderType === "mesa") {
          setPaymentOrder(order);
          return;
        }
      }
      updateOrderStatus(id, status);
    },
    [orders, updateOrderStatus]
  );

  const handlePaymentConfirm = useCallback(
    (_method: "efectivo" | "transferencia") => {
      if (paymentOrder) {
        updateOrderStatus(paymentOrder.id, "entregado");
        setPaymentOrder(null);
      }
    },
    [paymentOrder, updateOrderStatus]
  );

  // Computed data
  const mesaOrders = useMemo(() => orders.filter((o) => o.orderType === "mesa"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((o) => o.orderType === "domicilio"), [orders]);

  const activeMesaCount = mesaOrders.filter((o) => o.status !== "entregado").length;
  const activeDeliveryCount = deliveryOrders.filter((o) => o.status !== "entregado").length;
  const totalActive = activeMesaCount + activeDeliveryCount;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const groupByStatus = (list: Order[]) => ({
    recibido: list.filter((o) => o.status === "recibido").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    preparando: list.filter((o) => o.status === "preparando").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    listo: list.filter((o) => o.status === "listo").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    entregado: list.filter((o) => o.status === "entregado").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
  });

  const mesaByStatus = useMemo(() => groupByStatus(mesaOrders), [mesaOrders]);
  const deliveryByStatus = useMemo(() => groupByStatus(deliveryOrders), [deliveryOrders]);

  const STATUSES_ACTIVE: OrderStatus[] = ["recibido", "preparando", "listo"];
  const showDelivered = viewMode !== "todo";

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatPill label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="text-primary" />
        <StatPill label="Activos" value={totalActive} icon={Zap} color="text-accent" />
        <StatPill label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="text-success" />
        <StatPill label="Ticket promedio" value={`$${avgTicket}`} icon={Receipt} color="text-primary" />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        {([
          { key: "todo" as ViewMode, label: "Vista completa", icon: "📋", count: totalActive },
          { key: "mesas" as ViewMode, label: "Mesas", icon: "🍽", count: activeMesaCount },
          { key: "domicilio" as ViewMode, label: "Domicilio", icon: "🛵", count: activeDeliveryCount },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              viewMode === tab.key
                ? "bg-primary text-primary-foreground shadow-brand"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count > 0 && (
              <span className={cn(
                "ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                viewMode === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-destructive text-destructive-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ SPLIT VIEW (default) ═══ */}
      {viewMode === "todo" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* MESAS PANEL */}
          <section className="rounded-2xl border border-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-base">🍽</span>
                <div>
                  <h2 className="font-display text-xl text-foreground">Mesas</h2>
                  <p className="text-[10px] text-muted-foreground">{activeMesaCount} activo{activeMesaCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")} className="text-xs text-primary hover:underline">
                Ver todo →
              </button>
            </div>
            {activeMesaCount === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? (
              <EmptyState type="mesas" />
            ) : (
              <div className="space-y-4">
                {STATUSES_ACTIVE.map((s) => (
                  <KanbanColumn
                    key={s}
                    status={s}
                    orders={mesaByStatus[s]}
                    renderCard={(o) => <MesaOrderCard order={o} onAction={handleAction} />}
                  />
                ))}
              </div>
            )}
          </section>

          {/* DOMICILIO PANEL */}
          <section className="rounded-2xl border border-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-accent/60 text-base">🛵</span>
                <div>
                  <h2 className="font-display text-xl text-foreground">Domicilio</h2>
                  <p className="text-[10px] text-muted-foreground">{activeDeliveryCount} activo{activeDeliveryCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")} className="text-xs text-primary hover:underline">
                Ver todo →
              </button>
            </div>
            {activeDeliveryCount === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? (
              <EmptyState type="domicilio" />
            ) : (
              <div className="space-y-4">
                {STATUSES_ACTIVE.map((s) => (
                  <KanbanColumn
                    key={s}
                    status={s}
                    orders={deliveryByStatus[s]}
                    renderCard={(o) => <DeliveryOrderCard order={o} onAction={handleAction} />}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══ MESAS ONLY VIEW ═══ */}
      {viewMode === "mesas" && (
        <div className="space-y-5">
          {activeMesaCount === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? (
            <EmptyState type="mesas" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...STATUSES_ACTIVE, "entregado" as OrderStatus].map((s) => (
                <KanbanColumn
                  key={s}
                  status={s}
                  orders={mesaByStatus[s]}
                  renderCard={(o) => <MesaOrderCard order={o} onAction={handleAction} />}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ DOMICILIO ONLY VIEW ═══ */}
      {viewMode === "domicilio" && (
        <div className="space-y-5">
          {activeDeliveryCount === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? (
            <EmptyState type="domicilio" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...STATUSES_ACTIVE, "entregado" as OrderStatus].map((s) => (
                <KanbanColumn
                  key={s}
                  status={s}
                  orders={deliveryByStatus[s]}
                  renderCard={(o) => <DeliveryOrderCard order={o} onAction={handleAction} />}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment dialog */}
      <AnimatePresence>
        {paymentOrder && (
          <PaymentDialog
            order={paymentOrder}
            onConfirm={handlePaymentConfirm}
            onClose={() => setPaymentOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
