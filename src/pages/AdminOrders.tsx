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

/* ═══════════════════ CIRCULAR TIMER ═══════════════════ */
const CircularTimer = ({ createdAt, size = 64 }: { createdAt: Date; size?: number }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const r = (size - 8) / 2;
  const C = 2 * Math.PI * r;
  const progress = Math.min(elapsed / (30 * 60), 1);
  const offset = C * (1 - progress);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const strokeColor = isUrgent ? "#ef4444" : isWarn ? "#f59e0b" : "#06b6d4";
  const bgColor = isUrgent ? "#fef2f2" : isWarn ? "#fffbeb" : "#f0fdfa";
  const textColor = isUrgent ? "#dc2626" : isWarn ? "#d97706" : "#0891b2";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className={cn(isUrgent && "animate-pulse")}>
        <circle cx={size/2} cy={size/2} r={r} fill={bgColor} stroke="none" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" opacity="0.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={strokeColor} strokeWidth="4.5"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} className="transition-all duration-1000"
          style={{ filter: isUrgent ? `drop-shadow(0 0 6px ${strokeColor}80)` : isWarn ? `drop-shadow(0 0 4px ${strokeColor}60)` : 'none' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-black tabular-nums leading-none" style={{ color: textColor, fontSize: size > 56 ? 13 : 11 }}>
          {fmt(elapsed)}
        </span>
        {size > 56 && <span className="text-[8px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: textColor, opacity: 0.7 }}>min</span>}
      </div>
    </div>
  );
};

/* ═══════════════════ STATUS CONFIG ═══════════════════ */
const STATUS_CONFIG: Record<OrderStatus, {
  label: string; verb: string; icon: React.ElementType;
  colors: { text: string; bg: string; border: string; iconBg: string; cardBg: string; cardBorder: string; accent: string; };
}> = {
  recibido: {
    label: "🆕 Nuevo", verb: "Recibido", icon: Bell,
    colors: {
      text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200",
      iconBg: "bg-gradient-to-br from-orange-400 to-amber-500", cardBg: "bg-gradient-to-br from-orange-50 via-white to-amber-50/30",
      cardBorder: "border-orange-200/80 hover:border-orange-300", accent: "text-orange-600",
    },
  },
  preparando: {
    label: "👨‍🍳 En cocina", verb: "Preparando", icon: ChefHat,
    colors: {
      text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500", cardBg: "bg-gradient-to-br from-blue-50 via-white to-cyan-50/30",
      cardBorder: "border-blue-200/80 hover:border-blue-300", accent: "text-blue-600",
    },
  },
  listo: {
    label: "✅ Listo", verb: "Listo", icon: CheckCircle2,
    colors: {
      text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-500", cardBg: "bg-gradient-to-br from-emerald-50 via-white to-green-50/30",
      cardBorder: "border-emerald-200/80 hover:border-emerald-300", accent: "text-emerald-600",
    },
  },
  entregado: {
    label: "📦 Entregado", verb: "Entregado", icon: Package,
    colors: {
      text: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200",
      iconBg: "bg-gradient-to-br from-slate-400 to-slate-500", cardBg: "bg-slate-50/50",
      cardBorder: "border-slate-200/50", accent: "text-slate-400",
    },
  },
};

/* ═══════════════════ STATUS PILL ═══════════════════ */
const StatusPill = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm",
      cfg.colors.bg, cfg.colors.text, cfg.colors.border
    )}>
      {cfg.label}
    </span>
  );
};

/* ═══════════════════ URGENCY LABEL ═══════════════════ */
const UrgencyLabel = ({ minutes }: { minutes: number }) => {
  if (minutes < 10) return null;
  if (minutes >= 20) return (
    <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-600 ring-2 ring-red-200/50">
      <Flame size={14} /> ¡URGENTE!
    </motion.span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
      <AlertTriangle size={13} /> Atención
    </span>
  );
};

