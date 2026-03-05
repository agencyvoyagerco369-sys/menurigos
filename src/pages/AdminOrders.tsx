import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { T, STATUS as STATE_COLORS, MESA_COLORS } from "@/lib/admin-theme";
import {
  Clock, ChefHat, CheckCircle2, Truck, MapPin, CreditCard, Banknote, X,
  ShoppingCart, TrendingUp, Zap, Receipt, Phone, User, Navigation,
  MessageSquare, Home, Building2, AlertTriangle,
  ArrowUpRight, Hash, ExternalLink,
  UtensilsCrossed, BadgeDollarSign, ClipboardList, Bell, Eye, Package, Trash2,
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

/* ═══════════════════ PALETTE (from shared theme) ═══════════════════ */
const P = T;

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  recibido: Bell,
  preparando: ChefHat,
  listo: CheckCircle2,
  entregado: Package,
  cancelado: XCircle,
};

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const c = STATE_COLORS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold font-pos uppercase tracking-wide"
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
    <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2 }}
      className="absolute top-0 left-0 right-0 h-1.5 z-20"
      style={{ background: "#EF4444" }} />
  );
  return (
    <div className="absolute top-0 left-0 right-0 h-1.5 z-20"
      style={{ background: "#FBBF24" }} />
  );
};

/* ═══════════════════ MESA AVATAR ═══════════════════ */
// MESA_COLORS imported from admin-theme
const MesaAvatar = ({ num }: { num: number }) => {
  const color = MESA_COLORS[(num - 1) % MESA_COLORS.length];
  return (
    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-2xl text-[17px] font-black font-pos text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      {String(num).padStart(2, "0")}
    </div>
  );
};

