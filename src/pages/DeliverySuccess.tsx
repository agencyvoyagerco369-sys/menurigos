import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Clock, CreditCard, MessageCircle, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "526641234567"; // Replace with Rigo's actual number

const DeliverySuccess = () => {
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
          <button onClick={() => navigate("/")} className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const isReady = order.status === "listo" || order.status === "entregado";

  const address = order.customerAddress || "";
  const payment = order.deliveryDetails?.paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo";

  const whatsappMsg = encodeURIComponent(
    `Hola Rigo's 🌭, acabo de hacer un pedido a domicilio.\n\nFolio: ${order.id}\nTotal: $${order.total}\nDirección: ${address}\nPago: ${payment}\n\n¿Me pueden confirmar?`
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-brand" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(190_62%_32%_/_0.5)_0%,_transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-md px-5 py-8">
        {/* Success header */}
        {isReady ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-success/20 shadow-[0_0_40px_hsl(123_46%_34%_/_0.3)]">
              <PartyPopper size={48} className="text-success" />
            </div>
            <h1 className="font-display text-4xl text-accent">¡Tu pedido va en camino!</h1>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h1 className="font-display text-4xl text-foreground">¡Pedido confirmado!</h1>
            <p className="mt-1 text-muted-foreground">Lo estamos preparando 🎉</p>
          </motion.div>
        )}

        {/* Order ID card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 rounded-2xl border border-border/40 bg-card/60 p-5 text-center backdrop-blur-md"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Número de folio</p>
          <p className="mt-1 font-display text-3xl text-primary">{order.id}</p>
        </motion.div>

        {/* Estimated time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4"
        >
          <Clock size={24} className="shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">Tiempo estimado de entrega</p>
            <p className="text-xl font-bold text-primary">30 — 45 minutos</p>
          </div>
        </motion.div>

        {/* Progress tracker */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4 rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado del pedido</p>
          {(["recibido", "preparando", "listo"] as const).map((step, i) => {
            const labels = { recibido: "Recibido", preparando: "En preparación", listo: "¡Listo para entregar!" };
            const statusIdx = { recibido: 0, preparando: 1, listo: 2, entregado: 3 };
            const current = statusIdx[order.status];
            const isDone = current >= i;
            const isCurrent = current === i;
            return (
              <div key={step} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      isDone
                        ? "border-success bg-success text-success-foreground"
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={cn("h-5 w-0.5", current > i ? "bg-success" : "bg-muted-foreground/20")} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", isDone ? "text-foreground" : "text-muted-foreground")}>
                    {labels[step]}
                  </p>
                  {isCurrent && order.status !== "listo" && (
                    <p className="animate-pulse text-xs text-primary">En curso...</p>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen del pedido</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border/30 py-1.5 last:border-0">
              <span className="text-sm text-foreground">
                {item.quantity}x {item.product.name}
                {item.extras.length > 0 && (
                  <span className="text-xs text-muted-foreground"> + {item.extras.map((e) => e.name).join(", ")}</span>
                )}
              </span>
              <span className="text-sm font-semibold text-primary">${item.unitPrice * item.quantity}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">${order.total}</span>
          </div>
        </motion.div>

        {/* Delivery info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4 space-y-3 rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dirección de entrega</p>
              <p className="mt-0.5 text-sm text-foreground">{address}</p>
              {order.deliveryDetails?.references && (
                <p className="text-xs text-muted-foreground">Ref: {order.deliveryDetails.references}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Método de pago</p>
              <p className="mt-0.5 text-sm text-foreground">{payment}</p>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp button */}
        <motion.a
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-4 text-lg font-bold text-success-foreground shadow-[0_4px_24px_-4px_hsl(123_46%_34%_/_0.5)]"
        >
          <MessageCircle size={22} />
          Contactar por WhatsApp
        </motion.a>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default DeliverySuccess;
