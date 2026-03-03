import { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  variant?: "small" | "large";
}

const categoryEmoji: Record<string, string> = {
  dogos: "🌭",
  botanas: "🍟",
  bebidas: "🥤",
  chiles: "🌶️",
  extras: "➕",
};

const ProductCard = ({ product, onSelect, variant = "large" }: ProductCardProps) => {
  const isAvailable = product.active && !product.soldOut;
  const [popping, setPopping] = useState(false);

  const handleClick = () => {
    if (!isAvailable) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
    onSelect(product);
  };

  if (variant === "small") {
    // Best Seller style card (Compacto / Horizontal scroller)
    return (
      <button
        onClick={handleClick}
        disabled={!isAvailable}
        className={cn(
          "flex flex-col w-[140px] shrink-0 rounded-[1.25rem] bg-white p-2.5 shadow-sm text-left transition-transform active:scale-95 font-client",
          !isAvailable && "opacity-50"
        )}
      >
        <div className="h-28 w-full rounded-2xl bg-[#F5F5F5] overflow-hidden flex items-center justify-center mb-2.5">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{categoryEmoji[product.category] || "🍽️"}</span>
          )}
        </div>
        <p className="px-1 truncate text-sm font-extrabold text-[#2D2D2D] w-full">{product.name}</p>
        <div className="flex items-center justify-between w-full px-1 mt-1.5">
          <p className="text-[#E25822] font-bold text-sm">${product.price}</p>
          {isAvailable && (
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-[#E25822] text-white", popping && "animate-pop")}>
              <Plus size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      </button>
    );
  }

  // Large Recommend style card (Recomendados Grid)
  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "flex flex-col w-full rounded-[1.5rem] bg-white p-3 shadow-sm text-left transition-transform active:scale-[0.98] font-client",
        !isAvailable && "opacity-50"
      )}
    >
      <div className="h-36 w-full rounded-[1.25rem] bg-[#F5F5F5] overflow-hidden flex items-center justify-center mb-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{categoryEmoji[product.category] || "🍽️"}</span>
        )}
      </div>
      <p className="px-1 truncate text-[15px] font-extrabold text-[#2D2D2D] w-full">{product.name}</p>
      {product.description && (
        <p className="px-1 text-xs text-[#8A8A8A] line-clamp-2 mt-0.5 leading-snug font-medium">{product.description}</p>
      )}
      <div className="flex items-center justify-between w-full px-1 mt-3.5">
        <p className="text-[#E25822] font-extrabold text-[17px]">${product.price}</p>
        {isAvailable ? (
          <div className={cn("px-3.5 py-1.5 rounded-full bg-[#E25822] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm", popping && "animate-pop")}>
            <Plus size={14} strokeWidth={3} /> Agregar
          </div>
        ) : (
          <p className="text-xs font-semibold text-[#8A8A8A]">Agotado</p>
        )}
      </div>
    </button>
  );
};

export default ProductCard;
