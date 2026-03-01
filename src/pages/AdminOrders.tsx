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
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

type Filter = "todos" | "mesa" | "domicilio";

// Elapsed timer hook
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

// Elapsed badge component
const ElapsedBadge = ({ createdAt }: { createdAt: Date }) => {
  const elapsed = useElapsed(createdAt);
  const minutes = Math.floor(elapsed / 60);
  const isUrgent = minutes >= 20;

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold tabular-nums",
        isUrgent
          ? "bg-destructive/15 text-destructive animate-pulse"
          : "bg-muted text-muted-foreground"
      )}
    >
      <Clock size={12} />
      {formatElapsed(elapsed)}
    </span>
  );
};

// Payment confirmation dialog
const PaymentDialog = ({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: (method: "efectivo" | "transferencia") => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm">
    <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
      <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
        <X size={20} />
      </button>
      <h3 className="mb-1 font-display text-2xl text-card-foreground">Entregar y Cobrar</h3>
      <p className="mb-1 text-xs text-muted-foreground">{order.id}</p>
      <p className="mb-5 text-2xl font-bold text-primary">${order.total}</p>
      <p className="mb-3 text-sm text-muted-foreground">¿Cómo pagó el cliente?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onConfirm("efectivo")}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-muted/50 py-5 text-foreground transition-all hover:border-success hover:bg-success/10"
        >
          <Banknote size={28} className="text-success" />
          <span className="text-sm font-bold">Efectivo 💵</span>
        </button>
        <button
          onClick={() => onConfirm("transferencia")}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-muted/50 py-5 text-foreground transition-all hover:border-primary hover:bg-primary/10"
        >
          <CreditCard size={28} className="text-primary" />
          <span className="text-sm font-bold">Transferencia 🏦</span>
        </button>
      </div>
    </div>
  </div>
);