/* ═══════════════════ SIDE PRIORITY INDICATOR ═══════════════════ */
const PrioritySide = ({ minutes }: { minutes: number }) => {
  if (minutes >= 20) return <div className="absolute left-0 top-0 h-full w-2 rounded-l-2xl bg-gradient-to-b from-red-500 to-red-400" />;
  if (minutes >= 10) return <div className="absolute left-0 top-0 h-full w-2 rounded-l-2xl bg-gradient-to-b from-amber-400 to-yellow-400" />;
  return <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-gradient-to-b from-cyan-400 to-teal-400" />;
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon: Icon, gradient, iconColor }: {
  label: string; value: string | number; icon: React.ElementType; gradient: string; iconColor: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
    className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07]", gradient)} />
    <div className="relative flex items-center gap-4">
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105", gradient)}>
        <Icon size={26} className={iconColor} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="font-display text-3xl leading-tight text-slate-800">{value}</p>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════ ITEMS LIST ═══════════════════ */
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-2.5">
    {items.map((item) => (
      <div key={item.id} className="group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-extrabold text-slate-600 shadow-sm">
              {item.quantity}×
            </span>
            <div>
              <span className="text-sm font-bold text-slate-800 leading-snug">{item.product.name}</span>
              {item.extras.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-400 leading-snug">+ {item.extras.map((e) => e.name).join(", ")}</p>
              )}
              {item.notes && (
                <p className="mt-1 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700 ring-1 ring-amber-100">
                  <MessageSquare size={10} /> {item.notes}
                </p>
              )}
            </div>
          </div>
          <span className="shrink-0 mt-0.5 rounded-lg bg-slate-50 px-2 py-0.5 font-mono text-sm font-bold tabular-nums text-slate-700">
            ${item.unitPrice * item.quantity}
          </span>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════ ACTION BUTTONS (LARGE, CLEAR) ═══════════════════ */
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => {
  const btnBase = "flex flex-1 items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-extrabold shadow-md transition-all duration-200 active:scale-[0.97] hover:shadow-lg";
  return (
    <div className="flex gap-3">
      {order.status === "recibido" && (
        <>
          <button onClick={() => onAction(order.id, "preparando")}
            className={cn(btnBase, "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600")}>
            <ChefHat size={20} /> Preparar
          </button>
          <button onClick={() => onAction(order.id, "listo")}
            className={cn(btnBase, "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600")}>
            <CheckCircle2 size={20} /> Listo
          </button>
        </>
      )}
      {order.status === "preparando" && (
        <button onClick={() => onAction(order.id, "listo")}
          className={cn(btnBase, "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600")}>
          <CheckCircle2 size={20} /> ¡Pedido Listo!
        </button>
      )}
      {order.status === "listo" && (
        <button onClick={() => onAction(order.id, "entregado")}
          className={cn(btnBase, "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600")}>
          <Package size={20} /> {isDelivery ? "Marcar Entregado" : "💰 Cobrar y Entregar"}
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
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
      className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
        <X size={20} />
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200">
          <BadgeDollarSign size={40} className="text-white" />
        </div>
        <h3 className="font-display text-3xl text-slate-800">Cobrar Pedido</h3>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Hash size={12} /> {order.id} · Mesa {order.tableNumber}
        </p>
        <div className="mt-4 inline-flex items-baseline gap-1 rounded-2xl bg-emerald-50 px-6 py-3 ring-1 ring-emerald-100">
          <span className="text-sm font-semibold text-emerald-600">Total:</span>
          <span className="font-display text-5xl text-emerald-600">${order.total}</span>
        </div>
      </div>

      <p className="mb-4 text-center text-sm font-semibold text-slate-500">¿Cómo paga el cliente?</p>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onConfirm("efectivo")}
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-8 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.97]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 transition-transform group-hover:scale-110">
            <Banknote size={32} className="text-emerald-600" />
          </div>
          <span className="text-base font-extrabold text-slate-700">💵 Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-8 transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100 active:scale-[0.97]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 transition-transform group-hover:scale-110">
            <CreditCard size={32} className="text-blue-600" />
          </div>
          <span className="text-base font-extrabold text-slate-700">💳 Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════ MESA CARD ═══════════════════ */
const MesaCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const cfg = STATUS_CONFIG[order.status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-300",
        isDone ? "border-slate-200/50 opacity-40" : cfg.colors.cardBorder,
        !isDone && mins >= 20 && "ring-2 ring-red-300/50 shadow-red-100"
      )}>
      {!isDone && <PrioritySide minutes={mins} />}

      {/* HEADER */}
      <div className={cn("flex items-center justify-between px-5 py-4 pl-6", isDone ? "bg-slate-50" : cfg.colors.cardBg)}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-md shadow-cyan-200/40">
            <UtensilsCrossed size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Mesa {order.tableNumber}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">{order.id}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={order.status} />
          {!isDone && <UrgencyLabel minutes={mins} />}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 pl-6 space-y-4">
        {/* Time row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} className="text-slate-400" />
            <span className="font-semibold">{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {!isDone && <CircularTimer createdAt={order.createdAt} size={64} />}
        </div>

        {/* Items */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Receipt size={16} /> Total
          </span>
          <span className="font-display text-4xl text-slate-800">${order.total}</span>
        </div>

        {/* Actions */}
        {!isDone && <ActionButtons order={order} onAction={onAction} />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════ DELIVERY CARD ═══════════════════ */
const DeliveryCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const cfg = STATUS_CONFIG[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-300",
        isDone ? "border-slate-200/50 opacity-40" : cfg.colors.cardBorder,
        !isDone && mins >= 20 && "ring-2 ring-red-300/50 shadow-red-100"
      )}>
      {!isDone && <PrioritySide minutes={mins} />}

      {/* HEADER */}
      <div className={cn("flex items-center justify-between px-5 py-4 pl-6", isDone ? "bg-slate-50" : "bg-gradient-to-br from-violet-50 via-white to-purple-50/30")}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-200/40">
            <Truck size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Domicilio</h3>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">{order.id}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={order.status} />
          {!isDone && <UrgencyLabel minutes={mins} />}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 pl-6 space-y-4">
        {/* Time row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} className="text-slate-400" />
            <span className="font-semibold">{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {!isDone && <CircularTimer createdAt={order.createdAt} size={64} />}
        </div>

        {/* Customer info */}
        <div className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/30 p-4">
          {order.customerName && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                <User size={16} className="text-violet-600" />
              </div>
              <span className="font-bold text-slate-800">{order.customerName}</span>
            </div>
          )}
          {order.customerPhone && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Phone size={16} className="text-emerald-600" />
              </div>
              <a href={`tel:${order.customerPhone}`} className="font-semibold text-emerald-700 hover:underline">{order.customerPhone}</a>
            </div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <MapPin size={16} className="text-amber-600" />
              </div>
              <span className="text-slate-700 leading-snug">{order.customerAddress}</span>
            </div>
          )}
          {dd && (
            <>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  {dd.type === "casa" ? <Home size={16} className="text-slate-500" /> : <Building2 size={16} className="text-slate-500" />}
                </div>
                <span className="font-semibold capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
              </div>
              {dd.references && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Navigation size={16} className="text-blue-500" />
                  </div>
                  <span className="text-slate-500 italic">{dd.references}</span>
                </div>
              )}
              {dd.hasControlledAccess && dd.accessInstructions && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <span className="font-semibold text-red-600">{dd.accessInstructions}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  {dd.paymentMethod === "efectivo" ? <Banknote size={16} className="text-emerald-600" /> : <CreditCard size={16} className="text-blue-600" />}
                </div>
                <span className="font-bold capitalize text-slate-700">Pago: {dd.paymentMethod}</span>
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Receipt size={16} /> Total
          </span>
          <span className="font-display text-4xl text-slate-800">${order.total}</span>
        </div>

        {/* WhatsApp */}
        {!isDone && order.customerPhone && (
          <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 text-sm font-extrabold text-white shadow-md shadow-green-200/40 transition-all hover:shadow-lg active:scale-[0.97]">
            <Phone size={18} /> Contactar por WhatsApp <ExternalLink size={14} />
          </a>
        )}

        {/* Actions */}
        {!isDone && <ActionButtons order={order} onAction={onAction} isDelivery />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════ STATUS SECTION HEADER ═══════════════════ */
const StatusHeader = ({ status, count }: { status: OrderStatus; count: number }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-3 mb-1">
      <span className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold shadow-sm", cfg.colors.bg, cfg.colors.text, `border ${cfg.colors.border}`)}>
        {cfg.label}
      </span>
      {count > 0 && (
        <span className="flex h-7 min-w-7 items-center justify-center rounded-xl bg-slate-100 px-2 font-mono text-sm font-extrabold tabular-nums text-slate-600 shadow-sm">
          {count}
        </span>
      )}
    </div>
  );
};

/* ═══════════════════ KANBAN COLUMN ═══════════════════ */
const KanbanCol = ({ status, orders, renderCard }: {
  status: OrderStatus; orders: Order[]; renderCard: (o: Order) => React.ReactNode;
}) => {
  if (orders.length === 0 && status === "entregado") return null;
  return (
    <div className="space-y-4">
      <StatusHeader status={status} count={orders.length} />
      <AnimatePresence mode="popLayout">
        {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
      </AnimatePresence>
      {orders.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ClipboardList size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Sin pedidos aquí</p>
          <p className="mt-1 text-xs text-slate-300">Los pedidos aparecerán automáticamente</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════ EMPTY STATE ═══════════════════ */
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-28 text-center">
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 shadow-inner">
      {type === "mesas"
        ? <UtensilsCrossed size={44} className="text-slate-300" />
        : <Truck size={44} className="text-slate-300" />
      }
    </div>
    <p className="text-lg font-bold text-slate-400">No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}</p>
    <p className="mt-2 text-sm text-slate-300">Aparecerán aquí automáticamente en tiempo real</p>
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

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; emoji: string; count: number; gradient: string }[] = [
    { key: "todo", label: "Vista Completa", icon: Eye, emoji: "👁️", count: totalActive, gradient: "from-slate-700 to-slate-800" },
    { key: "mesas", label: "Mesas", icon: UtensilsCrossed, emoji: "🍽️", count: activeMesa, gradient: "from-cyan-500 to-teal-500" },
    { key: "domicilio", label: "Domicilio", icon: Truck, emoji: "🚗", count: activeDelivery, gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 -m-4 -mt-2 p-5 pt-3 lg:-m-6 lg:-mt-2 lg:p-7 lg:pt-3 space-y-6">

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} gradient="bg-gradient-to-br from-cyan-100 to-teal-100" iconColor="text-cyan-600" />
        <StatCard label="Activos" value={totalActive} icon={Zap} gradient="bg-gradient-to-br from-amber-100 to-orange-100" iconColor="text-amber-600" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} gradient="bg-gradient-to-br from-emerald-100 to-green-100" iconColor="text-emerald-600" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={BadgeDollarSign} gradient="bg-gradient-to-br from-violet-100 to-purple-100" iconColor="text-violet-600" />
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const active = viewMode === tab.key;
          return (
            <button key={tab.key} onClick={() => setViewMode(tab.key)}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-200",
                active
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}>
              <span className="text-lg">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-extrabold tabular-nums",
                  active ? "bg-white/25 text-white" : "bg-red-500 text-white shadow-sm"
                )}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SPLIT VIEW ── */}
      {viewMode === "todo" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* MESAS */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-200/30">
                  <UtensilsCrossed size={26} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">🍽️ Mesas</h2>
                  <p className="text-sm font-semibold text-slate-400">{activeMesa} pedido{activeMesa !== 1 ? "s" : ""} activo{activeMesa !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-600 ring-1 ring-cyan-200 transition-all hover:bg-cyan-100 hover:shadow-sm">
                Ver todo <ArrowUpRight size={14} />
              </button>
            </div>
            {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
              <div className="space-y-6">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>

          {/* DOMICILIO */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-200/30">
                  <Truck size={26} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">🚗 Domicilio</h2>
                  <p className="text-sm font-semibold text-slate-400">{activeDelivery} pedido{activeDelivery !== 1 ? "s" : ""} activo{activeDelivery !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")}
                className="flex items-center gap-1.5 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-600 ring-1 ring-violet-200 transition-all hover:bg-violet-100 hover:shadow-sm">
                Ver todo <ArrowUpRight size={14} />
              </button>
            </div>
            {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
              <div className="space-y-6">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>
        </div>
      )}

      {viewMode === "mesas" && (
        activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}
          </div>
        )
      )}

      {viewMode === "domicilio" && (
        activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />)}
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
