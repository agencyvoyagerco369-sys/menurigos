import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  ChefHat,
  CheckCircle2,
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
  Utensils,
  Package,
  Flame,
  AlertTriangle,
  CircleDot,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ViewMode = "todo" | "mesas" | "domicilio";

// ── Elapsed timer hook ──
const useElapsed = (date: Date) => {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - date.getTime()) / 1000));
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - date.getTime()) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [date]);
  return elapsed;
};

const fmtTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// ── Live clock component ──
const LiveClock = ({ createdAt, label }: { createdAt: Date; label?: string }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const isUrgent = mins >= 20;
  const isWarning = mins >= 10;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums transition-colors",
        isUrgent && "bg-destructive/20 text-destructive animate-pulse ring-1 ring-destructive/30",
        isWarning && !isUrgent && "bg-amber-500/15 text-amber-400",
        !isWarning && "bg-muted/80 text-muted-foreground"
      )}
    >
      {isUrgent ? <Flame size={12} /> : isWarning ? <AlertTriangle size={12} /> : <Timer size={12} />}
      {label && <span className="text-[9px] font-medium opacity-70">{label}</span>}
      {fmtTime(elapsed)}
    </div>
  );
};

// ── Circular progress timer ──
const CircularTimer = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const progress = Math.min(elapsed / (30 * 60), 1); // 30 min max
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - progress);
  const isUrgent = mins >= 20;
  const isWarning = mins >= 10;

  const strokeColor = isUrgent
    ? "hsl(var(--destructive))"
    : isWarning
    ? "hsl(48, 100%, 50%)"
    : "hsl(var(--primary))";

  return (
    <div className="relative flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 40 40" className={cn(isUrgent && "animate-pulse")}>
        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 20 20)"
          className="transition-all duration-1000"
        />
      </svg>
      <span className={cn(
        "absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold tabular-nums",
        isUrgent ? "text-destructive" : isWarning ? "text-amber-400" : "text-primary"
      )}>
        {fmtTime(elapsed)}
      </span>
    </div>
  );
};

// ── Status config ──
const STATUS_CFG: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bg: string; ring: string }> = {
  recibido: { label: "Recibido", icon: CircleDot, color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
  preparando: { label: "Preparando", icon: ChefHat, color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/20" },
  listo: { label: "Listo", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
  entregado: { label: "Entregado", icon: Package, color: "text-muted-foreground", bg: "bg-muted/50", ring: "ring-border" },
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
      <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
        <X size={20} />
      </button>
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Banknote size={28} className="text-primary" />
        </div>
        <h3 className="font-display text-2xl text-card-foreground">Cobrar pedido</h3>
        <p className="mt-1 text-xs text-muted-foreground">{order.id} · Mesa {order.tableNumber}</p>
        <p className="mt-3 font-display text-4xl text-primary">${order.total}</p>
      </div>
      <p className="mb-4 text-center text-xs text-muted-foreground">Método de pago del cliente</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onConfirm("efectivo")}
          className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-border bg-card py-5 text-foreground transition-all hover:border-emerald-400/50 hover:bg-emerald-400/5 hover:scale-[1.02] active:scale-95"
        >
          <Banknote size={28} className="text-emerald-400" />
          <span className="text-sm font-bold">Efectivo</span>
        </button>
        <button
          onClick={() => onConfirm("transferencia")}
          className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-border bg-card py-5 text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] active:scale-95"
        >
          <CreditCard size={28} className="text-primary" />
          <span className="text-sm font-bold">Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Stat card ──
const StatCard = ({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20">
    <div className={cn("absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-[0.07]", accent.replace("text-", "bg-"))} />
    <div className="flex items-center gap-3">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accent.replace("text-", "bg-") + "/10")}>
        <Icon size={20} className={accent} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={cn("truncate font-display text-2xl leading-tight", accent)}>{value}</p>
      </div>
    </div>
  </div>
);

// ── Priority indicator ──
const PriorityDot = ({ minutes }: { minutes: number }) => {
  if (minutes >= 20) return <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />;
  if (minutes >= 10) return <span className="h-2 w-2 rounded-full bg-amber-400" />;
  return <span className="h-2 w-2 rounded-full bg-emerald-400" />;
};

// ── Order items list ──
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-1">
    {items.map((item) => (
      <div key={item.id} className="text-[13px]">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-foreground">
            <span className="mr-1 inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[10px] font-bold text-muted-foreground">
              {item.quantity}×
            </span>
            {item.product.name}
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">${item.unitPrice * item.quantity}</span>
        </div>
        {item.extras.length > 0 && (
          <p className="ml-7 text-[11px] text-muted-foreground/80">+ {item.extras.map((e) => e.name).join(", ")}</p>
        )}
        {item.notes && (
          <p className="ml-7 flex items-center gap-1 text-[11px] italic text-amber-400/80">
            <MessageSquare size={9} /> {item.notes}
          </p>
        )}
      </div>
    ))}
  </div>
);

