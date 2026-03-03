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
import { Search, ShoppingBag, Home, MapPin, Heart, ShoppingCart, User } from "lucide-react";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber, items } = useCart();
  const { products, categories } = useProducts();
  const [activeCategory, setActiveCategory] = useState("dogos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const mesa = tableNumber || Number(searchParams.get("mesa")) || null;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  // Simulate brief loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = products.filter((p) => p.category === activeCategory && p.active);
  // Just grab some best sellers explicitly
  const bestSellers = products.filter((p) => p.active).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-client selection:bg-[#E25822]/20">
      {/* Header Section (Yellow curve) */}
      <header className="relative bg-[#FDC02A] rounded-b-[2.5rem] pt-6 pb-6 shadow-sm">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-5 gap-3">
          <div className="flex-1 flex items-center bg-white/40 rounded-full px-4 py-2">
            <Search size={18} className="text-[#A07B18]" />
            <span className="ml-2 text-sm text-[#A07B18] font-medium">Buscar...</span>
          </div>
          <button
            onClick={() => window.dispatchEvent(new Event("open-cart"))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 text-[#A07B18] relative"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E25822] text-[9px] font-bold text-white border border-white">{itemCount}</span>}
          </button>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 text-[#A07B18]">
            <User size={20} />
          </button>
        </div>

        {/* Greeting */}
        <div className="px-5 mt-5">
          <h1 className="text-3xl font-extrabold text-[#7D5A11]">¡Buen día!</h1>
          <p className="text-[#A07B18] text-sm font-semibold mt-0.5 tracking-wide">
            {mesa ? `Mesa ${mesa} · ` : ""}¿Qué se te antoja hoy?
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex gap-4 overflow-x-auto mt-6 px-5 pb-2 hide-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center min-w-[70px] transition-all duration-300",
                  isActive ? "bg-[#E25822] rounded-full p-1.5 pt-1.5 pb-4 shadow-md -translate-y-1" : "p-1.5 pt-1.5 translate-y-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 justify-center items-center rounded-full text-2xl transition-all duration-300",
                    isActive ? "bg-white shadow-sm scale-100" : "bg-white/30 text-[#E25822] scale-95"
                  )}
                >
                  {cat.icon}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[11px] font-bold tracking-wide transition-colors duration-300 uppercase",
                    isActive ? "text-white" : "text-[#B88E1D]"
                  )}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {loading ? (
        <MenuSkeleton />
      ) : (
        <main className="pt-2">
          {/* Best Seller Horizontal */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-lg font-extrabold text-gray-800">Populares</h2>
              <button className="text-sm font-bold text-[#E25822]">Ver todo &gt;</button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-5 pb-4 hide-scrollbar">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} variant="small" />
              ))}
            </div>
          </div>

          {/* Banner Promo */}
          <div className="mx-5 mb-5 mt-2 overflow-hidden rounded-2xl bg-[#E25822] text-white shadow-md relative">
            <div className="p-5 flex flex-col justify-center relative z-10 w-2/3">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">Promo Especial</p>
              <h3 className="text-2xl font-extrabold leading-tight">30% OFF</h3>
              <p className="text-xs mt-1 font-medium opacity-80 leading-snug">Disfruta de nuestro delicioso nuevo plato.</p>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-black/10 blur-md"></div>
            {/* Si hubiera una imagen de promo, pondríamos la URL aquí */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10"></div>
          </div>

          {/* Categorized Products (Recommend) */}
          <div className="px-5">
            <h2 className="text-lg font-extrabold text-gray-800 mb-3 capitalize">{activeCategory}</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-4 pb-8"
              >
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                  >
                    <ProductCard product={product} onSelect={setSelectedProduct} variant="large" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#E25822] rounded-t-[1.75rem] shadow-[0_-10px_30px_rgba(226,88,34,0.3)] px-6 py-4 flex items-center justify-between text-white/70">
        <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform text-white">
          <Home size={22} strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform hover:text-white">
          <MapPin size={22} strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform hover:text-white">
          <Heart size={22} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => window.dispatchEvent(new Event("open-cart"))}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform hover:text-white relative"
        >
          <ShoppingCart size={22} strokeWidth={2.5} />
          {itemCount > 0 && <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#E25822] shadow-sm">{itemCount}</span>}
        </button>
        <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform hover:text-white">
          <User size={22} strokeWidth={2.5} />
        </button>
      </div>

      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <FloatingCart />
    </div>
  );
};

export default Menu;
