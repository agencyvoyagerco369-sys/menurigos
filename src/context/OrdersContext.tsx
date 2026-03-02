import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CartItem, OrderType } from "./CartContext";
import { supabase } from "@/integrations/supabase/client";

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
  dbId?: string; // uuid from DB
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
  paymentMethod?: string;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Promise<string>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Convert DB row + items to Order
const dbToOrder = (row: any, items: any[]): Order => ({
  id: row.short_id,
  dbId: row.id,
  items: items.map((it: any) => ({
    id: it.id,
    product: {
      id: it.product_id,
      name: it.product_name,
      price: it.product_price,
      category: "",
      active: true,
      soldOut: false,
    },
    extras: Array.isArray(it.extras) ? it.extras.map((e: any) => ({
      id: e.id || "",
      name: e.name || "",
      price: e.price || 0,
      category: "extras",
      active: true,
      soldOut: false,
    })) : [],
    notes: it.notes || "",
    quantity: it.quantity,
    unitPrice: Number(it.unit_price),
  })),
  orderType: row.order_type as OrderType,
  tableNumber: row.table_number,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  deliveryDetails: row.delivery_details as DeliveryDetails | undefined,
  total: Number(row.total),
  status: row.status as OrderStatus,
  createdAt: new Date(row.created_at),
  paymentMethod: row.payment_method,
});

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const loadedRef = useRef(false);

  // Load today's orders on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadOrders = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (!ordersData || ordersData.length === 0) return;

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ordersData.map((o) => o.id));

      const mapped = ordersData.map((o) =>
        dbToOrder(o, (itemsData || []).filter((it) => it.order_id === o.id))
      );
      setOrders(mapped);
    };

    loadOrders();
  }, []);

  // Realtime subscription for order changes
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const row = payload.new as any;
          // Load items for this new order
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", row.id);

          const newOrder = dbToOrder(row, itemsData || []);
          setOrders((prev) => {
            // Avoid duplicates
            if (prev.some((o) => o.dbId === row.id)) return prev;
            return [newOrder, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as any;
          setOrders((prev) =>
            prev.map((o) =>
              o.dbId === row.id
                ? { ...o, status: row.status as OrderStatus, paymentMethod: row.payment_method }
                : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, "id" | "createdAt" | "status">): Promise<string> => {
    // Insert order into DB
    const { data: orderRow, error } = await supabase
      .from("orders")
      .insert({
        order_type: order.orderType,
        table_number: order.tableNumber,
        customer_name: order.customerName || null,
        customer_phone: order.customerPhone || null,
        customer_address: order.customerAddress || null,
        delivery_details: order.deliveryDetails ? (order.deliveryDetails as any) : null,
        total: order.total,
        status: "recibido",
      })
      .select()
      .single();

    if (error || !orderRow) {
      console.error("Error creating order:", error);
      // Fallback to local
      const localId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const newOrder: Order = { ...order, id: localId, status: "recibido", createdAt: new Date() };
      setOrders((prev) => [newOrder, ...prev]);
      return localId;
    }

    // Insert items
    const itemsToInsert = order.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      extras: item.extras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
      notes: item.notes,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    await supabase.from("order_items").insert(itemsToInsert);

    // The realtime subscription will add it to state, but also add locally to be safe
    const newOrder = dbToOrder(orderRow, itemsToInsert.map((it, i) => ({ ...it, id: `temp-${i}` })));
    setOrders((prev) => {
      if (prev.some((o) => o.dbId === orderRow.id)) return prev;
      return [newOrder, ...prev];
    });

    return orderRow.short_id;
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    // Find order by short_id
    const order = orders.find((o) => o.id === id);
    if (!order?.dbId) {
      // Local-only fallback
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      return;
    }

    // Update in DB - realtime will propagate
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.dbId);

    // Optimistic local update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, [orders]);

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
