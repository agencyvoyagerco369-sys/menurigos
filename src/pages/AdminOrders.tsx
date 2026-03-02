import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import {
  Clock, ChefHat, CheckCircle2, Truck, MapPin, CreditCard, Banknote, X,
  ShoppingCart, TrendingUp, Zap, Receipt, Phone, User, Navigation,
  MessageSquare, Home, Building2, Utensils, Package, Flame, AlertTriangle,
  CircleDot, ArrowUpRight, Sparkles, Hash, ExternalLink, Timer,
  UtensilsCrossed, BadgeDollarSign, ClipboardList, Bell, Eye,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ViewMode = "todo" | "mesas" | "domicilio";

/* ═══════════════════ HOOKS ═══════════════════ */
const useElapsed = (date: Date) => {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - date.getTime()) / 1000));
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - date.getTime()) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [date]);
  return elapsed;
};

const fmt = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();

/* ═══════════════════ COLORS ═══════════════════ */
const DARK = {
  bg: "#151820",
  card: "#1E2330",
  cardBorder: "#2A3040",
  surface: "#252B3B",
  surfaceHover: "#2E3548",
  text: "#E8ECF4",
  textMuted: "#8A94A6",
  textDim: "#5A6478",
};

const STATE_COLORS: Record<OrderStatus, { hex: string; glow: string; bg: string; text: string; label: string }> = {
  recibido:   { hex: "#3B82F6", glow: "0 0 20px #3B82F620, 0 0 40px #3B82F610", bg: "#3B82F615", text: "#60A5FA", label: "Nuevo" },
  preparando: { hex: "#F59E0B", glow: "0 0 20px #F59E0B20, 0 0 40px #F59E0B10", bg: "#F59E0B15", text: "#FBBF24", label: "En cocina" },
  listo:      { hex: "#10B981", glow: "0 0 20px #10B98120, 0 0 40px #10B98110", bg: "#10B98115", text: "#34D399", label: "Listo" },
  entregado:  { hex: "#6B7280", glow: "none",                                     bg: "#6B728010", text: "#9CA3AF", label: "Entregado" },
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  recibido: Bell,
  preparando: ChefHat,
  listo: CheckCircle2,
  entregado: Package,
};

/* ═══════════════════ CIRCULAR TIMER ═══════════════════ */
const CircularTimer = ({ createdAt, size = 56 }: { createdAt: Date; size?: number }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const r = (size - 8) / 2;
  const C = 2 * Math.PI * r;
  const progress = Math.min(elapsed / (30 * 60), 1);
  const offset = C * (1 - progress);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const color = isUrgent ? "#EF4444" : isWarn ? "#F59E0B" : "#3B82F6";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className={cn(isUrgent && "animate-pulse")}>
        <circle cx={size/2} cy={size/2} r={r} fill="transparent" stroke="#2A3040" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="transparent" stroke={color} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-pos font-bold tabular-nums leading-none" style={{ color, fontSize: size > 50 ? 13 : 11 }}>
          {fmt(elapsed)}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const c = STATE_COLORS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold font-pos"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.hex}30` }}>
      <Icon size={12} />
      {c.label}
    </span>
  );
};

/* ═══════════════════ URGENCY BADGE ═══════════════════ */
const UrgencyBadge = ({ minutes }: { minutes: number }) => {
  if (minutes < 10) return null;
  if (minutes >= 20) return (
    <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold font-pos"
      style={{ background: "#EF444420", color: "#F87171", border: "1px solid #EF444440" }}>
      <Flame size={11} /> URGENTE
    </motion.span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold font-pos"
      style={{ background: "#F59E0B15", color: "#FBBF24", border: "1px solid #F59E0B30" }}>
      <AlertTriangle size={11} /> +10 min
    </span>
  );
};

/* ═══════════════════ MESA AVATAR ═══════════════════ */
const MESA_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", "#6366F1"];
const MesaAvatar = ({ num }: { num: number }) => {
  const color = MESA_COLORS[(num - 1) % MESA_COLORS.length];
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold font-pos text-white"
      style={{ background: color }}>
      {num}
    </div>
  );
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
    className="relative overflow-hidden rounded-xl p-5 font-pos"
    style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: DARK.textDim }}>{label}</p>
        <p className="text-2xl font-extrabold font-pos-display leading-tight" style={{ color: DARK.text }}>{value}</p>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════ ITEMS LIST ═══════════════════ */
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.id} className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded font-pos text-xs font-bold"
            style={{ background: DARK.surface, color: DARK.textMuted }}>
            {item.quantity}×
          </span>
          <div>
            <span className="text-sm font-semibold font-pos" style={{ color: DARK.text }}>{item.product.name}</span>
            {item.extras.length > 0 && (
              <p className="mt-0.5 text-xs font-pos" style={{ color: DARK.textDim }}>+ {item.extras.map((e) => e.name).join(", ")}</p>
            )}
            {item.notes && (
              <p className="mt-1 flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-pos"
                style={{ background: "#F59E0B12", color: "#FBBF24", border: "1px solid #F59E0B20" }}>
                <MessageSquare size={10} /> {item.notes}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 font-pos text-sm font-bold tabular-nums" style={{ color: DARK.textMuted }}>
          ${item.unitPrice * item.quantity}
        </span>
      </div>
    ))}
  </div>
);

