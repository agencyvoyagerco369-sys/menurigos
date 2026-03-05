import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import { T, STATUS as STATE_COLORS, MESA_COLORS } from "@/lib/admin-theme";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MSIcon = ({ name, size = 24, className, style }: { name: string, size?: number, className?: string, style?: React.CSSProperties }) => (
  <span className={cn("material-symbols-outlined", className)} style={{ fontSize: `${size}px`, ...style }}>
    {name}
  </span>
);

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

const STATUS_ICONS: Record<OrderStatus, string> = {
  recibido: "notifications",
  preparando: "skillet",
  listo: "task_alt",
  entregado: "package",
  cancelado: "cancel",
};

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const c = STATE_COLORS[status];
  const icon = STATUS_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold font-pos uppercase tracking-wide text-white shadow-sm"
      style={{ background: c.hex }}>
      <MSIcon name={icon} size={13} />
      {c.label}
    </span>
  );
};

/* ═══════════════════ URGENCY BADGE ═══════════════════ */
const UrgencyBadge = ({ minutes }: { minutes: number }) => {
  if (minutes < 10) return null;
  const isUrgent = minutes >= 20;
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center justify-center">
      <motion.div
        animate={isUrgent ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
        transition={isUrgent ? { repeat: Infinity, duration: 1.5 } : {}}
        className="h-2.5 w-2.5 rounded-full shadow-sm"
        style={{ background: isUrgent ? "#EF4444" : "#FBBF24" }}
      />
    </div>
  );
};

/* ═══════════════════ MESA AVATAR ═══════════════════ */
// MESA_COLORS imported from admin-theme
const MesaAvatar = ({ num }: { num: number }) => {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[17px] font-black font-pos text-gray-800 shadow-sm border border-gray-100 bg-gray-50">
      {num}
    </div>
  );
};

