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
  Hash,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ViewMode = "todo" | "mesas" | "domicilio";

/* ═══════════════════════════════════════════
   HOOKS & HELPERS
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   CIRCULAR TIMER — glowing ring
   ═══════════════════════════════════════════ */
const GlowTimer = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const progress = Math.min(elapsed / (30 * 60), 1);
  const C = 2 * Math.PI * 20;
  const offset = C * (1 - progress);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const color = isUrgent ? "#ef4444" : isWarn ? "#f59e0b" : "#06b6d4";
  const glow = isUrgent ? "drop-shadow(0 0 6px #ef4444)" : isWarn ? "drop-shadow(0 0 4px #f59e0b)" : "drop-shadow(0 0 3px #06b6d4)";

  return (
    <div className="relative flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 44 44" style={{ filter: glow }} className={cn(isUrgent && "animate-pulse")}>
        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r="20"
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[11px] font-black tabular-nums" style={{ color }}>{fmt(elapsed)}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════ */
const STATUS: Record<OrderStatus, {
  label: string; icon: React.ElementType;
  text: string; bg: string; border: string; glow: string; gradient: string;
}> = {
  recibido: {
    label: "Nuevo", icon: CircleDot,
    text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]", gradient: "from-amber-500/20 to-orange-500/10",
  },
  preparando: {
    label: "En cocina", icon: ChefHat,
    text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.15)]", gradient: "from-cyan-500/20 to-blue-500/10",
  },
  listo: {
    label: "Listo", icon: CheckCircle2,
    text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.15)]", gradient: "from-emerald-500/20 to-green-500/10",
  },
  entregado: {
    label: "Entregado", icon: Package,
    text: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20",
    glow: "", gradient: "from-slate-500/10 to-slate-600/5",
  },
};

/* ═══════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", cfg.bg, cfg.text, cfg.border)}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

/* ═══════════════════════════════════════════
   STAT CARDS — glass style
   ═══════════════════════════════════════════ */
const StatCard = ({ label, value, icon: Icon, color, glowColor }: {
  label: string; value: string | number; icon: React.ElementType; color: string; glowColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 backdrop-blur-sm transition-all hover:border-white/[0.12]"
    style={{ boxShadow: `0 0 20px ${glowColor}` }}
  >
    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.04]" style={{ background: glowColor }} />
    <div className="flex items-center gap-3.5">
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08]")} style={{ background: `${glowColor}15` }}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className={cn("truncate font-display text-2xl leading-tight", color)}>{value}</p>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════
   PRIORITY BAR — left accent
   ═══════════════════════════════════════════ */
const PriorityBar = ({ minutes }: { minutes: number }) => {
  if (minutes >= 20) return <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
  if (minutes >= 10) return <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />;
  return <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.3)]" />;
};

