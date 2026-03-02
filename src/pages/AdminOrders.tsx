import { useOrders, Order, OrderStatus } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import {
  Clock, ChefHat, CheckCircle2, Truck, MapPin, CreditCard, Banknote, X,
  ShoppingCart, TrendingUp, Zap, Receipt, Phone, User, Navigation,
  MessageSquare, Home, Building2, Utensils, Package, Flame, AlertTriangle,
  CircleDot, ArrowUpRight, Sparkles, Hash, ExternalLink,
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

/* ═══════════════════ TIMER ═══════════════════ */
const GlowTimer = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const progress = Math.min(elapsed / (30 * 60), 1);
  const C = 2 * Math.PI * 20;
  const offset = C * (1 - progress);
  const isUrgent = mins >= 20;
  const isWarn = mins >= 10;

  const color = isUrgent ? "#dc2626" : isWarn ? "#d97706" : "#0891b2";
  const bgRing = isUrgent ? "#fef2f2" : isWarn ? "#fffbeb" : "#ecfeff";
  const glow = isUrgent ? "drop-shadow(0 0 8px rgba(220,38,38,0.4))" : isWarn ? "drop-shadow(0 0 6px rgba(217,119,6,0.3))" : "none";

  return (
    <div className="relative flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 44 44" style={{ filter: glow }} className={cn(isUrgent && "animate-pulse")}>
        <circle cx="22" cy="22" r="20" fill={bgRing} stroke="none" />
        <circle cx="22" cy="22" r="20" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="22" cy="22" r="20" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 22 22)" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-black tabular-nums" style={{ color }}>{fmt(elapsed)}</span>
      </div>
    </div>
  );
};

/* ═══════════════════ STATUS CONFIG ═══════════════════ */
const STATUS: Record<OrderStatus, {
  label: string; icon: React.ElementType;
  text: string; bg: string; border: string; cardBorder: string; gradient: string;
}> = {
  recibido: {
    label: "Nuevo", icon: CircleDot,
    text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    cardBorder: "border-amber-200 shadow-amber-100/50", gradient: "from-amber-50 to-orange-50",
  },
  preparando: {
    label: "En cocina", icon: ChefHat,
    text: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200",
    cardBorder: "border-cyan-200 shadow-cyan-100/50", gradient: "from-cyan-50 to-sky-50",
  },
  listo: {
    label: "Listo", icon: CheckCircle2,
    text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    cardBorder: "border-emerald-200 shadow-emerald-100/50", gradient: "from-emerald-50 to-green-50",
  },
  entregado: {
    label: "Entregado", icon: Package,
    text: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200",
    cardBorder: "border-slate-100", gradient: "from-slate-50 to-gray-50",
  },
};

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", cfg.bg, cfg.text, cfg.border)}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