/* ═══════════════════ TIMER BADGE ═══════════════════ */
const TimerBadge = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const bg = isUrgent ? "rgba(212,43,43,0.15)" : isWarn ? "rgba(245,158,11,0.15)" : "rgba(212,43,43,0.08)";
  const border = isUrgent ? "#D42B2B" : isWarn ? "#F59E0B" : "#D42B2B";
  const color = isUrgent ? "#F87171" : isWarn ? "#FBBF24" : "#D42B2B";

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={isUrgent ? { repeat: Infinity, duration: 2 } : {}}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-pos-mono text-sm font-bold tabular-nums"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <Clock size={14} strokeWidth={2} />
      {fmt(elapsed)}
    </motion.div>
  );
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon: Icon, color, isBrand }: {
  label: string; value: string | number; icon: React.ElementType; color: string; isBrand?: boolean;
}) => (
  <div className="flex items-center gap-4 border-r last:border-r-0 px-5 py-4 lg:px-7 lg:py-5"
    style={{ borderColor: P.border }}>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
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
  <div className="space-y-0.5 px-1 pb-1">
    {items.map((item, idx) => (
      <div key={item.id} className="flex items-start justify-between gap-3 py-3"
        style={{ borderBottom: idx !== items.length - 1 ? `1px solid ${P.border}` : "none" }}>
        <div className="flex items-start gap-4 w-full">
          <span className="mt-0 flex h-[26px] min-w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-black font-pos"
            style={{ background: "rgba(0,0,0,0.06)", color: P.text }}>
            {item.quantity}
          </span>
          <div className="flex-1 min-w-0 -mt-1">
            <span className="text-[15px] font-extrabold font-pos text-gray-800 tracking-tight">{item.product.name}</span>
            {item.extras.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.extras.map((e, i) => (
                  <span key={i} className="rounded-md px-2 py-0.5 text-[10px] font-bold font-pos uppercase tracking-wide"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#D97706" }}>
                    + {e.name}
                  </span>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="mt-2.5 flex items-start gap-2 rounded-lg p-2.5 shadow-sm transform -rotate-1 relative" style={{ background: "#FEF9C3", border: "1px solid #FEF08A" }}>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#EAB308]/20 rounded-full" />
                <MessageSquare size={14} strokeWidth={2.5} className="text-[#A16207] shrink-0 mt-0.5" />
                <p className="text-[12px] font-pos text-[#713F12] font-semibold leading-tight">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>
        <span className="shrink-0 font-pos text-[15px] font-bold tabular-nums text-gray-800 mt-[1px]">
          ${item.unitPrice * item.quantity}
        </span>
      </div>
    ))}
  </div>
);

/* ═══════════════════ ACTION BUTTONS ═══════════════════ */
const ActionButtons = ({ order, onAction, onCancel, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; onCancel: (order: Order) => void; isDelivery?: boolean }) => {
  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm";
  return (
    <div className="flex gap-2.5">
      {order.status === "recibido" && (
        <button onClick={() => onAction(order.id, "preparando")}
          className={cn(btnBase, "hover:brightness-110")} style={{ background: P.brand, color: "#FFFFFF" }}>
          <ChefHat size={18} strokeWidth={2.5} /> Preparar Pedido
        </button>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")}
          className={cn(btnBase, "hover:brightness-110")} style={{ background: "#10B981", color: "#FFFFFF" }}>
          <CheckCircle2 size={18} strokeWidth={2.5} /> Marcar Listo
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")}
          className={cn(btnBase, "hover:brightness-110")} style={{ background: order.paymentMethod ? "#10B981" : "#3B82F6", color: "#FFFFFF" }}>
          <Package size={18} strokeWidth={2.5} /> {isDelivery ? "Marcar Entregado" : order.paymentMethod ? "✅ Entregar" : "Cobrar y Entregar"}
        </button>
      )}
      {/* Cancel button */}
      <button onClick={() => onCancel(order)}
        className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm hover:brightness-110"
        style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}>
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ═══════════════════ CANCEL DIALOG ═══════════════════ */
const CancelDialog = ({ order, onConfirm, onClose }: {
  order: Order; onConfirm: () => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#00000070", backdropFilter: "blur(8px)" }} onClick={onClose}>
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      className="relative mx-4 w-full max-w-md overflow-hidden rounded-xl p-8 font-pos"
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: P.textMuted }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <X size={18} strokeWidth={2} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(239,68,68,0.15)" }}>
          <AlertTriangle size={32} style={{ color: "#EF4444" }} />
        </div>
        <h3 className="text-2xl font-extrabold font-pos" style={{ color: P.text }}>¿Cancelar Pedido?</h3>
        <p className="mt-2 font-pos-mono text-sm" style={{ color: P.textMuted }}>
          #{order.id.slice(0, 8)} · {order.orderType === "mesa" ? `Mesa ${order.tableNumber}` : "Domicilio"}
        </p>
        <p className="mt-3 text-sm font-medium font-pos" style={{ color: P.textMuted }}>
          Esta acción no se puede deshacer. El pedido será marcado como cancelado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold font-pos uppercase tracking-wide transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}`, color: P.text }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10B981"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          No, Mantener
        </button>
        <button onClick={onConfirm}
          className="flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold font-pos uppercase tracking-wide text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#EF4444" }}>
          <Trash2 size={16} strokeWidth={2.5} /> Sí, Cancelar
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════ PAYMENT DIALOG ═══════════════════ */
const PaymentDialog = ({ order, onConfirm, onClose }: {
  order: Order; onConfirm: (m: "efectivo" | "transferencia") => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#00000070", backdropFilter: "blur(8px)" }} onClick={onClose}>
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      className="relative mx-4 w-full max-w-md overflow-hidden rounded-xl p-8 font-pos"
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: P.textMuted }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <X size={18} strokeWidth={2} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.15)" }}>
          <BadgeDollarSign size={32} style={{ color: "#10B981" }} />
        </div>
        <h3 className="text-2xl font-extrabold font-pos" style={{ color: P.text }}>Cobrar Pedido</h3>
        <p className="mt-2 font-pos-mono text-sm" style={{ color: P.textMuted }}>
          #{order.id.slice(0, 8)} · Mesa {order.tableNumber}
        </p>
        <div className="mt-4 inline-flex items-baseline gap-1 rounded-xl px-5 py-3"
          style={{ background: "rgba(16,185,129,0.12)" }}>
          <span className="text-sm font-semibold" style={{ color: "#34D399" }}>Total:</span>
          <span className="text-4xl font-extrabold font-pos" style={{ color: "#34D399" }}>${order.total}</span>
        </div>
      </div>

      <p className="mb-4 text-center text-sm font-semibold font-pos" style={{ color: P.textMuted }}>¿Cómo paga el cliente?</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onConfirm("efectivo")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10B981"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.12)" }}>
            <Banknote size={28} style={{ color: "#10B981" }} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold font-pos" style={{ color: P.text }}>Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
            <CreditCard size={28} style={{ color: "#3B82F6" }} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold font-pos" style={{ color: P.text }}>Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════ ORDER CARD ═══════════════════ */
const OrderCard = ({ order, onAction, onCancel, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; onCancel: (order: Order) => void; isDelivery?: boolean }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado" || order.status === "cancelado";
  const c = STATE_COLORS[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl font-pos transition-all duration-150",
        !isDone && "hover:-translate-y-0.5",
        isDone && "opacity-50"
      )}
      style={{
        background: P.card,
        border: `1px solid ${P.border}`,
        borderLeft: `5px solid ${c.border}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 0 0px ${c.hex}20`,
      }}>

      {!isDone && <UrgencyBadge minutes={mins} />}

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          {isDelivery ? (
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <Truck size={24} strokeWidth={2} style={{ color: "#8B5CF6" }} />
              <span className="text-sm font-black font-pos uppercase tracking-widest text-[#8B5CF6]">Envío</span>
            </div>
          ) : (
            <MesaAvatar num={order.tableNumber || 0} />
          )}
          <div>
            <h3 className="text-lg font-extrabold font-pos leading-tight" style={{ color: P.text }}>
              {isDelivery ? "Domicilio" : `Mesa ${order.tableNumber}`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium font-pos uppercase tracking-wider" style={{ color: P.textDim }}>
                ORDEN
              </span>
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-pos-mono text-[11px] font-semibold"
                style={{ background: "rgba(0,0,0,0.05)", color: P.textMuted }}>
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {order.paymentMethod && (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}>
                💰 Pagado {order.paymentMethod === "terminal" ? "(Terminal)" : "(Efectivo)"}
              </span>
            )}
            <StatusBadge status={order.status} />
          </div>
          {!isDone && (
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: P.textDim }}>
              <span>CRONÓMETRO</span>
            </div>
          )}
          {!isDone && <TimerBadge createdAt={order.createdAt} />}
        </div>
      </div>

      {/* BODY */}
      <div className="pt-0 pb-0" style={{ lineHeight: 1.6 }}>
        <div className="px-4 space-y-3 pt-2 bg-[#F9FAFB]/50 mx-3 mt-3 rounded-xl">
          {/* Delivery info */}
          {isDelivery && (
            <div className="space-y-1.5 mb-2 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.02)", border: `1px solid ${P.border}` }}>
              {order.customerName && (
                <div className="flex items-center gap-2 text-xs font-pos">
                  <User size={13} strokeWidth={2} style={{ color: "#A78BFA" }} />
                  <span className="font-semibold" style={{ color: P.text }}>{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-xs font-pos">
                  <Phone size={13} strokeWidth={2} style={{ color: "#34D399" }} />
                  <a href={`tel:${order.customerPhone}`} className="font-semibold hover:underline" style={{ color: "#34D399" }}>{order.customerPhone}</a>
                </div>
              )}
              {order.customerAddress && (
                <div className="flex items-start gap-2 text-xs font-pos">
                  <MapPin size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#FBBF24" }} />
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
                      <Navigation size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#60A5FA" }} />
                      <span className="italic" style={{ color: P.textDim }}>{dd.references}</span>
                    </div>
                  )}
                  {dd.hasControlledAccess && dd.accessInstructions && (
                    <div className="flex items-start gap-2 text-xs font-pos">
                      <AlertTriangle size={13} strokeWidth={2} className="mt-0.5" style={{ color: "#F87171" }} />
                      <span className="font-semibold" style={{ color: "#F87171" }}>{dd.accessInstructions}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs font-pos" style={{ color: P.textMuted }}>
                    {dd.paymentMethod === "efectivo" ? <Banknote size={13} strokeWidth={2} style={{ color: "#34D399" }} /> : <CreditCard size={13} strokeWidth={2} style={{ color: "#60A5FA" }} />}
                    <span className="font-semibold capitalize">Pago: {dd.paymentMethod}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Items */}
          <OrderItemsList items={order.items} />
        </div>

        {/* Total (Receipt Divider) */}
        <div className="relative mt-2 flex items-center justify-between px-6 pt-5 pb-3 bg-[#F9FAFB]/50 mx-3 rounded-b-xl"
          style={{ borderTop: `2px dashed ${P.border}` }}>
          {/* Ticket effect cutouts */}
          <div className="absolute -left-2 -top-2.5 h-6 w-6 rounded-full z-10" style={{ background: P.card, borderRight: `1px solid ${P.border}`, borderBottom: `1px solid transparent`, transform: "rotate(-45deg)" }} />
          <div className="absolute -right-2 -top-2.5 h-6 w-6 rounded-full z-10" style={{ background: P.card, borderLeft: `1px solid ${P.border}`, borderBottom: `1px solid transparent`, transform: "rotate(45deg)" }} />

          <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] font-pos text-gray-400">
            <Receipt size={16} strokeWidth={2.5} /> Total
          </span>
          <span className="text-[32px] font-black font-pos text-gray-900 leading-none">${order.total}</span>
        </div>

        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* WhatsApp */}
          {isDelivery && !isDone && order.customerPhone && (
            <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino" : "siendo preparado"}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold font-pos text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
              style={{ background: "#25D366" }}>
              <Phone size={16} strokeWidth={2} /> WhatsApp <ExternalLink size={12} strokeWidth={2} />
            </a>
          )}

          {/* Actions */}
          {order.status === "cancelado" && (
            <div className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold font-pos uppercase tracking-wide"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <XCircle size={16} strokeWidth={2.5} /> Pedido Cancelado
            </div>
          )}
          {order.status !== "cancelado" && (
            <div className="flex gap-2.5">
              {!isDone && <ActionButtons order={order} onAction={onAction} onCancel={onCancel} isDelivery={isDelivery} />}
              {order.status === "entregado" && (
                <button onClick={() => onCancel(order)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm hover:brightness-110"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <Trash2 size={16} strokeWidth={2.5} /> Cancelar Pedido
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════ KANBAN COLUMN ═══════════════════ */
const KanbanCol = ({ status, orders, renderCard }: {
  status: OrderStatus; orders: Order[]; renderCard: (o: Order) => React.ReactNode;
}) => {
  if (orders.length === 0 && (status === "entregado" || status === "cancelado")) return null;
  const c = STATE_COLORS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2.5 rounded-lg px-4 py-3 font-pos"
        style={{ background: c.bg, borderBottom: `2px solid ${c.hex}` }}>
        <Icon size={16} strokeWidth={2} style={{ color: c.text }} />
        <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: c.text }}>{c.label}</span>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-xs font-bold font-pos text-white"
          style={{ background: c.hex }}>
          {orders.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${P.border} transparent` }}>
        <AnimatePresence mode="popLayout">
          {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="flex flex-col items-center rounded-xl py-10 text-center font-pos"
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
      style={{ background: "rgba(0,0,0,0.04)" }}>
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
  const { orders, updateOrderStatus, cancelOrder } = useOrders();
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

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

  const handleCancelRequest = useCallback((order: Order) => {
    setCancellingOrder(order);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (cancellingOrder) { cancelOrder(cancellingOrder.id); setCancellingOrder(null); }
  }, [cancellingOrder, cancelOrder]);

  const sortOld = (l: Order[]) => [...l].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sortNew = (l: Order[]) => [...l].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const mesaOrders = useMemo(() => orders.filter((o) => o.orderType === "mesa"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((o) => o.orderType === "domicilio"), [orders]);
  const activeMesa = mesaOrders.filter((o) => o.status !== "entregado" && o.status !== "cancelado").length;
  const activeDelivery = deliveryOrders.filter((o) => o.status !== "entregado" && o.status !== "cancelado").length;
  const totalActive = activeMesa + activeDelivery;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const group = useCallback((list: Order[]) => ({
    recibido: sortOld(list.filter((o) => o.status === "recibido")),
    preparando: sortOld(list.filter((o) => o.status === "preparando")),
    listo: sortOld(list.filter((o) => o.status === "listo")),
    entregado: sortNew(list.filter((o) => o.status === "entregado")).slice(0, 5),
    cancelado: sortNew(list.filter((o) => o.status === "cancelado")).slice(0, 5),
  }), []);

  const mesaG = useMemo(() => group(mesaOrders), [mesaOrders, group]);
  const delG = useMemo(() => group(deliveryOrders), [deliveryOrders, group]);
  const ACTIVE: OrderStatus[] = ["recibido", "preparando", "listo"];
  const ALL: OrderStatus[] = ["recibido", "preparando", "listo", "entregado", "cancelado"];

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; count: number }[] = [
    { key: "todo", label: "Vista Completa", icon: Eye, count: totalActive },
    { key: "mesas", label: "Mesas", icon: UtensilsCrossed, count: activeMesa },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery },
  ];

  return (
    <div className="min-h-screen -m-4 -mt-2 lg:-m-6 lg:-mt-2 font-pos" style={{ background: P.bg, lineHeight: 1.6 }}>

      {/* ── STATS BAR ── */}
      <div className="flex flex-wrap" style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="#3B82F6" />
        <StatCard label="Activos" value={totalActive} icon={Zap} color="#F59E0B" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color={P.brand} isBrand />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={BadgeDollarSign} color="#10B981" />
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
                  background: active ? "rgba(0,0,0,0.05)" : "transparent",
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
            <section className="rounded-xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(59,130,246,0.12)" }}>
                    <UtensilsCrossed size={20} strokeWidth={2} style={{ color: "#60A5FA" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Mesas</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("mesas")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                  Ver todo <ArrowUpRight size={12} strokeWidth={2} />
                </button>
              </div>
              {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
                <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} onCancel={handleCancelRequest} />} />)}</div>
              )}
            </section>

            <section className="rounded-xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(124,58,237,0.12)" }}>
                    <Truck size={20} strokeWidth={2} style={{ color: "#A78BFA" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Domicilio</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("domicilio")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                  Ver todo <ArrowUpRight size={12} strokeWidth={2} />
                </button>
              </div>
              {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
                <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} onCancel={handleCancelRequest} isDelivery />} />)}</div>
              )}
            </section>
          </div>
        )}

        {viewMode === "mesas" && (
          activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {ALL.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} onCancel={handleCancelRequest} />} />)}
            </div>
          )
        )}

        {viewMode === "domicilio" && (
          activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {ALL.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <OrderCard order={o} onAction={handleAction} onCancel={handleCancelRequest} isDelivery />} />)}
            </div>
          )
        )}

        <AnimatePresence>
          {paymentOrder && <PaymentDialog order={paymentOrder} onConfirm={handlePaymentConfirm} onClose={() => setPaymentOrder(null)} />}
          {cancellingOrder && <CancelDialog order={cancellingOrder} onConfirm={handleCancelConfirm} onClose={() => setCancellingOrder(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminOrders;
