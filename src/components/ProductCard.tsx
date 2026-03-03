import { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const categoryEmoji: Record<string, string> = {
  dogos: "🌭",
  botanas: "🍟",
  bebidas: "🥤",
  chiles: "🌶️",
  extras: "➕",
};

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const isAvailable = product.active && !product.soldOut;
  const [popping, setPopping] = useState(false);

  const handleClick = () => {
    if (!isAvailable) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
    onSelect(product);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card transition-transform active:scale-[0.97] font-client",
        !isAvailable && "pointer-events-none opacity-40"
      )}
    >
      {/* Placeholder image (Emoji or Real Image later) */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{categoryEmoji[product.category] || "🍽️"}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 py-1 flex flex-col justify-between">
        <div>
          <p className="truncate text-base font-bold text-foreground">{product.name}</p>
          {/* Si hubiera descripción se pone aquí */}
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{product.description}</p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          {isAvailable ? (
            <p className="text-lg font-bold text-foreground">${product.price}</p>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">Agotado</p>
          )}
        </div>
      </div>

      {/* Add button - absolute for tight layouts or flex for standard */}
      {isAvailable && (
        <div
          className={cn(
            "self-end flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform",
            popping && "animate-pop"
          )}
        >
          <Plus size={20} strokeWidth={3} />
        </div>
      )}
    </button>
  );
};

export default ProductCard;