// ── Action buttons ──
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const btnBase = "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 ring-1";

  return (
    <div className="flex gap-2">
      {order.status === "recibido" && (
        <>
          <button onClick={() => onAction(order.id, "preparando")} className={cn(btnBase, "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20")}>
            <ChefHat size={14} /> Preparar
          </button>
          <button onClick={() => onAction(order.id, "listo")} className={cn(btnBase, "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20 hover:bg-emerald-400/20")}>
            <CheckCircle2 size={14} /> Listo
          </button>
        </>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")} className={cn(btnBase, "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20 hover:bg-emerald-400/20")}>
          <CheckCircle2 size={14} /> Marcar listo
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")} className={cn(btnBase, "bg-secondary text-secondary-foreground ring-border hover:bg-secondary/80")}>
          <Package size={14} /> {isDelivery ? "Entregado" : "Cobrar y entregar"}
        </button>
      )}
    </div>
  );
};

// ── Mesa order card ──
const MesaCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const cfg = STATUS_CFG[order.status];
  const isDone = order.status === "entregado";
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group overflow-hidden rounded-2xl border transition-all",
        isDone ? "border-border/30 opacity-40" : "border-border hover:border-primary/30",
        !isDone && mins >= 20 && "ring-2 ring-destructive/20"
      )}
    >
      {/* Card header */}
      <div className={cn("flex items-center justify-between px-4 py-2.5", isDone ? "bg-muted/30" : "bg-secondary/80")}>
        <div className="flex items-center gap-2.5">
          <PriorityDot minutes={isDone ? 0 : mins} />
          <Utensils size={14} className="text-secondary-foreground/70" />
          <span className="text-sm font-bold text-secondary-foreground">Mesa {order.tableNumber}</span>
        </div>
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1", cfg.bg, cfg.color, cfg.ring)}>
          <StatusIcon size={11} />
          {cfg.label}
        </div>
      </div>

      <div className="bg-card p-3.5">
        {/* Timer + meta row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-muted-foreground/60">{order.id}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {!isDone && <CircularTimer createdAt={order.createdAt} />}
        </div>

        {/* Items */}
        <div className="mb-3">
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between border-t border-border/40 pt-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">Total</span>
          <span className="font-display text-2xl text-primary">${order.total}</span>
        </div>

        {/* Actions */}
        {!isDone && <ActionButtons order={order} onAction={onAction} />}
      </div>
    </motion.div>
  );
};

