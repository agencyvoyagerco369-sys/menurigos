import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { tables } from "@/data/products";
import { motion } from "framer-motion";
import { UtensilsCrossed, Truck, MapPin, ChefHat } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { setOrderType, setTableNumber } = useCart();
  const [showTablePicker, setShowTablePicker] = useState(false);

  const handleMesa = (tableId: number) => {
    setOrderType("mesa");
    setTableNumber(tableId);
    navigate(`/menu?type=mesa&mesa=${tableId}`);
  };

  const handleDomicilio = () => {
    setOrderType("domicilio");
    setTableNumber(null);
    navigate("/menu?type=domicilio");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-brand px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {/* Logo area */}
        <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-brand">
          <span className="text-5xl">🌭</span>
        </div>
        <h1 className="mb-1 font-display text-5xl text-gradient">Rigo's</h1>
        <h2 className="mb-1 font-display text-2xl tracking-wider text-foreground">
          Dogos y Hamburguesas
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">Desde 1996</p>

        {/* Options */}
        {!showTablePicker ? (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowTablePicker(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-brand transition-opacity hover:opacity-90"
            >
              <UtensilsCrossed size={22} />
              Pedir en Mesa
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDomicilio}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-destructive py-4 font-bold text-destructive-foreground transition-opacity hover:opacity-90"
            >
              <Truck size={22} />
              Pedir a Domicilio
            </motion.button>

            <button
              onClick={() => navigate("/admin")}
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChefHat size={16} />
              Panel de Control
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="mb-2 text-sm font-semibold text-foreground">Selecciona tu mesa:</p>
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table) => (
                <motion.button
                  key={table.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMesa(table.id)}
                  className="flex flex-col items-center gap-1 rounded-xl bg-card py-4 shadow-card transition-colors hover:bg-secondary"
                >
                  <MapPin size={20} className="text-primary" />
                  <span className="text-sm font-bold text-card-foreground">{table.name}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowTablePicker(false)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