/* ═══════════════════════════════════════════
   ORDER ITEMS
   ═══════════════════════════════════════════ */
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-1.5">
    {items.map((item) => (
      <div key={item.id}>
        <div className="flex items-start justify-between gap-2 text-[13px]">
          <span className="text-slate-200">
            <span className="mr-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-white/[0.06] px-1 font-mono text-[10px] font-bold text-cyan-300">
              {item.quantity}×
            </span>
            <span className="font-semibold">{item.product.name}</span>
          </span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-slate-400">${item.unitPrice * item.quantity}</span>
        </div>
        {item.extras.length > 0 && (
          <p className="ml-7 text-[11px] text-slate-500">+ {item.extras.map((e) => e.name).join(", ")}</p>
        )}
        {item.notes && (
          <p className="ml-7 flex items-center gap-1 text-[11px] italic text-amber-400/70">
            <MessageSquare size={9} /> {item.notes}
          </p>
        )}
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   ACTION BUTTONS — gradient style
   ═══════════════════════════════════════════ */
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => (
  <div className="flex gap-2">
    {order.status === "recibido" && (
      <>
        <button onClick={() => onAction(order.id, "preparando")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 py-2.5 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/20 transition-all hover:from-cyan-500/30 hover:to-blue-500/30 active:scale-95">
          <ChefHat size={14} /> Preparar
        </button>
        <button onClick={() => onAction(order.id, "listo")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 py-2.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/20 transition-all hover:from-emerald-500/30 hover:to-green-500/30 active:scale-95">
          <CheckCircle2 size={14} /> Listo
        </button>
      </>
    )}
    {order.status === "preparando" && (
      <button onClick={() => onAction(order.id, "listo")} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 py-2.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/20 transition-all hover:from-emerald-500/30 hover:to-green-500/30 active:scale-95">
        <CheckCircle2 size={14} /> Marcar listo
      </button>
    )}
    {order.status === "listo" && (
      <button onClick={() => onAction(order.id, "entregado")} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 py-2.5 text-xs font-bold text-violet-300 ring-1 ring-violet-400/20 transition-all hover:from-violet-500/30 hover:to-purple-500/30 active:scale-95">
        <Package size={14} /> {isDelivery ? "Entregado" : "Cobrar y entregar"}
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════
   PAYMENT DIALOG
   ═══════════════════════════════════════════ */
const PaymentDialog = ({ order, onConfirm, onClose }: {
  order: Order; onConfirm: (m: "efectivo" | "transferencia") => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-lg">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl">
      <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
          <Banknote size={30} className="text-emerald-400" />
        </div>
        <h3 className="font-display text-2xl text-white">Cobrar pedido</h3>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Hash size={10} />{order.id} · Mesa {order.tableNumber}
        </p>
        <p className="mt-3 font-display text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">${order.total}</p>
      </div>
      <p className="mb-4 text-center text-xs text-slate-500">Método de pago</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onConfirm("efectivo")}
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-6 text-white transition-all hover:border-emerald-400/30 hover:bg-emerald-500/5 hover:scale-[1.02] active:scale-95">
          <Banknote size={30} className="text-emerald-400" />
          <span className="text-sm font-bold">Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-6 text-white transition-all hover:border-cyan-400/30 hover:bg-cyan-500/5 hover:scale-[1.02] active:scale-95">
          <CreditCard size={30} className="text-cyan-400" />
          <span className="text-sm font-bold">Transferencia</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════════════════════════════
   MESA ORDER CARD
   ═══════════════════════════════════════════ */
const MesaCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const cfg = STATUS[order.status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        isDone ? "border-white/[0.03] opacity-35" : cn("border-white/[0.08]", cfg.glow),
        !isDone && mins >= 20 && "ring-1 ring-red-500/30"
      )}>
      {!isDone && <PriorityBar minutes={mins} />}

      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-3 pl-5", isDone ? "bg-white/[0.01]" : `bg-gradient-to-r ${cfg.gradient}`)}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]">
            <Utensils size={15} className="text-cyan-300" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Mesa {order.tableNumber}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Hash size={8} />{order.id}
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="bg-slate-900/60 p-4 pl-5">
        {/* Time row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
            {!isDone && mins >= 10 && (
              <span className={cn("flex items-center gap-1 font-bold", mins >= 20 ? "text-red-400" : "text-amber-400")}>
                {mins >= 20 ? <Flame size={11} /> : <AlertTriangle size={11} />}
                {mins >= 20 ? "¡Urgente!" : "Atención"}
              </span>
            )}
          </div>
          {!isDone && <GlowTimer createdAt={order.createdAt} />}
        </div>

        {/* Items */}
        <div className="mb-3">
          <OrderItemsList items={order.items} />
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          <span className="font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">${order.total}</span>
        </div>

        {!isDone && <ActionButtons order={order} onAction={onAction} />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   DELIVERY ORDER CARD
   ═══════════════════════════════════════════ */
const DeliveryCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const elapsed = useElapsed(order.createdAt);
  const mins = Math.floor(elapsed / 60);
  const isDone = order.status === "entregado";
  const cfg = STATUS[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        isDone ? "border-white/[0.03] opacity-35" : cn("border-white/[0.08]", cfg.glow),
        !isDone && mins >= 20 && "ring-1 ring-red-500/30"
      )}>
      {!isDone && <PriorityBar minutes={mins} />}

      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-3 pl-5", isDone ? "bg-white/[0.01]" : "bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10")}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/[0.08]">
            <Truck size={15} className="text-violet-300" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Domicilio</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Hash size={8} />{order.id}
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="bg-slate-900/60 p-4 pl-5">
        {/* Time row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
            {!isDone && mins >= 10 && (
              <span className={cn("flex items-center gap-1 font-bold", mins >= 20 ? "text-red-400" : "text-amber-400")}>
                {mins >= 20 ? <Flame size={11} /> : <AlertTriangle size={11} />}
                {mins >= 20 ? "¡Urgente!" : "Atención"}
              </span>
            )}
          </div>
          {!isDone && <GlowTimer createdAt={order.createdAt} />}
        </div>

        {/* Customer block */}
        <div className="mb-3 space-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {order.customerName && (
            <div className="flex items-center gap-2 text-xs"><User size={12} className="text-violet-400" /><span className="font-semibold text-white">{order.customerName}</span></div>
          )}
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-emerald-400" /><a href={`tel:${order.customerPhone}`} className="text-emerald-400 hover:underline">{order.customerPhone}</a></div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-2 text-xs"><MapPin size={12} className="mt-0.5 text-amber-400" /><span className="text-slate-300">{order.customerAddress}</span></div>
          )}
          {dd && (
            <>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {dd.type === "casa" ? <Home size={11} /> : <Building2 size={11} />}
                <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
              </div>
              {dd.references && (
                <div className="flex items-start gap-2 text-[11px]"><Navigation size={11} className="mt-0.5 text-slate-600" /><span className="text-slate-500">{dd.references}</span></div>
              )}
              {dd.hasControlledAccess && dd.accessInstructions && (
                <div className="flex items-start gap-2 text-[11px]"><AlertTriangle size={11} className="mt-0.5 text-red-400" /><span className="text-red-400/80">{dd.accessInstructions}</span></div>
              )}
              <div className="flex items-center gap-2 text-xs">
                {dd.paymentMethod === "efectivo" ? <Banknote size={11} className="text-emerald-400" /> : <CreditCard size={11} className="text-cyan-400" />}
                <span className="font-semibold capitalize text-white">{dd.paymentMethod}</span>
              </div>
            </>
          )}
        </div>

        <div className="mb-3"><OrderItemsList items={order.items} /></div>

        <div className="mb-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          <span className="font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400">${order.total}</span>
        </div>

        {!isDone && order.customerPhone && (
          <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 ring-1 ring-emerald-400/20 transition-all hover:bg-emerald-500/20">
            <Phone size={12} /> WhatsApp <ExternalLink size={10} />
          </a>
        )}

        {!isDone && <ActionButtons order={order} onAction={onAction} isDelivery />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   STATUS HEADER
   ═══════════════════════════════════════════ */
const StatusSection = ({ status, count }: { status: OrderStatus; count: number }) => {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest", cfg.bg, cfg.text, cfg.border)}>
        <Icon size={13} />
        {cfg.label}
      </div>
      {count > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-white/[0.05] px-1.5 font-mono text-[11px] font-bold tabular-nums text-slate-400 ring-1 ring-white/[0.08]">
          {count}
        </span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   KANBAN COLUMN
   ═══════════════════════════════════════════ */
const KanbanCol = ({ status, orders, renderCard }: {
  status: OrderStatus; orders: Order[]; renderCard: (o: Order) => React.ReactNode;
}) => {
  if (orders.length === 0 && status === "entregado") return null;
  return (
    <div className="space-y-3">
      <StatusSection status={status} count={orders.length} />
      <AnimatePresence mode="popLayout">
        {orders.map((o) => <div key={o.id}>{renderCard(o)}</div>)}
      </AnimatePresence>
      {orders.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.06] py-10 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
            <Package size={18} className="text-slate-700" />
          </div>
          <p className="text-xs text-slate-600">Sin pedidos</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   EMPTY PANEL
   ═══════════════════════════════════════════ */
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] ring-1 ring-white/[0.06]">
      {type === "mesas" ? <Utensils size={32} className="text-slate-700" /> : <Truck size={32} className="text-slate-700" />}
    </div>
    <p className="text-sm font-medium text-slate-500">No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}</p>
    <p className="mt-1 text-xs text-slate-700">Aparecerán aquí en tiempo real</p>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
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
    { key: "todo", label: "Vista completa", icon: Sparkles, count: totalActive, color: "from-cyan-400 to-blue-500" },
    { key: "mesas", label: "Mesas", icon: Utensils, count: activeMesa, color: "from-cyan-400 to-teal-500" },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery, color: "from-violet-400 to-fuchsia-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="text-cyan-400" glowColor="rgba(6,182,212,0.08)" />
        <StatCard label="Activos" value={totalActive} icon={Zap} color="text-amber-400" glowColor="rgba(245,158,11,0.08)" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-400" glowColor="rgba(52,211,153,0.08)" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={Receipt} color="text-violet-400" glowColor="rgba(167,139,250,0.08)" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const active = viewMode === tab.key;
          return (
            <button key={tab.key} onClick={() => setViewMode(tab.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                active ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              )}>
              <TabIcon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-red-500/80 text-white"
                )}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* SPLIT VIEW */}
      {viewMode === "todo" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-white/[0.08]">
                  <Utensils size={20} className="text-cyan-300" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-white">Mesas</h2>
                  <p className="text-[10px] font-medium text-slate-500">{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")} className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/[0.08]">
                  <Truck size={20} className="text-violet-300" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-white">Domicilio</h2>
                  <p className="text-[10px] font-medium text-slate-500">{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")} className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>
        </div>
      )}

      {/* MESAS ONLY */}
      {viewMode === "mesas" && (
        activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}
          </div>
        )
      )}

      {/* DOMICILIO ONLY */}
      {viewMode === "domicilio" && (
        activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