// ── Delivery order card ──
const DeliveryCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const cfg = STATUS_CFG[order.status];
  const isDone = order.status === "entregado";
  const dd = order.deliveryDetails;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group overflow-hidden rounded-2xl border transition-all",
        isDone ? "border-border/30 opacity-40" : "border-border hover:border-accent/30",
        !isDone && mins >= 20 && "ring-2 ring-destructive/20"
      )}
    >
      {/* Card header */}
      <div className={cn("flex items-center justify-between px-4 py-2.5", isDone ? "bg-muted/30" : "bg-gradient-to-r from-primary/80 to-accent/50")}>
        <div className="flex items-center gap-2.5">
          <PriorityDot minutes={isDone ? 0 : mins} />
          <Truck size={14} className="text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">Domicilio</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-background/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          <StatusIcon size={11} />
          {cfg.label}
        </div>
      </div>

      <div className="bg-card p-3.5">
        {/* Timer + meta */}
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-muted-foreground/60">{order.id}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {!isDone && <CircularTimer createdAt={order.createdAt} />}
        </div>

        {/* Customer info */}
        <div className="mb-3 space-y-1.5 rounded-xl border border-border/40 bg-muted/30 p-2.5">
          {order.customerName && (
            <div className="flex items-center gap-2 text-xs">
              <User size={12} className="shrink-0 text-primary" />
              <span className="font-semibold text-foreground">{order.customerName}</span>
            </div>
          )}
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-xs">
              <Phone size={12} className="shrink-0 text-emerald-400" />
              <a href={`tel:${order.customerPhone}`} className="text-emerald-400 hover:underline">{order.customerPhone}</a>
            </div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-2 text-xs">
              <MapPin size={12} className="mt-0.5 shrink-0 text-accent" />
              <span className="text-foreground/80">{order.customerAddress}</span>
            </div>
          )}
          {dd && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {dd.type === "casa" ? <Home size={11} /> : <Building2 size={11} />}
                <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
              </div>
              {dd.references && (
                <div className="flex items-start gap-2 text-xs">
                  <Navigation size={11} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{dd.references}</span>
                </div>
              )}
              {dd.hasControlledAccess && dd.accessInstructions && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0 text-destructive" />
                  <span className="text-destructive/80">{dd.accessInstructions}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                {dd.paymentMethod === "efectivo" ? <Banknote size={11} className="text-emerald-400" /> : <CreditCard size={11} className="text-primary" />}
                <span className="font-semibold capitalize text-foreground">{dd.paymentMethod}</span>
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div className="mb-3">
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between border-t border-border/40 pt-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">Total</span>
          <span className="font-display text-2xl text-accent">${order.total}</span>
        </div>

        {/* WhatsApp */}
        {!isDone && order.customerPhone && (
          <a
            href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-400/10 py-2 text-xs font-bold text-emerald-400 ring-1 ring-emerald-400/20 transition-all hover:bg-emerald-400/20"
          >
            <Phone size={12} /> WhatsApp <ArrowUpRight size={10} />
          </a>
        )}

        {/* Actions */}
        {!isDone && <ActionButtons order={order} onAction={onAction} isDelivery />}
      </div>
    </motion.div>
  );
};

// ── Status section header ──
const StatusHeader = ({ status, count }: { status: OrderStatus; count: number }) => {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ring-1", cfg.bg, cfg.color, cfg.ring)}>
        <Icon size={13} />
        {cfg.label}
      </div>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
};

// ── Kanban column ──
const KanbanCol = ({
  status,
  orders,
  renderCard,
}: {
  status: OrderStatus;
  orders: Order[];
  renderCard: (o: Order) => React.ReactNode;
}) => {
  if (orders.length === 0 && status === "entregado") return null;

  return (
    <div className="space-y-3">
      <StatusHeader status={status} count={orders.length} />
      <AnimatePresence mode="popLayout">
        {orders.map((o) => (
          <div key={o.id}>{renderCard(o)}</div>
        ))}
      </AnimatePresence>
      {orders.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/40 py-8 text-center">
          <span className="text-2xl opacity-30">📭</span>
          <p className="mt-1 text-xs text-muted-foreground/40">Sin pedidos</p>
        </div>
      )}
    </div>
  );
};

