import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import FloatingCart from "@/components/FloatingCart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber } = useCart();
  const { products, categories } = useProducts();
  const [activeCategory, setActiveCategory] = useState("dogos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const mesa = tableNumber || Number(searchParams.get("mesa")) || null;

  // Only show active products; soldOut ones show but greyed out
  const filtered = products.filter(
    (p) => p.category === activeCategory && p.active
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-secondary shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-display text-2xl tracking-wide text-accent">Rigo's</h1>
          {mesa && (
            <span className="rounded-lg bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
              Mesa {mesa}
            </span>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                activeCategory === cat.id
                  ? "bg-success text-success-foreground shadow-[0_2px_10px_-2px_hsl(123_46%_34%_/_0.5)]"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Product list */}
      <main className="space-y-2.5 px-4 pt-4">
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
          >
            <ProductCard product={product} onSelect={setSelectedProduct} />
          </motion.div>
        ))}
      </main>

      {/* Product detail sheet */}
      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Floating cart */}
      <FloatingCart />
    </div>
  );
};

export default Menu;
