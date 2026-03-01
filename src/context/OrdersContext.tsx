import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, OrderType } from "./CartContext";

export interface Order {
  id: string;
  items: CartItem[];
  orderType: OrderType;
  tableNumber: number | null;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
  status: "pendiente" | "preparando" | "listo" | "entregado";
  createdAt: Date;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback((order: Omit<Order, "id" | "createdAt" | "status">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      status: "pendiente",
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