/* ═══════════════════ TIMER BADGE ═══════════════════ */
const TimerBadge = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 15;

  const bg = isUrgent ? "#DC2626" : isWarn ? "#FEF3C7" : "#F3F4F6";
  const color = isUrgent ? "#FFFFFF" : isWarn ? "#92400E" : "#6B7280";

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={isUrgent ? { repeat: Infinity, duration: 1.5 } : {}}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-pos-mono text-[13px] font-extrabold tabular-nums shadow-sm",
        isUrgent && "shadow-md"
      )}
      style={{ background: bg, color }}>
      <MSIcon name="timer" size={14} />
      {fmt(elapsed)}
    </motion.div>
  );
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon, color, isBrand }: {
  label: string; value: string | number; icon: string; color: string; isBrand?: boolean;
}) => (
  <div className="flex items-center gap-4 border-r last:border-r-0 px-5 py-4 lg:px-7 lg:py-5"
    style={{ borderColor: P.border }}>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
      <MSIcon name={icon} size={22} style={{ color }} />
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
                <MSIcon name="chat" size={14} className="text-[#A16207] shrink-0 mt-0.5" />
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
  const btnBase = "flex flex-[1_1_auto] min-w-[200px] items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm";
  return (
    <div className="flex flex-wrap gap-2.5 w-full">
      {order.status === "recibido" && (
        <button onClick={() => onAction(order.id, "preparando")}
          className={cn(btnBase, "hover:-translate-y-0.5")} style={{ background: P.brand, color: "#FFFFFF" }}>
          <MSIcon name="skillet" size={18} /> Preparar Pedido
        </button>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")}
          className={cn(btnBase, "hover:-translate-y-0.5")} style={{ background: "#10B981", color: "#FFFFFF" }}>
          <MSIcon name="task_alt" size={18} /> Marcar Listo
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")}
          className={cn(btnBase, "hover:-translate-y-0.5")} style={{ background: order.paymentMethod ? "#10B981" : "#3B82F6", color: "#FFFFFF" }}>
          {isDelivery ? (
            <><MSIcon name="local_shipping" size={18} /> Marcar Entregado</>
          ) : order.paymentMethod ? (
            <><MSIcon name="task_alt" size={18} /> Entregar</>
          ) : (
            <><MSIcon name="payments" size={18} /> Cobrar</>
          )}
        </button>
      )}
      {/* Cancel button */}
      <button onClick={() => onCancel(order)}
        className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm hover:-translate-y-0.5 shrink-0"
        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" }}>
        <MSIcon name="delete" size={18} />
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
        <MSIcon name="close" size={18} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(239,68,68,0.15)" }}>
          <MSIcon name="warning" size={32} style={{ color: "#EF4444" }} />
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
          <MSIcon name="delete" size={16} /> Sí, Cancelar
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
        <MSIcon name="close" size={18} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.15)" }}>
          <MSIcon name="payments" size={32} style={{ color: "#10B981" }} />
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
            <MSIcon name="payments" size={28} style={{ color: "#10B981" }} />
          </div>
          <span className="text-sm font-bold font-pos" style={{ color: P.text }}>Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="group flex flex-col items-center gap-3 rounded-xl py-7 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          style={{ background: P.surface, border: `2px solid ${P.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
            <MSIcon name="credit_card" size={28} style={{ color: "#3B82F6" }} />
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
        "relative overflow-hidden rounded-2xl font-pos transition-all duration-150 bg-white",
        !isDone && "hover:-translate-y-0.5",
        isDone && "opacity-50 shadow-sm"
      )}
      style={{
        boxShadow: !isDone ? "0 10px 40px -10px rgba(0,0,0,0.08)" : undefined
      }}>

      {!isDone && <UrgencyBadge minutes={mins} />}

      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          {isDelivery ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm border" style={{ borderColor: "#EDE9FE", background: "#F5F3FF" }}>
              <MSIcon name="local_shipping" size={22} style={{ color: "#8B5CF6" }} />
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
        <div className="flex flex-wrap flex-1 min-w-[150px] items-center justify-end gap-2">
          {order.paymentMethod && (
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shrink-0"
              style={{ background: "#10B981" }}>
              <MSIcon name="check_circle" size={12} />
              Pagado {order.paymentMethod === "terminal" ? "(Terminal)" : "(Efectivo)"}
            </span>
          )}
          <div className="flex shrink-0">
            <StatusBadge status={order.status} />
          </div>
          {!isDone && (
            <div className="flex shrink-0">
              <TimerBadge createdAt={order.createdAt} />
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="pt-0 pb-0" style={{ lineHeight: 1.6 }}>
        <div className="px-4 space-y-3 pt-3 bg-transparent mx-3 mt-1 rounded-xl">
          {/* Delivery info */}
          {isDelivery && (
            <div className="space-y-1.5 mb-2 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.02)", border: `1px solid ${P.border}` }}>
              {order.customerName && (
                <div className="flex items-center gap-2 text-xs font-pos">
                  <MSIcon name="person" size={13} style={{ color: "#A78BFA" }} />
                  <span className="font-semibold" style={{ color: P.text }}>{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-xs font-pos">
                  <MSIcon name="call" size={13} style={{ color: "#34D399" }} />
                  <a href={`tel:${order.customerPhone}`} className="font-semibold hover:underline" style={{ color: "#34D399" }}>{order.customerPhone}</a>
                </div>
              )}
              {order.customerAddress && (
                <div className="flex items-start gap-2 text-xs font-pos">
                  <MSIcon name="location_on" size={13} className="mt-0.5" style={{ color: "#FBBF24" }} />
                  <span style={{ color: P.textMuted }}>{order.customerAddress}</span>
                </div>
              )}
              {dd && (
                <>
                  <div className="flex items-center gap-2 text-xs font-pos" style={{ color: P.textMuted }}>
                    {dd.type === "casa" ? <MSIcon name="home" size={13} /> : <MSIcon name="domain" size={13} />}
                    <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
                  </div>
                  {dd.references && (
                    <div className="flex items-start gap-2 text-xs font-pos">
                      <MSIcon name="navigation" size={13} className="mt-0.5" style={{ color: "#60A5FA" }} />
                      <span className="italic" style={{ color: P.textDim }}>{dd.references}</span>
                    </div>
                  )}
                  {dd.hasControlledAccess && dd.accessInstructions && (
                    <div className="flex items-start gap-2 text-xs font-pos">
                      <MSIcon name="warning" size={13} className="mt-0.5" style={{ color: "#F87171" }} />
                      <span className="font-semibold" style={{ color: "#F87171" }}>{dd.accessInstructions}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs font-pos" style={{ color: P.textMuted }}>
                    {dd.paymentMethod === "efectivo" ? <MSIcon name="payments" size={13} style={{ color: "#34D399" }} /> : <MSIcon name="credit_card" size={13} style={{ color: "#60A5FA" }} />}
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
        <div className="relative flex items-center justify-between px-6 pt-5 pb-3 bg-transparent mx-3 rounded-b-xl"
          style={{ borderTop: `1px solid ${P.border}` }}>
          {/* Ticket effect removed for a cleaner modern look */}

          <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] font-pos text-gray-400">
            <MSIcon name="receipt" size={16} /> Total
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
              <MSIcon name="call" size={16} /> WhatsApp <MSIcon name="open_in_new" size={12} />
            </a>
          )}

          {/* Actions */}
          {order.status === "cancelado" && (
            <div className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold font-pos uppercase tracking-wide"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <MSIcon name="cancel" size={16} /> Pedido Cancelado
            </div>
          )}
          {order.status !== "cancelado" && (
            <div className="flex gap-2.5">
              {!isDone && <ActionButtons order={order} onAction={onAction} onCancel={onCancel} isDelivery={isDelivery} />}
              {order.status === "entregado" && (
                <button onClick={() => onCancel(order)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-3.5 text-sm font-bold font-pos tracking-wide uppercase transition-all duration-150 active:scale-[0.97] shadow-sm bg-white hover:-translate-y-0.5"
                  style={{ color: "#EF4444", border: "2px solid rgba(239,68,68,0.3)" }}>
                  <MSIcon name="delete" size={18} /> Cancelar Pedido
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
  const icon = STATUS_ICONS[status];
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white shadow-sm font-pos"
          style={{ border: `1px solid ${c.hex}30` }}>
          <div className="h-2 w-2 rounded-full" style={{ background: c.hex }} />
          <span className="text-[11px] font-black uppercase tracking-[0.08em] text-gray-800">{c.label}</span>
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-black font-pos tabular-nums"
            style={{ background: `${c.hex}15`, color: c.hex }}>
            {orders.length}
          </span>
        </div>
      </div>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${P.border} transparent` }}>
        <AnimatePresence mode="popLayout">
          {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="flex flex-col items-center rounded-xl py-10 text-center font-pos"
            style={{ background: P.card, border: `1px dashed ${P.border}` }}>
            <MSIcon name="assignment" size={22} style={{ color: P.textDim }} />
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
        ? <MSIcon name="restaurant" size={36} style={{ color: P.textDim }} />
        : <MSIcon name="local_shipping" size={36} style={{ color: P.textDim }} />
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
      if (order && order.orderType === "mesa" && !order.paymentMethod) { setPaymentOrder(order); return; }
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
    entregado: sortNew(list.filter((o) => o.status === "entregado")),
    cancelado: sortNew(list.filter((o) => o.status === "cancelado")),
  }), []);

  const mesaG = useMemo(() => group(mesaOrders), [mesaOrders, group]);
  const delG = useMemo(() => group(deliveryOrders), [deliveryOrders, group]);
  const ACTIVE: OrderStatus[] = ["recibido", "preparando", "listo"];
  const ALL: OrderStatus[] = ["recibido", "preparando", "listo", "entregado", "cancelado"];

  const tabs: { key: ViewMode; label: string; icon: string; count: number }[] = [
    { key: "todo", label: "Vista Completa", icon: "visibility", count: totalActive },
    { key: "mesas", label: "Mesas", icon: "restaurant", count: activeMesa },
    { key: "domicilio", label: "Domicilio", icon: "local_shipping", count: activeDelivery },
  ];

  return (
    <div className="min-h-screen -m-4 -mt-2 lg:-m-6 lg:-mt-2 font-pos" style={{ background: P.bg, lineHeight: 1.6 }}>

      <div className="flex flex-wrap" style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <StatCard label="Pedidos hoy" value={orders.length} icon="shopping_cart" color="#3B82F6" />
        <StatCard label="Activos" value={totalActive} icon="bolt" color="#F59E0B" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon="trending_up" color="#10B981" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon="payments" color="#8B5CF6" />
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
                <MSIcon name={tab.icon} size={18} />
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
                    <MSIcon name="restaurant" size={20} style={{ color: "#60A5FA" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Mesas</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("mesas")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                  Ver todo <MSIcon name="arrow_outward" size={12} />
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
                    <MSIcon name="local_shipping" size={20} style={{ color: "#A78BFA" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-pos" style={{ color: P.text }}>Domicilio</h2>
                    <p className="text-xs font-medium" style={{ color: P.textDim }}>{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setViewMode("domicilio")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold font-pos transition-all duration-150"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                  Ver todo <MSIcon name="arrow_outward" size={12} />
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
