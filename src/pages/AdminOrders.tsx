import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import {
  Clock, ChefHat, CheckCircle2, Truck, MapPin, CreditCard, Banknote, X,
  ShoppingCart, TrendingUp, Zap, Receipt, Phone, User, Navigation,
  MessageSquare, Home, Building2, AlertTriangle,
  ArrowUpRight, Hash, ExternalLink,
  UtensilsCrossed, BadgeDollarSign, ClipboardList, Bell, Eye, Package,
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

/* ═══════════════════ PALETTE ═══════════════════ */
const P = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  sidebar: "#1A1A2E",
  brand: "#D42B2B",
  text: "#111827",
  textMuted: "#6B7280",
  textDim: "#9CA3AF",
  surface: "#F9FAFB",
};

const STATE_COLORS: Record<OrderStatus, { hex: string; bg: string; text: string; label: string; border: string }> = {
  recibido:   { hex: "#2563EB", bg: "#DBEAFE", text: "#1D4ED8", label: "Nuevo",     border: "#2563EB" },
  preparando: { hex: "#D97706", bg: "#FEF3C7", text: "#92400E", label: "En cocina", border: "#D97706" },
  listo:      { hex: "#16A34A", bg: "#DCFCE7", text: "#15803D", label: "Listo",     border: "#16A34A" },
  entregado:  { hex: "#6B7280", bg: "#F3F4F6", text: "#374151", label: "Entregado", border: "#6B7280" },
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  recibido: Bell,
  preparando: ChefHat,
  listo: CheckCircle2,
  entregado: Package,
};

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const c = STATE_COLORS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold font-pos uppercase tracking-wide"
      style={{ background: c.bg, color: c.text }}>
      <Icon size={12} strokeWidth={2} />
      {c.label}
    </span>
  );
};

/* ═══════════════════ URGENCY BADGE ═══════════════════ */
const UrgencyBadge = ({ minutes }: { minutes: number }) => {
  if (minutes < 10) return null;
  if (minutes >= 20) return (
    <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2 }}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold font-pos uppercase tracking-wide"
      style={{ background: "#FEE2E2", color: "#991B1B" }}>
      <AlertTriangle size={11} strokeWidth={2} /> URGENTE
    </motion.span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold font-pos uppercase tracking-wide"
      style={{ background: "#FEF3C7", color: "#92400E" }}>
      <AlertTriangle size={11} strokeWidth={2} /> +10 min
    </span>
  );
};

/* ═══════════════════ MESA AVATAR ═══════════════════ */
const MESA_COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2", "#DC2626", "#4F46E5"];
const MesaAvatar = ({ num }: { num: number }) => {
  const color = MESA_COLORS[(num - 1) % MESA_COLORS.length];
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold font-pos text-white"
      style={{ background: color }}>
      {num}
    </div>
  );
};

