import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FloatingCart = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart, orderType, tableNumber } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSendOrder = async () => {
    if (items.length === 0) return;

    // If delivery, go to checkout page instead of sending directly
    if (orderType === "domicilio") {
      setOpen(false);
      navigate("/checkout-domicilio");
      return;
    }

    const orderId = await addOrder({
      items: [...items],
      orderType: orderType || "mesa",
      tableNumber,
      total,
    });
    clearCart();
    setOpen(false);
    toast.success("¡Pedido enviado a cocina! 🍳");
    navigate(`/pedido/${orderId}`);
  };

  const isDelivery = orderType === "domicilio";

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {itemCount > 0 && !open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-brand"
          >
            <ShoppingCart size={26} className="text-primary-foreground" />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background border-2 border-background">
              {itemCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-auto rounded-t-3xl bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Handle */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-card px-5 pb-3 pt-4">
                <div>
                  <h2 className="font-display text-2xl text-card-foreground">Tu Pedido</h2>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 pb-8">
                {items.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">Tu carrito está vacío</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border bg-muted/50 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {item.product.name}
                              </p>
                              {item.extras.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  + {item.extras.map((e) => e.name).join(", ")}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs italic text-muted-foreground">"{item.notes}"</p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                ${item.unitPrice} c/u
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 text-destructive/70 hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-primary">
                              ${item.unitPrice * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">${total}</span>
                    </div>

                    {/* Send order */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSendOrder}
                      className="mt-4 w-full rounded-full bg-primary py-4 text-center text-[17px] font-bold text-primary-foreground shadow-brand"
                    >
                      {isDelivery ? "Continuar al envío 🛵" : "Enviar pedido a cocina 🍳"}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
