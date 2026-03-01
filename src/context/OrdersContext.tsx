import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, OrderType } from "./CartContext";

export type OrderStatus = "recibido" | "preparando" | "listo" | "entregado";

export interface DeliveryDetails {
  type: "casa" | "departamento";
  street: string;
  colony: string;
  references: string;
  aptNumber?: string;
  floor?: string;
  hasControlledAccess: boolean;
  accessInstructions?: string;
  paymentMethod: "efectivo" | "transferencia";
  additionalNotes: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  orderType: OrderType;
  tableNumber: number | null;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryDetails?: DeliveryDetails;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback((order: Omit<Order, "id" | "createdAt" | "status">) => {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newOrder: Order = {
      ...order,
      id,
      status: "recibido",
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return id;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
