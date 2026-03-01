import { useState, useMemo } from "react";
import { Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

const extras = products.filter((p) => p.category === "extras" && p.active);

const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
  const { addItem } = useCart();
  const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const toggleExtra = (extra: Product) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
    return (product.price + extrasTotal) * quantity;
  }, [product, selectedExtras, quantity]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, selectedExtras, notes, quantity);
    onClose();
    // Reset state
    setSelectedExtras([]);
    setNotes("");
    setQuantity(1);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-auto rounded-t-3xl bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-card pb-0 pt-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-8 pt-4">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>

              {/* Product image placeholder */}
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-2xl bg-secondary">
                <span className="text-6xl">
                  {product.category === "dogos" ? "🌭" : product.category === "botanas" ? "🍟" : product.category === "bebidas" ? "🥤" : product.category === "chiles" ? "🌶️" : "➕"}
                </span>
              </div>

              {/* Name & price */}
              <h2 className="mb-1 text-center font-display text-3xl text-card-foreground">
                {product.name}
              </h2>
              <p className="mb-6 text-center text-xl font-bold text-destructive">
                ${product.price}
              </p>

              {/* Extras */}
              {product.category !== "extras" && (
                <div className="mb-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Agregar extras
                  </h3>
                  <div className="space-y-2">
                    {extras.map((extra) => {
                      const isSelected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all",
                            isSelected
                              ? "border-success bg-success/10"
                              : "border-border bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                                isSelected
                                  ? "border-success bg-success"
                                  : "border-muted-foreground/40"
                              )}
                            >
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-foreground">{extra.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-primary">+${extra.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Notas especiales
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: sin chile, extra queso..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Quantity */}
              <div className="mb-6 flex items-center justify-center gap-5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-muted/80"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center text-2xl font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-muted/80"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to cart button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                className="w-full rounded-2xl bg-success py-4 text-center text-lg font-bold text-success-foreground shadow-[0_4px_20px_-4px_hsl(123_46%_34%_/_0.5)]"
              >
                Agregar al carrito — ${totalPrice}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetail;
