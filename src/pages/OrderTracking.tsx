import { useParams, useNavigate } from "react-router-dom";
import { useOrders, OrderStatus } from "@/context/OrdersContext";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "recibido", label: "Recibido", icon: <Clock size={20} /> },
  { key: "preparando", label: "En preparación", icon: <ChefHat size={20} /> },
  { key: "listo", label: "¡Listo!", icon: <CheckCircle size={20} /> },
];

const statusIndex: Record<OrderStatus, number> = {
  recibido: 0,
  preparando: 1,
  listo: 2,
  entregado: 3,
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Poll for status updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const order = orderId ? getOrder(orderId) : undefined;

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Pedido no encontrado</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const currentIdx = statusIndex[order.status];
  const isReady = order.status === "listo" || order.status === "entregado";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-brand" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(190_62%_32%_/_0.5)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        {/* Ready celebration */}
        {isReady ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="mb-6"
          >
            <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-success/20 shadow-[0_0_40px_hsl(123_46%_34%_/_0.3)]">
              <PartyPopper size={48} className="text-success" />
            </div>
            <h1 className="font-display text-5xl text-accent">¡Tu pedido está listo!</h1>
            <p className="mt-2 text-lg text-foreground">Pasa a recogerlo 🎉</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle size={40} className="text-primary" />
            </div>
            <h1 className="font-display text-4xl text-foreground">¡Pedido enviado!</h1>
            <p className="mt-1 text-muted-foreground">Lo estamos preparando 🎉</p>
          </motion.div>
        )}

        {/* Order ID */}
        <div className="mb-8 rounded-2xl border border-border/40 bg-card/60 px-5 py-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Número de pedido</p>
          <p className="mt-1 font-display text-2xl text-primary">{order.id}</p>
          {order.tableNumber && (
            <p className="mt-1 text-sm text-muted-foreground">Mesa {order.tableNumber}</p>
          )}
        </div>

        {/* Progress steps */}
        <div className="mb-8 space-y-0">
          {steps.map((step, i) => {
            const isDone = currentIdx >= i;
            const isCurrent = currentIdx === i;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-4"
              >
                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                      isDone
                        ? "border-success bg-success text-success-foreground"
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    )}
                  >
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-8 w-0.5 transition-colors",
                        currentIdx > i ? "bg-success" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="text-left">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isDone ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && !isReady && (
                    <p className="text-xs text-primary animate-pulse">En curso...</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Items summary */}
        <div className="rounded-2xl border border-border/40 bg-card/60 px-5 py-4 text-left backdrop-blur-md">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Tu pedido</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border/30 py-1.5 last:border-0">
              <span className="text-sm text-foreground">
                {item.quantity}x {item.product.name}
              </span>
              <span className="text-sm font-semibold text-primary">${item.unitPrice * item.quantity}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">${order.total}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Volver al inicio
        </button>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