/* ═══════════════════ ACTION BUTTONS ═══════════════════ */
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold font-pos transition-all duration-150 active:scale-[0.97]";
  return (
    <div className="flex gap-2.5">
      {order.status === "recibido" && (
        <>
          <button onClick={() => onAction(order.id, "preparando")}
            className={cn(btnBase)} style={{ background: "#F59E0B", color: "#1E2330" }}>
            <ChefHat size={18} /> Preparar
          </button>
          <button onClick={() => onAction(order.id, "listo")}
            className={cn(btnBase)} style={{ background: "#10B981", color: "#1E2330" }}>
            <CheckCircle2 size={18} /> Listo
          </button>
        </>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")}
          className={cn(btnBase)} style={{ background: "#10B981", color: "#1E2330" }}>
          <CheckCircle2 size={18} /> ¡Pedido Listo!
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")}
          className={cn(btnBase)} style={{ background: "#8B5CF6", color: "#FFFFFF" }}>
          <Package size={18} /> {isDelivery ? "Marcar Entregado" : "Cobrar y Entregar"}
        </button>
      )}
    </div>
  );
};

/* ═══════════════════ PAYMENT DIALOG ═══════════════════ */
const PaymentDialog = ({ order, onConfirm, onClose }: {
  order: Order; onConfirm: (m: "efectivo" | "transferencia") => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#00000080", backdropFilter: "blur(8px)" }} onClick={onClose}>
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl p-8 font-pos"
      style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ background: DARK.surface, color: DARK.textMuted }}>
        <X size={18} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#10B98120" }}>
          <BadgeDollarSign size={32} style={{ color: "#10B981" }} />
        </div>
        <h3 className="text-2xl font-extrabold font-pos-display" style={{ color: DARK.text }}>Cobrar Pedido</h3>
        <p className="mt-2 text-sm font-pos" style={{ color: DARK.textDim }}>
          #{order.id} · Mesa {order.tableNumber}
        </p>
        <div className="mt-4 inline-flex items-baseline gap-1 rounded-xl px-5 py-3"
          style={{ background: "#10B98112", border: "1px solid #10B98125" }}>
          <span className="text-sm font-semibold" style={{ color: "#34D399" }}>Total:</span>
          <span className="text-4xl font-extrabold font-pos-display" style={{ color: "#34D399" }}>${order.total}</span>
        </div>
      </div>

      <p className="mb-4 text-center text-sm font-semibold" style={{ color: DARK.textMuted }}>¿Cómo paga el cliente?</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onConfirm("efectivo")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: DARK.surface, border: `2px solid ${DARK.cardBorder}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10B98160"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = DARK.cardBorder; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "#10B98118" }}>
            <Banknote size={28} style={{ color: "#10B981" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: DARK.text }}>Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: DARK.surface, border: `2px solid ${DARK.cardBorder}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F660"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = DARK.cardBorder; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "#3B82F618" }}>
            <CreditCard size={28} style={{ color: "#3B82F6" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: DARK.text }}>Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════ ORDER CARD (UNIFIED) ═══════════════════ */