/* ═══════════════════ TIMER BADGE ═══════════════════ */
const TimerBadge = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const bg = isUrgent ? "#FEE2E2" : isWarn ? "#FEF3C7" : P.borderLight;
  const border = isUrgent ? "#D42B2B" : isWarn ? "#D97706" : P.border;
  const color = isUrgent ? "#D42B2B" : isWarn ? "#92400E" : "#374151";

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={isUrgent ? { repeat: Infinity, duration: 2 } : {}}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-pos-mono text-xs font-semibold tabular-nums"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <Clock size={12} strokeWidth={2} />
      {fmt(elapsed)}
    </motion.div>
  );
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon: Icon, color, isBrand }: {
  label: string; value: string | number; icon: React.ElementType; color: string; isBrand?: boolean;
}) => (
  <div className="flex items-center gap-4 border-r last:border-r-0 px-5 py-4 lg:px-7 lg:py-5"
    style={{ borderColor: P.borderLight }}>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}12` }}>
      <Icon size={20} strokeWidth={2} style={{ color }} />
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] font-pos" style={{ color: P.textDim }}>{label}</p>
      <p className="text-[28px] font-extrabold leading-tight font-pos" style={{ color: isBrand ? P.brand : P.text }}>{value}</p>
    </div>
  </div>
);

/* ═══════════════════ ITEMS LIST ═══════════════════ */
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.id} className="flex items-start justify-between gap-3 rounded-md p-2.5"
        style={{ background: P.surface }}>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded text-xs font-bold font-pos"
            style={{ background: P.border, color: "#374151" }}>
            {item.quantity}×
          </span>
          <div>
            <span className="text-sm font-semibold font-pos" style={{ color: P.text }}>{item.product.name}</span>
            {item.extras.length > 0 && (
              <p className="mt-0.5 text-xs font-pos" style={{ color: P.textMuted }}>+ {item.extras.map((e) => e.name).join(", ")}</p>
            )}
            {item.notes && (
              <p className="mt-1 flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-pos"
                style={{ background: "#FEF3C7", color: "#92400E" }}>
                <MessageSquare size={10} strokeWidth={2} /> {item.notes}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 font-pos text-sm font-bold tabular-nums" style={{ color: P.text }}>
          ${item.unitPrice * item.quantity}
        </span>
      </div>
    ))}
  </div>
);

/* ═══════════════════ ACTION BUTTONS ═══════════════════ */
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold font-pos transition-all duration-150 active:scale-[0.97]";
  return (
    <div className="flex gap-2.5">
      {order.status === "recibido" && (
        <>
          <button onClick={() => onAction(order.id, "preparando")}
            className={cn(btnBase, "hover:brightness-90")} style={{ background: "#2563EB", color: "#FFFFFF", letterSpacing: "0.02em" }}>
            <ChefHat size={16} strokeWidth={2} /> Preparar
          </button>
          <button onClick={() => onAction(order.id, "listo")}
            className={cn(btnBase, "hover:brightness-90")} style={{ background: "#16A34A", color: "#FFFFFF", letterSpacing: "0.02em" }}>
            <CheckCircle2 size={16} strokeWidth={2} /> Listo
          </button>
        </>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")}
          className={cn(btnBase, "hover:brightness-90")} style={{ background: "#16A34A", color: "#FFFFFF", letterSpacing: "0.02em" }}>
          <CheckCircle2 size={16} strokeWidth={2} /> ¡Pedido Listo!
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")}
          className={cn(btnBase, "hover:brightness-90")} style={{ background: P.brand, color: "#FFFFFF", fontSize: 15, letterSpacing: "0.02em" }}>
          <Package size={16} strokeWidth={2} /> {isDelivery ? "Marcar Entregado" : "Cobrar y Entregar"}
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
    className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#00000040", backdropFilter: "blur(8px)" }} onClick={onClose}>
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      className="relative mx-4 w-full max-w-md overflow-hidden rounded-xl p-8 font-pos"
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
        style={{ color: P.textMuted }}>
        <X size={18} strokeWidth={2} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "#DCFCE7" }}>
          <BadgeDollarSign size={32} style={{ color: "#16A34A" }} />
        </div>
        <h3 className="text-2xl font-extrabold font-pos" style={{ color: P.text }}>Cobrar Pedido</h3>
        <p className="mt-2 font-pos-mono text-sm" style={{ color: P.textMuted }}>
          #{order.id.slice(0, 8)} · Mesa {order.tableNumber}
        </p>
        <div className="mt-4 inline-flex items-baseline gap-1 rounded-xl px-5 py-3"
          style={{ background: "#DCFCE7" }}>
          <span className="text-sm font-semibold" style={{ color: "#15803D" }}>Total:</span>
          <span className="text-4xl font-extrabold font-pos" style={{ color: "#15803D" }}>${order.total}</span>
        </div>
      </div>

      <p className="mb-4 text-center text-sm font-semibold font-pos" style={{ color: P.textMuted }}>¿Cómo paga el cliente?</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onConfirm("efectivo")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#16A34A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "#DCFCE7" }}>
            <Banknote size={28} style={{ color: "#16A34A" }} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold font-pos" style={{ color: P.text }}>Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563EB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "#DBEAFE" }}>
            <CreditCard size={28} style={{ color: "#2563EB" }} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold font-pos" style={{ color: P.text }}>Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════ ORDER CARD ═══════════════════ */
const OrderCard = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const c = STATE_COLORS[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-[10px] font-pos transition-all duration-150",
        !isDone && "hover:-translate-y-0.5 hover:shadow-lg",
        isDone && "opacity-60"
      )}
      style={{
        background: P.card,
        border: `1px solid ${P.border}`,
        borderLeft: `5px solid ${c.border}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}>

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          {isDelivery ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#F3E8FF" }}>
              <Truck size={20} strokeWidth={2} style={{ color: "#7C3AED" }} />
            </div>
          ) : (
            <MesaAvatar num={order.tableNumber || 0} />
          )}
          <div>
            <h3 className="text-lg font-bold font-pos leading-tight" style={{ color: P.text }}>
              {isDelivery ? "Domicilio" : `Mesa ${order.tableNumber}`}
            </h3>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-pos-mono text-[11px] font-medium"
              style={{ background: P.borderLight, border: `1px solid ${P.border}`, color: P.textMuted }}>
              <Hash size={9} strokeWidth={2} />
              {order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && <UrgencyBadge minutes={mins} />}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-3 p-4" style={{ lineHeight: 1.6 }}>
        {/* Time + timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-md px-2.5 py-1"
            style={{ background: "#EFF6FF", color: "#2563EB" }}>
            <Clock size={13} strokeWidth={2} />
            <span className="text-xs font-medium font-pos">{fmtTime(order.createdAt)}</span>
          </div>
          {!isDone && <TimerBadge createdAt={order.createdAt} />}
        </div>

        {/* Delivery info */}
        {isDelivery && (
          <div className="space-y-1.5 rounded-lg p-3" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
            {order.customerName && (
              <div className="flex items-center gap-2 text-xs font-pos">
                <User size={13} strokeWidth={2} style={{ color: "#7C3AED" }} />
                <span className="font-semibold" style={{ color: P.text }}>{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-xs font-pos">
                <Phone size={13} strokeWidth={2} style={{ color: "#16A34A" }} />
                <a href={`tel:${order.customerPhone}`} className="font-semibold hover:underline" style={{ color: "#16A34A" }}>{order.customerPhone}</a>
              </div>
            )}
            {order.customerAddress && (
              <div className="flex items-start gap-2 text-xs font-pos">
                <MapPin size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#D97706" }} />
                <span style={{ color: P.textMuted }}>{order.customerAddress}</span>
              </div>
            )}
            {dd && (
              <>
                <div className="flex items-center gap-2 text-xs font-pos" style={{ color: P.textMuted }}>
                  {dd.type === "casa" ? <Home size={13} strokeWidth={2} /> : <Building2 size={13} strokeWidth={2} />}
                  <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
                </div>
                {dd.references && (
                  <div className="flex items-start gap-2 text-xs font-pos">
                    <Navigation size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#2563EB" }} />
                    <span className="italic" style={{ color: P.textDim }}>{dd.references}</span>
                  </div>
                )}
                {dd.hasControlledAccess && dd.accessInstructions && (
                  <div className="flex items-start gap-2 text-xs font-pos">
                    <AlertTriangle size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#DC2626" }} />
                    <span className="font-semibold" style={{ color: "#DC2626" }}>{dd.accessInstructions}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-pos">
                  {dd.paymentMethod === "efectivo" ? <Banknote size={13} strokeWidth={2} style={{ color: "#16A34A" }} /> : <CreditCard size={13} strokeWidth={2} style={{ color: "#2563EB" }} />}
                  <span className="font-semibold capitalize" style={{ color: P.textMuted }}>Pago: {dd.paymentMethod}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <OrderItemsList items={order.items} />

        {/* Total */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] font-pos"
            style={{ color: P.textDim }}>
            <Receipt size={13} strokeWidth={2} /> Total
          </span>
          <span className="text-[22px] font-extrabold font-pos" style={{ color: P.brand }}>${order.total}</span>
        </div>

        {/* WhatsApp */}
        {isDelivery && !isDone && order.customerPhone && (
          <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino" : "siendo preparado"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold font-pos text-white transition-all duration-150 hover:brightness-90 active:scale-[0.97]"
            style={{ background: "#25D366" }}>
            <Phone size={16} strokeWidth={2} /> WhatsApp <ExternalLink size={12} strokeWidth={2} />
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
      <div className="mb-3 flex items-center gap-2.5 rounded-lg px-4 py-3 font-pos"
        style={{ background: c.bg, borderBottom: `2px solid ${c.hex}` }}>
        <Icon size={16} strokeWidth={2} style={{ color: c.text }} />
        <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: c.text }}>{c.label}</span>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-xs font-bold font-pos text-white"
          style={{ background: c.hex }}>
          {orders.length}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${P.border} transparent` }}>
        <AnimatePresence mode="popLayout">
          {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="flex flex-col items-center rounded-[10px] py-10 text-center font-pos"
            style={{ background: P.card, border: `1px dashed ${P.border}` }}>
            <ClipboardList size={22} strokeWidth={2} style={{ color: P.textDim }} />
            <p className="mt-2 text-sm font-medium" style={{ color: P.textDim }}>Sin pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════ EMPTY STATE ═══════════════════ */
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center font-pos">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl"
      style={{ background: P.borderLight }}>
      {type === "mesas"
        ? <UtensilsCrossed size={36} strokeWidth={2} style={{ color: P.textDim }} />
        : <Truck size={36} strokeWidth={2} style={{ color: P.textDim }} />
      }
    </div>
    <p className="text-base font-bold" style={{ color: P.textMuted }}>No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}</p>
    <p className="mt-1 text-sm" style={{ color: P.textDim }}>Aparecerán aquí en tiempo real</p>
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

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; count: number }[] = [
    { key: "todo", label: "Vista Completa", icon: Eye, count: totalActive },
    { key: "mesas", label: "Mesas", icon: UtensilsCrossed, count: activeMesa },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery },
  ];

  return (
    <div className="min-h-screen -m-4 -mt-2 lg:-m-6 lg:-mt-2 font-pos" style={{ background: P.bg, lineHeight: 1.6 }}>

      {/* ── STATS BAR ── */}
      <div className="flex flex-wrap" style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="#2563EB" />
        <StatCard label="Activos" value={totalActive} icon={Zap} color="#D97706" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color={P.brand} isBrand />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={BadgeDollarSign} color="#16A34A" />
      </div>

      <div className="space-y-5 p-5 lg:p-7">
        {/* ── TABS ── */}
        <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: P.border, background: P.card }}>
          {tabs.map((tab) => {
            const active = viewMode === tab.key;
            return (
              <button key={tab.key} onClick={() => setViewMode(tab.key)}
                className="relative flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold font-pos transition-all duration-150"
                style={{
                  background: active ? P.surface : "transparent",
                  color: active ? P.text : P.textDim,
                  border: active ? `1px solid ${P.border}` : "1px solid transparent",
                }}>
                <tab.icon size={16} strokeWidth={2} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-bold tabular-nums text-white"
                    style={{ background: active ? P.brand : P.textDim }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── SPLIT VIEW ── */}
        {viewMode === "todo" && (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* MESAS */}
            <section className="rounded-xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#DBEAFE" }}>
                    <UtensilsCrossed size={20} strokeWidth={2} style={{ color: "#2563EB" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Mesas</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("mesas")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150 hover:shadow-sm"
                  style={{ background: "#DBEAFE", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                  Ver todo <ArrowUpRight size={12} strokeWidth={2} />
                </button>
              </div>
              {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
                <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} />} />)}</div>
              )}
            </section>

            {/* DOMICILIO */}
            <section className="rounded-xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#F3E8FF" }}>
                    <Truck size={20} strokeWidth={2} style={{ color: "#7C3AED" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Domicilio</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("domicilio")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150 hover:shadow-sm"
                  style={{ background: "#F3E8FF", color: "#6D28D9", border: "1px solid #E9D5FF" }}>
                  Ver todo <ArrowUpRight size={12} strokeWidth={2} />
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
    </div>
  );
};

export default AdminOrders;
