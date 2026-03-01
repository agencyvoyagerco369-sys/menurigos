import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { products } from "@/data/products";
import CategoryTabs from "@/components/CategoryTabs";
import MenuItemCard from "@/components/MenuItemCard";
import CartDrawer from "@/components/CartDrawer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, total, orderType, tableNumber, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [activeCategory, setActiveCategory] = useState("dogos");
  const [search, setSearch] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const type = orderType || (searchParams.get("type") as "mesa" | "domicilio") || "mesa";
  const mesa = tableNumber || Number(searchParams.get("mesa")) || null;

  const filtered = products.filter(
    (p) =>
      p.active &&
      p.category === activeCategory &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Agrega productos a tu pedido");
      return;
    }
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    if (type === "domicilio" && (!customerName || !customerPhone || !customerAddress)) {
      toast.error("Completa tus datos de envío");
      return;
    }
    addOrder({
      items: [...items],
      orderType: type,
      tableNumber: mesa,
      customerName,
      customerPhone,
      customerAddress,
      total,
    });
    clearCart();
    setShowCheckout(false);
    toast.success("¡Pedido enviado! 🎉");
    navigate("/pedido-confirmado");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-brand px-4 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-2xl leading-none text-foreground">
              Rigo's Dogos
            </h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {type === "mesa" ? (
                <>
                  <UtensilsCrossed size={12} /> Mesa {mesa}
                </>
              ) : (
                <>
                  <MapPin size={12} /> Pedido a domicilio
                </>
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Categories */}
        <div className="mt-3">
          <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      </header>

      {/* Products */}
      <main className="space-y-2 px-4 pt-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No se encontraron productos</p>
        ) : (
          filtered.map((product) => <MenuItemCard key={product.id} product={product} />)
        )}
      </main>

      {/* Cart floating button */}
      <CartDrawer onCheckout={handleCheckout} />

      {/* Checkout modal */}
      {showCheckout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="w-full max-w-md rounded-t-2xl bg-card p-6 shadow-card sm:rounded-2xl"
          >
            <h2 className="mb-4 font-display text-2xl text-card-foreground">Confirmar Pedido</h2>

            {type === "mesa" && (
              <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-foreground">
                <UtensilsCrossed size={14} className="mr-1 inline" />
                Pedido para <strong>Mesa {mesa}</strong> · Total: <strong>${total}</strong>
              </p>
            )}

            {type === "domicilio" && (
              <div className="mb-4 space-y-3">
                <input
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Teléfono"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Dirección de entrega"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-right text-sm font-bold text-primary">Total: ${total}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 rounded-lg bg-muted py-3 font-semibold text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 rounded-lg bg-success py-3 font-bold text-success-foreground"
              >
                Enviar Pedido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
