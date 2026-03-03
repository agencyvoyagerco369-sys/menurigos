import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import FloatingCart from "@/components/FloatingCart";
import MenuSkeleton from "@/components/MenuSkeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber } = useCart();
  const { products, categories } = useProducts();
  const [activeCategory, setActiveCategory] = useState("dogos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const mesa = tableNumber || Number(searchParams.get("mesa")) || null;

  // Simulate brief loading for skeleton
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = products.filter(
    (p) => p.category === activeCategory && p.active
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-client">
      {/* Sticky header - Estilo App Limpio */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 pb-2">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="font-display text-3xl tracking-wide text-primary">Rigo's</h1>
          {mesa && (
            <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-foreground">
              Mesa {mesa}
            </span>
          )}
        </div>

        {/* Category tabs - Píldoras deslizables */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm scale-100"
                  : "bg-secondary text-foreground scale-95 hover:bg-secondary/80"
              )}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Product list */}
      {loading ? (
        <MenuSkeleton />
      ) : (
        <main className="space-y-2.5 px-4 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                >
                  <ProductCard product={product} onSelect={setSelectedProduct} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <FloatingCart />
    </div>
  );
};

export default Menu;