// ── Empty panel ──
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
      {type === "mesas" ? <Utensils size={28} className="text-muted-foreground/40" /> : <Truck size={28} className="text-muted-foreground/40" />}
    </div>
    <p className="text-sm font-medium text-muted-foreground/60">
      No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}
    </p>
    <p className="mt-1 text-xs text-muted-foreground/30">Aparecerán aquí en tiempo real</p>
  </div>
);

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

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

  // Sorted by oldest first (most urgent at top)
  const sortOldestFirst = (list: Order[]) => [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sortNewestFirst = (list: Order[]) => [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const mesaOrders = useMemo(() => orders.filter((o) => o.orderType === "mesa"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((o) => o.orderType === "domicilio"), [orders]);

  const activeMesa = mesaOrders.filter((o) => o.status !== "entregado").length;
  const activeDelivery = deliveryOrders.filter((o) => o.status !== "entregado").length;
  const totalActive = activeMesa + activeDelivery;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const groupByStatus = useCallback((list: Order[]) => ({
    recibido: sortOldestFirst(list.filter((o) => o.status === "recibido")),
    preparando: sortOldestFirst(list.filter((o) => o.status === "preparando")),
    listo: sortOldestFirst(list.filter((o) => o.status === "listo")),
    entregado: sortNewestFirst(list.filter((o) => o.status === "entregado")).slice(0, 5),
  }), []);

  const mesaByStatus = useMemo(() => groupByStatus(mesaOrders), [mesaOrders, groupByStatus]);
  const deliveryByStatus = useMemo(() => groupByStatus(deliveryOrders), [deliveryOrders, groupByStatus]);

  const ACTIVE_STATUSES: OrderStatus[] = ["recibido", "preparando", "listo"];
  const ALL_STATUSES: OrderStatus[] = ["recibido", "preparando", "listo", "entregado"];

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; count: number }[] = [
    { key: "todo", label: "Vista completa", icon: Sparkles, count: totalActive },
    { key: "mesas", label: "Mesas", icon: Utensils, count: activeMesa },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} accent="text-primary" />
        <StatCard label="Activos" value={totalActive} icon={Zap} accent="text-amber-400" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} accent="text-emerald-400" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={Receipt} accent="text-primary" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-2xl bg-card/80 p-1.5 ring-1 ring-border">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = viewMode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <TabIcon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ SPLIT VIEW ═══ */}
      {viewMode === "todo" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* MESAS */}
          <section className="rounded-2xl border border-border bg-card/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  <Utensils size={18} className="text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground">Mesas</h2>
                  <p className="text-[10px] text-muted-foreground">{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? (
              <EmptyPanel type="mesas" />
            ) : (
              <div className="space-y-5">
                {ACTIVE_STATUSES.map((s) => (
                  <KanbanCol key={s} status={s} orders={mesaByStatus[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />
                ))}
              </div>
            )}
          </section>

          {/* DOMICILIO */}
          <section className="rounded-2xl border border-border bg-card/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/70 to-accent/50">
                  <Truck size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground">Domicilio</h2>
                  <p className="text-[10px] text-muted-foreground">{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? (
              <EmptyPanel type="domicilio" />
            ) : (
              <div className="space-y-5">
                {ACTIVE_STATUSES.map((s) => (
                  <KanbanCol key={s} status={s} orders={deliveryByStatus[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══ MESAS ONLY ═══ */}
      {viewMode === "mesas" && (
        activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? (
          <EmptyPanel type="mesas" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ALL_STATUSES.map((s) => (
              <KanbanCol key={s} status={s} orders={mesaByStatus[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />
            ))}
          </div>
        )
      )}

      {/* ═══ DOMICILIO ONLY ═══ */}
      {viewMode === "domicilio" && (
        activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? (
          <EmptyPanel type="domicilio" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ALL_STATUSES.map((s) => (
              <KanbanCol key={s} status={s} orders={deliveryByStatus[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />
            ))}
          </div>
        )
      )}

      {/* Payment dialog */}
      <AnimatePresence>
        {paymentOrder && (
          <PaymentDialog order={paymentOrder} onConfirm={handlePaymentConfirm} onClose={() => setPaymentOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
