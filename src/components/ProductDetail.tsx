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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-auto rounded-t-3xl bg-background shadow-[0_-8px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-background pb-0 pt-3">
              <div className="h-1.5 w-12 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-8 pt-4">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>

              {/* Product image placeholder */}
              <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-[2rem] bg-secondary shadow-sm overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">
                    {product.category === "dogos" ? "🌭" : product.category === "botanas" ? "🍟" : product.category === "bebidas" ? "🥤" : product.category === "chiles" ? "🌶️" : "➕"}
                  </span>
                )}
              </div>

              {/* Name & price */}
              <h2 className="mb-2 text-center font-display text-4xl text-foreground">
                {product.name}
              </h2>
              <p className="mb-6 text-center text-2xl font-bold text-foreground">
                ${product.price}
              </p>

              {/* Extras */}
              {product.category !== "extras" && (
                <div className="mb-6">
                  <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
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
                            "flex w-full items-center justify-between rounded-[1rem] border-2 px-4 py-3 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-transparent bg-secondary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded bg-background border-2 transition-colors",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-border"
                              )}
                            >
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[15px] font-medium text-foreground">{extra.name}</span>
                          </div>
                          <span className="text-[15px] font-semibold text-foreground">+${extra.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                  Notas especiales
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: sin chile, extra cebolla..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border-2 border-transparent bg-secondary px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:bg-background focus:outline-none transition-colors"
                />
              </div>

              {/* Quantity */}
              <div className="mb-8 flex items-center justify-center gap-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95"
                >
                  <Minus size={20} />
                </button>
                <span className="w-8 text-center text-3xl font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Add to cart button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                className="w-full rounded-full bg-primary py-4 text-center text-[17px] font-bold text-primary-foreground shadow-brand"
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
