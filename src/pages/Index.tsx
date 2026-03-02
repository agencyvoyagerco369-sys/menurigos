import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { tables } from "@/data/products";
import { motion } from "framer-motion";
import { UtensilsCrossed, Truck } from "lucide-react";
import { useState } from "react";
import logoRigos from "@/assets/logo-rigos.png";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-brand" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(190_62%_27%_/_0.4)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(38_91%_55%_/_0.06)_0%,_transparent_60%)]" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xs text-center"
      >
        {/* Logo with glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto mb-10"
        >
          <div className="absolute inset-0 mx-auto h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <img
            src={logoRigos}
            alt="Rigo's Dogos y Hamburguesas"
            className="relative mx-auto h-48 w-48 drop-shadow-[0_8px_30px_rgba(245,166,35,0.3)]"
          />
        </motion.div>

        {/* Options */}
        {!showTablePicker ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowTablePicker(true)}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-[0_4px_24px_-4px_hsl(38_91%_55%_/_0.5)] transition-all hover:shadow-[0_6px_32px_-4px_hsl(38_91%_55%_/_0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <UtensilsCrossed size={22} className="relative" />
              <span className="relative">Pedir en Mesa</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDomicilio}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-destructive py-4 text-lg font-bold text-destructive-foreground shadow-[0_4px_24px_-4px_hsl(0_76%_45%_/_0.4)] transition-all hover:shadow-[0_6px_32px_-4px_hsl(0_76%_45%_/_0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <Truck size={22} className="relative" />
              <span className="relative">Pedir a Domicilio</span>
            </motion.button>

          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="mb-3 font-display text-xl tracking-wide text-foreground">
              Selecciona tu mesa
            </p>
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table, i) => (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMesa(table.id)}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 bg-card/80 py-5 shadow-card backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-[0_4px_20px_-4px_hsl(38_91%_55%_/_0.2)]"
                >
                  <span className="text-2xl font-bold text-primary transition-transform group-hover:scale-110">
                    {table.id}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{table.name}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowTablePicker(false)}
              className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