const OrderCard = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const c = STATE_COLORS[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn("relative overflow-hidden rounded-xl font-pos transition-all duration-150", isDone && "opacity-50")}
      style={{
        background: DARK.card,
        border: `1px solid ${DARK.cardBorder}`,
        boxShadow: isDone ? "none" : c.glow,
      }}>
      {/* Left accent border */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ background: c.hex }} />

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 pl-6"
        style={{ borderBottom: `1px solid ${DARK.cardBorder}` }}>
        <div className="flex items-center gap-3">
          {isDelivery ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#8B5CF618" }}>
              <Truck size={20} style={{ color: "#A78BFA" }} />
            </div>
          ) : (
            <MesaAvatar num={order.tableNumber || 0} />
          )}
          <div>
            <h3 className="text-sm font-bold font-pos-display" style={{ color: DARK.text }}>
              {isDelivery ? "Domicilio" : `Mesa ${order.tableNumber}`}
            </h3>
            <span className="font-pos text-[11px] font-medium" style={{ color: DARK.textDim }}>#{order.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && <UrgencyBadge minutes={mins} />}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-3 px-5 py-4 pl-6">
        {/* Time + timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium font-pos" style={{ color: DARK.textDim }}>
            <Clock size={14} />
            <span>{fmtTime(order.createdAt)}</span>
          </div>
          {!isDone && <CircularTimer createdAt={order.createdAt} size={48} />}
        </div>

        {/* Delivery info */}
        {isDelivery && (
          <div className="space-y-1.5 rounded-lg p-3" style={{ background: DARK.surface, border: `1px solid ${DARK.cardBorder}` }}>
            {order.customerName && (
              <div className="flex items-center gap-2 text-xs font-pos">
                <User size={13} style={{ color: "#A78BFA" }} />
                <span className="font-semibold" style={{ color: DARK.text }}>{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-xs font-pos">
                <Phone size={13} style={{ color: "#34D399" }} />
                <a href={`tel:${order.customerPhone}`} className="font-semibold hover:underline" style={{ color: "#34D399" }}>{order.customerPhone}</a>
              </div>
            )}
            {order.customerAddress && (
              <div className="flex items-start gap-2 text-xs font-pos">
                <MapPin size={13} className="mt-0.5" style={{ color: "#FBBF24" }} />
                <span style={{ color: DARK.textMuted }}>{order.customerAddress}</span>
              </div>
            )}
            {dd && (
              <>
                <div className="flex items-center gap-2 text-xs font-pos" style={{ color: DARK.textMuted }}>
                  {dd.type === "casa" ? <Home size={13} /> : <Building2 size={13} />}
                  <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
                </div>
                {dd.references && (
                  <div className="flex items-start gap-2 text-xs font-pos">
                    <Navigation size={13} className="mt-0.5" style={{ color: "#60A5FA" }} />
                    <span className="italic" style={{ color: DARK.textDim }}>{dd.references}</span>
                  </div>
                )}
                {dd.hasControlledAccess && dd.accessInstructions && (
                  <div className="flex items-start gap-2 text-xs font-pos">
                    <AlertTriangle size={13} className="mt-0.5" style={{ color: "#F87171" }} />
                    <span className="font-semibold" style={{ color: "#F87171" }}>{dd.accessInstructions}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-pos">
                  {dd.paymentMethod === "efectivo" ? <Banknote size={13} style={{ color: "#34D399" }} /> : <CreditCard size={13} style={{ color: "#60A5FA" }} />}
                  <span className="font-semibold capitalize" style={{ color: DARK.textMuted }}>Pago: {dd.paymentMethod}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div className="rounded-lg p-3" style={{ background: DARK.surface }}>
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5"
          style={{ background: `${DARK.surface}`, borderTop: `1px solid ${DARK.cardBorder}` }}>
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-pos"
            style={{ color: DARK.textDim }}>
            <Receipt size={14} /> Total
          </span>
          <span className="text-2xl font-extrabold font-pos-display" style={{ color: DARK.text }}>${order.total}</span>
        </div>

        {/* WhatsApp */}
        {isDelivery && !isDone && order.customerPhone && (
          <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold font-pos text-white transition-all duration-150 active:scale-[0.97]"
            style={{ background: "#25D366" }}>
            <Phone size={16} /> WhatsApp <ExternalLink size={12} />
          </a>
        )}

        {/* Actions */}
        {!isDone && <ActionButtons order={order} onAction={onAction} isDelivery={isDelivery} />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════ KANBAN COLUMN ═══════════════════ */
const KanbanCol = ({ status, orders, renderCard }: {
  status: OrderStatus; orders: Order[]; renderCard: (o: Order) => React.ReactNode;
}) => {
  if (orders.length === 0 && status === "entregado") return null;
  const c = STATE_COLORS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 font-pos"
        style={{ background: c.bg, border: `1px solid ${c.hex}20` }}>
        <Icon size={16} style={{ color: c.text }} />
        <span className="text-sm font-bold" style={{ color: c.text }}>{c.label}</span>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-bold font-pos"
          style={{ background: `${c.hex}25`, color: c.text }}>
          {orders.length}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${DARK.cardBorder} transparent` }}>
        <AnimatePresence mode="popLayout">
          {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="flex flex-col items-center rounded-xl py-10 text-center font-pos"
            style={{ background: DARK.card, border: `1px dashed ${DARK.cardBorder}` }}>
            <ClipboardList size={22} style={{ color: DARK.textDim }} />
            <p className="mt-2 text-sm font-medium" style={{ color: DARK.textDim }}>Sin pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════ EMPTY STATE ═══════════════════ */
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center font-pos">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
      style={{ background: DARK.surface }}>
      {type === "mesas"
        ? <UtensilsCrossed size={36} style={{ color: DARK.textDim }} />
        : <Truck size={36} style={{ color: DARK.textDim }} />
      }
    </div>
    <p className="text-base font-bold" style={{ color: DARK.textMuted }}>No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}</p>
    <p className="mt-1 text-sm" style={{ color: DARK.textDim }}>Aparecerán aquí en tiempo real</p>
  </div>
);

/* ═══════════════════ MAIN PAGE ═══════════════════ */
const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  const handleAction = useCallback((id: string, status: OrderStatus) => {
    if (status === "entregado") {
      const order = orders.find((o) => o.id === id);
      if (order && order.orderType === "mesa") { setPaymentOrder(order); return; }
    }
    updateOrderStatus(id, status);
  }, [orders, updateOrderStatus]);

  const handlePaymentConfirm = useCallback((_m: "efectivo" | "transferencia") => {
    if (paymentOrder) { updateOrderStatus(paymentOrder.id, "entregado"); setPaymentOrder(null); }
  }, [paymentOrder, updateOrderStatus]);

  const sortOld = (l: Order[]) => [...l].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sortNew = (l: Order[]) => [...l].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const mesaOrders = useMemo(() => orders.filter((o) => o.orderType === "mesa"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((o) => o.orderType === "domicilio"), [orders]);
  const activeMesa = mesaOrders.filter((o) => o.status !== "entregado").length;
  const activeDelivery = deliveryOrders.filter((o) => o.status !== "entregado").length;
  const totalActive = activeMesa + activeDelivery;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const group = useCallback((list: Order[]) => ({
    recibido: sortOld(list.filter((o) => o.status === "recibido")),
    preparando: sortOld(list.filter((o) => o.status === "preparando")),
    listo: sortOld(list.filter((o) => o.status === "listo")),
    entregado: sortNew(list.filter((o) => o.status === "entregado")).slice(0, 5),
  }), []);

  const mesaG = useMemo(() => group(mesaOrders), [mesaOrders, group]);
  const delG = useMemo(() => group(deliveryOrders), [deliveryOrders, group]);
  const ACTIVE: OrderStatus[] = ["recibido", "preparando", "listo"];
  const ALL: OrderStatus[] = ["recibido", "preparando", "listo", "entregado"];

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; count: number; color: string }[] = [
    { key: "todo", label: "Vista Completa", icon: Eye, count: totalActive, color: "#8A94A6" },
    { key: "mesas", label: "Mesas", icon: UtensilsCrossed, count: activeMesa, color: "#3B82F6" },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery, color: "#8B5CF6" },
  ];

  return (
    <div className="min-h-screen -m-4 -mt-2 p-5 pt-3 lg:-m-6 lg:-mt-2 lg:p-7 lg:pt-3 space-y-5 font-pos"
      style={{ background: DARK.bg }}>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="#3B82F6" />
        <StatCard label="Activos" value={totalActive} icon={Zap} color="#F59E0B" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="#10B981" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={BadgeDollarSign} color="#8B5CF6" />
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-1 rounded-xl p-1"
        style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        {tabs.map((tab) => {
          const active = viewMode === tab.key;
          return (
            <button key={tab.key} onClick={() => setViewMode(tab.key)}
              className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold font-pos transition-all duration-150"
              style={{
                background: active ? DARK.surface : "transparent",
                color: active ? DARK.text : DARK.textDim,
                border: active ? `1px solid ${DARK.cardBorder}` : "1px solid transparent",
              }}>
              <tab.icon size={16} style={{ color: active ? tab.color : DARK.textDim }} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-bold tabular-nums"
                  style={{
                    background: active ? `${tab.color}20` : "#EF444420",
                    color: active ? tab.color : "#F87171",
                  }}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SPLIT VIEW ── */}
      {viewMode === "todo" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* MESAS */}
          <section className="rounded-xl p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#3B82F618" }}>
                  <UtensilsCrossed size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-pos-display" style={{ color: DARK.text }}>Mesas</h2>
                  <p className="text-xs font-medium" style={{ color: DARK.textDim }}>{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                style={{ background: "#3B82F615", color: "#60A5FA", border: "1px solid #3B82F625" }}>
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>

          {/* DOMICILIO */}
          <section className="rounded-xl p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#8B5CF618" }}>
                  <Truck size={20} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-pos-display" style={{ color: DARK.text }}>Domicilio</h2>
                  <p className="text-xs font-medium" style={{ color: DARK.textDim }}>{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                style={{ background: "#8B5CF615", color: "#A78BFA", border: "1px solid #8B5CF625" }}>
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} isDelivery />} />)}</div>
            )}
          </section>
        </div>
      )}

      {viewMode === "mesas" && (
        activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} />} />)}
          </div>
        )
      )}

      {viewMode === "domicilio" && (
        activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} isDelivery />} />)}
          </div>
        )
      )}

      <AnimatePresence>
        {paymentOrder && <PaymentDialog order={paymentOrder} onConfirm={handlePaymentConfirm} onClose={() => setPaymentOrder(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
