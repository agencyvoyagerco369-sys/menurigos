import { useOrders, Order } from "@/context/OrdersContext";
import { cn } from "@/lib/utils";
import { Clock, ChefHat, CheckCircle, Truck, UtensilsCrossed, MapPin } from "lucide-react";

const statusConfig: Record<Order["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: { label: "Pendiente", color: "bg-accent text-accent-foreground", icon: <Clock size={16} /> },
  preparando: { label: "Preparando", color: "bg-primary text-primary-foreground", icon: <ChefHat size={16} /> },
  listo: { label: "Listo", color: "bg-success text-success-foreground", icon: <CheckCircle size={16} /> },
  entregado: { label: "Entregado", color: "bg-muted text-muted-foreground", icon: <Truck size={16} /> },
};

const nextStatus: Record<Order["status"], Order["status"] | null> = {
  pendiente: "preparando",
  preparando: "listo",
  listo: "entregado",
  entregado: null,
};

const Admin = () => {
  const { orders, updateOrderStatus } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="font-display text-3xl text-card-foreground">
          Rigo's Dogos — Panel de Pedidos
        </h1>
        <p className="text-sm text-muted-foreground">Gestión de pedidos en tiempo real</p>
      </header>

      <main className="p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ChefHat size={64} className="mb-4 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">No hay pedidos todavía</p>
            <p className="text-sm text-muted-foreground">
              Los pedidos aparecerán aquí cuando los clientes ordenen desde el menú
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const next = nextStatus[order.status];

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                      <p className="flex items-center gap-1 text-sm font-semibold text-card-foreground">
                        {order.orderType === "mesa" ? (
                          <>
                            <UtensilsCrossed size={14} /> Mesa {order.tableNumber}
                          </>
                        ) : (
                          <>
                            <MapPin size={14} /> Domicilio
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                        status.color
                      )}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Customer info for delivery */}
                  {order.orderType === "domicilio" && order.customerName && (
                    <div className="mb-3 rounded-lg bg-muted p-2 text-xs text-foreground">
                      <p className="font-semibold">{order.customerName}</p>
                      <p>{order.customerPhone}</p>
                      <p className="text-muted-foreground">{order.customerAddress}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-3 space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm text-foreground"
                      >
                        <span>
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="text-muted-foreground">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total & action */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-lg font-bold text-primary">${order.total}</span>
                    {next && (
                      <button
                        onClick={() => updateOrderStatus(order.id, next)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        → {statusConfig[next].label}
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-right text-xs text-muted-foreground">
                    {order.createdAt.toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
