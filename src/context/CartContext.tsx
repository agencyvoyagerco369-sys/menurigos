import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  id: string; // unique per cart entry (product + extras combo)
  product: Product;
  extras: Product[];
  notes: string;
  quantity: number;
  unitPrice: number; // product.price + sum of extras
}

export type OrderType = "mesa" | "domicilio";

interface CartContextType {
  items: CartItem[];
  orderType: OrderType | null;
  tableNumber: number | null;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (num: number | null) => void;
  addItem: (product: Product, extras: Product[], notes: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const addItem = useCallback(
    (product: Product, extras: Product[], notes: string, quantity: number) => {
      const extrasTotal = extras.reduce((s, e) => s + e.price, 0);
      const unitPrice = product.price + extrasTotal;
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        extras,
        notes,
        quantity,
        unitPrice,
      };
      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items, orderType, tableNumber,
        setOrderType, setTableNumber,
        addItem, removeItem, updateQuantity, clearCart,
        total, itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