/* ═══════════════════ STAT CARDS ═══════════════════ */
const StatCard = ({ label, value, icon: Icon, color, bgColor }: {
  label: string; value: string | number; icon: React.ElementType; color: string; bgColor: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-3.5">
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", bgColor)}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className={cn("truncate font-display text-2xl leading-tight text-slate-800")}>{value}</p>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════ PRIORITY BAR ═══════════════════ */
const PriorityBar = ({ minutes }: { minutes: number }) => {
  if (minutes >= 20) return <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-red-500" />;
  if (minutes >= 10) return <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-amber-400" />;
  return <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-cyan-400" />;
};

/* ═══════════════════ ORDER ITEMS ═══════════════════ */
const OrderItemsList = ({ items }: { items: Order["items"] }) => (
  <div className="space-y-1.5">
    {items.map((item) => (
      <div key={item.id}>
        <div className="flex items-start justify-between gap-2 text-[13px]">
          <span className="text-slate-700">
            <span className="mr-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-slate-100 px-1 font-mono text-[10px] font-bold text-cyan-700">
              {item.quantity}×
            </span>
            <span className="font-semibold">{item.product.name}</span>
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-slate-500">${item.unitPrice * item.quantity}</span>
        </div>
        {item.extras.length > 0 && (
          <p className="ml-7 text-[11px] text-slate-400">+ {item.extras.map((e) => e.name).join(", ")}</p>
        )}
        {item.notes && (
          <p className="ml-7 flex items-center gap-1 text-[11px] italic text-amber-600">
            <MessageSquare size={9} /> {item.notes}
          </p>
        )}
      </div>
    ))}
  </div>
);

/* ═══════════════════ ACTION BUTTONS ═══════════════════ */
const ActionButtons = ({ order, onAction, isDelivery }: { order: Order; onAction: (id: string, status: OrderStatus) => void; isDelivery?: boolean }) => (
  <div className="flex gap-2">
    {order.status === "recibido" && (
      <>
        <button onClick={() => onAction(order.id, "preparando")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-cyan-700 active:scale-95">
          <ChefHat size={14} /> Preparar
        </button>
        <button onClick={() => onAction(order.id, "listo")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95">
          <CheckCircle2 size={14} /> Listo
        </button>
      </>
    )}
    {order.status === "preparando" && (
      <button onClick={() => onAction(order.id, "listo")} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95">
        <CheckCircle2 size={14} /> Marcar listo
      </button>
    )}
    {order.status === "listo" && (
      <button onClick={() => onAction(order.id, "entregado")} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95">
        <Package size={14} /> {isDelivery ? "Entregado" : "Cobrar y entregar"}
      </button>
    )}
  </div>
);

/* ═══════════════════ PAYMENT DIALOG ═══════════════════ */
const PaymentDialog = ({ order, onConfirm, onClose }: {
  order: Order; onConfirm: (m: "efectivo" | "transferencia") => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
      <button onClick={onClose} className="absolute right-4 top-4 text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <Banknote size={30} className="text-emerald-600" />
        </div>
        <h3 className="font-display text-2xl text-slate-800">Cobrar pedido</h3>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Hash size={10} />{order.id} · Mesa {order.tableNumber}
        </p>
        <p className="mt-3 font-display text-5xl text-emerald-600">${order.total}</p>
      </div>
      <p className="mb-4 text-center text-xs text-slate-400">Método de pago</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onConfirm("efectivo")}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-6 text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:scale-[1.02] active:scale-95">
          <Banknote size={30} className="text-emerald-600" />
          <span className="text-sm font-bold">Efectivo</span>
        </button>
        <button onClick={() => onConfirm("transferencia")}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-6 text-slate-700 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:scale-[1.02] active:scale-95">
          <CreditCard size={30} className="text-cyan-600" />
          <span className="text-sm font-bold">Transferencia</span>
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
  const cfg = STATUS[order.status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        isDone ? "border-slate-100 opacity-50" : cfg.cardBorder,
        !isDone && mins >= 20 && "ring-2 ring-red-200"
      )}>
      {!isDone && <PriorityBar minutes={mins} />}

      <div className={cn("flex items-center justify-between px-4 py-3 pl-5", isDone ? "bg-slate-50" : `bg-gradient-to-r ${cfg.gradient}`)}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
            <Utensils size={15} className="text-cyan-700" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">Mesa {order.tableNumber}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Hash size={8} />{order.id}
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-4 pl-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            <span>{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
            {!isDone && mins >= 10 && (
              <span className={cn("flex items-center gap-1 font-bold", mins >= 20 ? "text-red-500" : "text-amber-500")}>
                {mins >= 20 ? <Flame size={11} /> : <AlertTriangle size={11} />}
                {mins >= 20 ? "¡Urgente!" : "Atención"}
              </span>
            )}
          </div>
          {!isDone && <GlowTimer createdAt={order.createdAt} />}
        </div>

        <div className="mb-3"><OrderItemsList items={order.items} /></div>

        <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
          <span className="font-display text-3xl text-slate-800">${order.total}</span>
        </div>

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
  const cfg = STATUS[order.status];
  const dd = order.deliveryDetails;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        isDone ? "border-slate-100 opacity-50" : cfg.cardBorder,
        !isDone && mins >= 20 && "ring-2 ring-red-200"
      )}>
      {!isDone && <PriorityBar minutes={mins} />}

      <div className={cn("flex items-center justify-between px-4 py-3 pl-5", isDone ? "bg-slate-50" : "bg-gradient-to-r from-violet-50 to-fuchsia-50")}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Truck size={15} className="text-violet-700" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">Domicilio</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Hash size={8} />{order.id}
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-4 pl-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            <span>{order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
            {!isDone && mins >= 10 && (
              <span className={cn("flex items-center gap-1 font-bold", mins >= 20 ? "text-red-500" : "text-amber-500")}>
                {mins >= 20 ? <Flame size={11} /> : <AlertTriangle size={11} />}
                {mins >= 20 ? "¡Urgente!" : "Atención"}
              </span>
            )}
          </div>
          {!isDone && <GlowTimer createdAt={order.createdAt} />}
        </div>

        {/* Customer info */}
        <div className="mb-3 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
          {order.customerName && (
            <div className="flex items-center gap-2 text-xs"><User size={12} className="text-violet-500" /><span className="font-semibold text-slate-700">{order.customerName}</span></div>
          )}
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-emerald-500" /><a href={`tel:${order.customerPhone}`} className="text-emerald-600 hover:underline">{order.customerPhone}</a></div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-2 text-xs"><MapPin size={12} className="mt-0.5 text-amber-500" /><span className="text-slate-600">{order.customerAddress}</span></div>
          )}
          {dd && (
            <>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {dd.type === "casa" ? <Home size={11} /> : <Building2 size={11} />}
                <span className="capitalize">{dd.type === "casa" ? "Casa" : `Depto ${dd.aptNumber || ""} · Piso ${dd.floor || ""}`}</span>
              </div>
              {dd.references && (
                <div className="flex items-start gap-2 text-[11px]"><Navigation size={11} className="mt-0.5 text-slate-400" /><span className="text-slate-400">{dd.references}</span></div>
              )}
              {dd.hasControlledAccess && dd.accessInstructions && (
                <div className="flex items-start gap-2 text-[11px]"><AlertTriangle size={11} className="mt-0.5 text-red-400" /><span className="text-red-500">{dd.accessInstructions}</span></div>
              )}
              <div className="flex items-center gap-2 text-xs">
                {dd.paymentMethod === "efectivo" ? <Banknote size={11} className="text-emerald-500" /> : <CreditCard size={11} className="text-cyan-500" />}
                <span className="font-semibold capitalize text-slate-700">{dd.paymentMethod}</span>
              </div>
            </>
          )}
        </div>

        <div className="mb-3"><OrderItemsList items={order.items} /></div>

        <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
          <span className="font-display text-3xl text-slate-800">${order.total}</span>
        </div>

        {!isDone && order.customerPhone && (
          <a href={`https://wa.me/52${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName || ""}, tu pedido de Rigo's está ${order.status === "listo" ? "listo y en camino 🚗" : "siendo preparado 🍳"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-green-50 py-2 text-xs font-bold text-green-700 ring-1 ring-green-200 transition-all hover:bg-green-100">
            <Phone size={12} /> WhatsApp <ExternalLink size={10} />
          </a>
        )}

        {!isDone && <ActionButtons order={order} onAction={onAction} isDelivery />}
      </div>
    </motion.div>
  );
};

/* ═══════════════════ STATUS SECTION ═══════════════════ */
const StatusSection = ({ status, count }: { status: OrderStatus; count: number }) => {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest", cfg.bg, cfg.text, cfg.border)}>
        <Icon size={13} /> {cfg.label}
      </div>
      {count > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-slate-100 px-1.5 font-mono text-[11px] font-bold tabular-nums text-slate-500">
          {count}
        </span>
      )}
    </div>
  );
};

/* ═══════════════════ KANBAN COL ═══════════════════ */
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
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Package size={18} className="text-slate-300" />
          </div>
          <p className="text-xs text-slate-400">Sin pedidos</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════ EMPTY PANEL ═══════════════════ */
const EmptyPanel = ({ type }: { type: "mesas" | "domicilio" }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 ring-1 ring-slate-100">
      {type === "mesas" ? <Utensils size={32} className="text-slate-300" /> : <Truck size={32} className="text-slate-300" />}
    </div>
    <p className="text-sm font-medium text-slate-400">No hay pedidos de {type === "mesas" ? "mesas" : "domicilio"}</p>
    <p className="mt-1 text-xs text-slate-300">Aparecerán aquí en tiempo real</p>
  </div>
);

/* ═══════════════════ MAIN ═══════════════════ */
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

  const tabs: { key: ViewMode; label: string; icon: React.ElementType; count: number; activeClass: string }[] = [
    { key: "todo", label: "Vista completa", icon: Sparkles, count: totalActive, activeClass: "bg-slate-800 text-white shadow-lg" },
    { key: "mesas", label: "Mesas", icon: Utensils, count: activeMesa, activeClass: "bg-cyan-600 text-white shadow-lg shadow-cyan-200" },
    { key: "domicilio", label: "Domicilio", icon: Truck, count: activeDelivery, activeClass: "bg-violet-600 text-white shadow-lg shadow-violet-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 -m-4 -mt-2 p-4 pt-2 lg:-m-6 lg:-mt-2 lg:p-6 lg:pt-2 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos hoy" value={orders.length} icon={ShoppingCart} color="text-cyan-600" bgColor="bg-cyan-50" />
        <StatCard label="Activos" value={totalActive} icon={Zap} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard label="Ventas" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={Receipt} color="text-violet-600" bgColor="bg-violet-50" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const active = viewMode === tab.key;
          return (
            <button key={tab.key} onClick={() => setViewMode(tab.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                active ? tab.activeClass : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}>
              <TabIcon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                  active ? "bg-white/25 text-white" : "bg-red-500 text-white"
                )}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* SPLIT VIEW */}
      {viewMode === "todo" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                  <Utensils size={20} className="text-cyan-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-slate-800">Mesas</h2>
                  <p className="text-[10px] font-medium text-slate-400">{activeMesa} activo{activeMesa !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("mesas")} className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Truck size={20} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-slate-800">Domicilio</h2>
                  <p className="text-[10px] font-medium text-slate-400">{activeDelivery} activo{activeDelivery !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setViewMode("domicilio")} className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Ver todo <ArrowUpRight size={12} />
              </button>
            </div>
            {activeDelivery === 0 && deliveryOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="domicilio" /> : (
              <div className="space-y-5">{ACTIVE.map((s) => <KanbanCol key={s} status={s} orders={delG[s]} renderCard={(o) => <DeliveryCard order={o} onAction={handleAction} />} />)}</div>
            )}
          </section>
        </div>
      )}

      {viewMode === "mesas" && (
        activeMesa === 0 && mesaOrders.filter(o => o.status === "entregado").length === 0 ? <EmptyPanel type="mesas" /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ALL.map((s) => <KanbanCol key={s} status={s} orders={mesaG[s]} renderCard={(o) => <MesaCard order={o} onAction={handleAction} />} />)}
          </div>
        )
      )}

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
