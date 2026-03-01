import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  product: Product;
}

const MenuItemCard = ({ product }: MenuItemCardProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-3 rounded-lg bg-card p-3 shadow-card"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">{product.name}</p>
        <p className="text-base font-bold text-primary">${product.price}</p>
      </div>
      <div className="flex items-center gap-2">
        {qty > 0 ? (
          <>
            <button
              onClick={() => updateQuantity(product.id, qty - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-foreground">{qty}</span>
          </>
        ) : null}
        <button
          onClick={() => addItem(product)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90"
        >
          <Plus size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
