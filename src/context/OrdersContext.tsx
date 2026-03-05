import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CartItem, OrderType } from "./CartContext";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "recibido" | "preparando" | "listo" | "entregado" | "cancelado";

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
  dbId?: string;
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
  cancelOrder: (id: string) => void;
  deleteOrder: (id: string) => void;
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
    extras: Array.isArray(it.extras)
      ? it.extras.map((e: any) => ({
        id: e.id || "",
        name: e.name || "",
        price: e.price || 0,
        category: "extras",
        active: true,
        soldOut: false,
      }))
      : [],
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
  const ordersRef = useRef<Order[]>([]);

  // Keep ref in sync to avoid stale closures
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Load today's orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

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

  // Realtime subscription with reconnection
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const row = payload.new as any;
          // Skip if already in state
          if (ordersRef.current.some((o) => o.dbId === row.id)) return;

          // Small delay to let order_items be inserted
          await new Promise((r) => setTimeout(r, 300));

          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", row.id);

          const newOrder = dbToOrder(row, itemsData || []);
          setOrders((prev) => {
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
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.old as any;
          if (row?.id) {
            setOrders((prev) => prev.filter((o) => o.dbId !== row.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime channel error, will auto-reconnect");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addOrder = useCallback(
    async (order: Omit<Order, "id" | "createdAt" | "status">): Promise<string> => {
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
          payment_method: order.paymentMethod || null,
        })
        .select()
        .single();

      if (error || !orderRow) {
        console.error("Error creating order:", error);
        throw new Error("No se pudo crear el pedido. Intenta de nuevo.");
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

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) {
        console.error("Error inserting items:", itemsError);
      }

      // Optimistic local add (realtime will deduplicate)
      const newOrder = dbToOrder(orderRow, itemsToInsert.map((it, i) => ({ ...it, id: `temp-${i}` })));
      setOrders((prev) => {
        if (prev.some((o) => o.dbId === orderRow.id)) return prev;
        return [newOrder, ...prev];
      });

      return orderRow.short_id;
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      // Use ref to avoid stale closure
      const order = ordersRef.current.find((o) => o.id === id);
      if (!order?.dbId) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        return;
      }

      // Optimistic update first
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.dbId);

      if (error) {
        console.error("Error updating order status:", error);
        // Revert on failure
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: order.status } : o)));
      }
    },
    []
  );

  const cancelOrder = useCallback(
    async (id: string) => {
      const order = ordersRef.current.find((o) => o.id === id);
      // Optimistic: remove from local state immediately
      setOrders((prev) => prev.filter((o) => o.id !== id));

      if (order?.dbId) {
        // Delete from Supabase (order_items cascade-deletes)
        const { error } = await supabase.from("orders").delete().eq("id", order.dbId);
        if (error) {
          console.error("Error deleting order:", error);
          // If delete fails, try updating status as fallback
          const { error: updateError } = await supabase.from("orders").update({ status: "cancelado" }).eq("id", order.dbId);
          if (updateError) {
            console.error("Fallback status update also failed:", updateError);
          }
          // Don't re-add, keep it removed from UI
        }
      }
    },
    []
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const order = ordersRef.current.find((o) => o.id === id);
      // Optimistic: remove from local state immediately
      setOrders((prev) => prev.filter((o) => o.id !== id));

      if (order?.dbId) {
        const { error } = await supabase.from("orders").delete().eq("id", order.dbId);
        if (error) {
          console.error("Error deleting order:", error);
        }
      }
    },
    []
  );

  const getOrder = useCallback(
    (id: string) => ordersRef.current.find((o) => o.id === id),
    []
  );

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, cancelOrder, deleteOrder, getOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
