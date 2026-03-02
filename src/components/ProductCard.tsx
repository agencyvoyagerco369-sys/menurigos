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
      {/* Placeholder image */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary">
        <span className="text-2xl">{categoryEmoji[product.category] || "🍽️"}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-card-foreground">{product.name}</p>
        {isAvailable ? (
          <p className="text-lg font-extrabold text-destructive">${product.price}</p>
        ) : (
          <p className="text-xs font-semibold text-muted-foreground">No disponible</p>
        )}
      </div>

      {/* Add button */}
      {isAvailable && (
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground transition-transform",
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
