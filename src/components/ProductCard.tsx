import { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

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
  const isAvailable = product.active;

  return (
    <button
      onClick={() => isAvailable && onSelect(product)}
      disabled={!isAvailable}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card transition-transform active:scale-[0.98]",
        !isAvailable && "pointer-events-none opacity-40"
      )}
    >
      {/* Placeholder image */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary">
        <span className="text-2xl">{categoryEmoji[product.category] || "🍽️"}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-card-foreground">{product.name}</p>
        {isAvailable ? (
          <p className="text-base font-bold text-destructive">${product.price}</p>
        ) : (
          <p className="text-xs font-medium text-muted-foreground">No disponible</p>
        )}
      </div>

      {/* Add button */}
      {isAvailable && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <Plus size={18} strokeWidth={3} />
        </div>
      )}
    </button>
  );
};

export default ProductCard;
