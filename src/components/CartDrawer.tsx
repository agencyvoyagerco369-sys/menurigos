import { useCart } from "@/context/CartContext";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer = ({ onCheckout }: CartDrawerProps) => {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating cart button */}
      {itemCount > 0 && !open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-brand"
        >
          <ShoppingCart size={20} />
          <span>{itemCount}</span>
          <span className="mx-1">·</span>
          <span>${total}</span>
        </motion.button>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-auto rounded-t-2xl bg-card p-5 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl text-card-foreground">Tu Pedido</h2>
                <button onClick={() => setOpen(false)} className="text-muted-foreground">
                  <X size={24} />
                </button>
              </div>

              {items.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Tu carrito está vacío</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.product.price} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-1 text-destructive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="ml-3 text-sm font-bold text-primary">
                        ${item.product.price * item.quantity}
                      </p>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">${total}</span>
                  </div>

                  <button
                    onClick={() => {
                      setOpen(false);
                      onCheckout();
                    }}
                    className="w-full rounded-lg bg-success py-3 text-center font-bold text-success-foreground transition-opacity hover:opacity-90"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