// Stat card
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
    <div className="mb-1 flex items-center gap-2">
      <Icon size={18} className={color} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className={cn("font-display text-3xl", color)}>{value}</p>
  </div>
);

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState<Filter>("todos");
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const prevOrderCountRef = useRef(orders.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New order alert
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      // Play sound
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGaJjIeAfnN7hIyOiX56dXqChoyMiIF7eHuBhoyMiYJ9eXp/hIuMiYN+enl/g4qLiYN+enl/g4qLiYN+ent/gomLiYR+ent/gomKiIR/e3t/gYiKiIR/e3t/gYiJh4R/fHx/gYeIh4R/fHx/gYeIhoN/fHx/gIaHhoN/fX1/gIaGhYJ/fX1/gIWGhYJ/fX1+f4WFhIJ/fn5+f4SFBIJ/fn5+f4SFBIJ/fn5+f4OEBIJ/fn5+foOEA4F+fn5+foOEA4F+fn5+foODA4F+fn9+foKDA4F+fn9+foKDA4F+fn9+foKDA4F+fn9+foKCA4B+fn9+foKCA4B+fn9+fYGCA4B+fn9+fYGCA4B+fn9+fYGCA4B+fn9+fYGBAn9+fn9+fYGBAn9+fn9+fYGBAn9+fn9+fYGBAn9+fn9+fYCBAn9+fn9+fYCBAn9+fn9+fYCBAn9+fn9+fYCBAn9+fn9+fYCBAn9+fn9+fYCBAn9+fn9+fYCAAn9+fn9+fYCAAn9+fn9+fYCAAn9+fn9+fYCAAn9+fn9+fYCAAX5+fn9+fICAAX5+fn9+fICAAX5+fn9+fICAAX5+fn9+fICAAX5+fn9+fICAAX5+fn9+fICAAX5+fn9+fH+AAX5+fn9+fH+AAX5+fn9+fH+AAX5+fn9+fH+AAX5+fn9+fH+AAX5+fn9+fH9/AX5+fn99fH9/AX5+fn99fH9/AX5+fn99fH9/AX5+fn99fH9/"
          );
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length]);

  const handleDeliver = useCallback(
    (order: Order) => {
      if (order.orderType === "domicilio" && order.deliveryDetails?.paymentMethod) {
        // Delivery already has payment method
        updateOrderStatus(order.id, "entregado");
        return;
      }
      setPaymentOrder(order);
    },
    [updateOrderStatus]
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

  // Stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status !== "entregado").length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Filter & sort (oldest first)
  const filtered = orders
    .filter((o) => {
      if (filter === "mesa") return o.orderType === "mesa";
      if (filter === "domicilio") return o.orderType === "domicilio";
      return true;
    })
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const mesaCount = orders.filter((o) => o.orderType === "mesa" && o.status !== "entregado").length;
  const deliveryCount = orders.filter((o) => o.orderType === "domicilio" && o.status !== "entregado").length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos del día" value={totalOrders} icon={ShoppingCart} color="text-primary" />
        <StatCard label="Activos ahora" value={activeOrders} icon={Zap} color="text-accent" />
        <StatCard label="Ventas del día" value={`$${totalRevenue}`} icon={TrendingUp} color="text-success" />
        <StatCard label="Ticket promedio" value={`$${avgTicket}`} icon={Receipt} color="text-primary" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { key: "todos" as Filter, label: "Todos", count: orders.filter((o) => o.status !== "entregado").length },
          { key: "mesa" as Filter, label: "🍽 Mesas", count: mesaCount },
          { key: "domicilio" as Filter, label: "🛵 Domicilio", count: deliveryCount },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
            {f.count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
          <ChefHat size={56} className="mb-3 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">No hay pedidos</p>
          <p className="text-sm text-muted-foreground">
            Los pedidos aparecerán aquí cuando los clientes ordenen
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((order) => {
            const isMesa = order.orderType === "mesa";
            const isDomicilio = order.orderType === "domicilio";
            const isDelivered = order.status === "entregado";

            return (
              <div
                key={order.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border shadow-card transition-all",
                  isDelivered ? "border-border/50 opacity-60" : "border-border"
                )}
              >
                {/* Header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3",
                    isMesa ? "bg-secondary" : "bg-primary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{isMesa ? "🍽" : "🛵"}</span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isMesa ? "text-secondary-foreground" : "text-primary-foreground"
                      )}
                    >
                      {isMesa ? `Mesa ${order.tableNumber}` : "Domicilio"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      order.status === "recibido" && "bg-accent/20 text-accent",
                      order.status === "preparando" && "bg-foreground/10 text-foreground",
                      order.status === "listo" && "bg-success/20 text-success",
                      order.status === "entregado" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col bg-card p-4">
                  {/* Meta row */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!isDelivered && <ElapsedBadge createdAt={order.createdAt} />}
                  </div>

                  {/* Delivery info */}
                  {isDomicilio && order.customerAddress && (
                    <div className="mb-3 rounded-lg bg-muted/60 p-2.5 text-xs">
                      <div className="mb-1 flex items-start gap-1.5">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-primary" />
                        <span className="text-foreground">{order.customerAddress}</span>
                      </div>
                      {order.deliveryDetails?.paymentMethod && (
                        <div className="flex items-center gap-1.5">
                          {order.deliveryDetails.paymentMethod === "efectivo" ? (
                            <Banknote size={12} className="text-success" />
                          ) : (
                            <CreditCard size={12} className="text-primary" />
                          )}
                          <span className="capitalize text-muted-foreground">
                            {order.deliveryDetails.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-3 flex-1 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm text-foreground">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-muted-foreground">
                            ${item.unitPrice * item.quantity}
                          </span>
                        </div>
                        {item.extras.length > 0 && (
                          <p className="ml-4 text-xs text-muted-foreground">
                            + {item.extras.map((e) => e.name).join(", ")}
                          </p>
                        )}
                        {item.notes && (
                          <p className="ml-4 text-xs italic text-accent">📝 {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mb-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Total</span>
                      <span className="font-display text-2xl text-primary">${order.total}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isDelivered && (
                    <div className="flex gap-2">
                      {order.status === "recibido" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "preparando")}
                            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            En preparación 🍳
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "listo")}
                            className="flex-1 rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground transition-opacity hover:opacity-90"
                          >
                            Listo ✓
                          </button>
                        </>
                      )}
                      {order.status === "preparando" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "listo")}
                          className="w-full rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground transition-opacity hover:opacity-90"
                        >
                          Marcar como listo ✓
                        </button>
                      )}
                      {order.status === "listo" && (
                        <button
                          onClick={() => handleDeliver(order)}
                          className="w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground transition-opacity hover:opacity-90"
                        >
                          Entregar y cobrar 💰
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment dialog */}
      {paymentOrder && (
        <PaymentDialog
          order={paymentOrder}
          onConfirm={handlePaymentConfirm}
          onClose={() => setPaymentOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;
