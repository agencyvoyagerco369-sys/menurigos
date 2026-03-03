import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { tables } from "@/data/products";
import { motion } from "framer-motion";
import { UtensilsCrossed, Truck, ChevronRight } from "lucide-react";
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
    <div className="relative flex min-h-screen flex-col items-center bg-background px-4 py-8 overflow-hidden font-body">
      {/* Fondo ultra limpio con un círculo de color sutil detrás para destacar */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[40%] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md flex flex-col h-full flex-grow justify-between"
      >
        {/* Header / Logo Área (Estilo limpio App) */}
        <div className="flex flex-col items-center mt-12 mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 mx-auto rounded-full bg-primary/10 blur-2xl" />
            <img
              src={logoRigos}
              alt="Rigo's"
              className="relative mx-auto h-36 w-36 object-contain drop-shadow-[0_8px_16px_rgba(245,166,35,0.2)]"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="mt-6 text-3xl font-display text-foreground tracking-wide text-center"
          >
            ¿Cómo pedirás hoy?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-center mt-2 font-medium"
          >
            Selecciona tu método de entrega favorito
          </motion.p>
        </div>

        {/* Options / Action Cards */}
        <div className="flex-grow flex flex-col justify-end pb-8">
          {!showTablePicker ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={handleDomicilio}
                className="w-full group flex items-center justify-between bg-card border border-border/50 p-5 rounded-3xl shadow-card transition-all active:scale-[0.98] hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Truck size={24} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-lg text-foreground">A Domicilio</h2>
                    <p className="text-sm text-muted-foreground">Te lo llevamos a donde estés</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={() => setShowTablePicker(true)}
                className="w-full group flex items-center justify-between bg-card border border-border/50 p-5 rounded-3xl shadow-card transition-all active:scale-[0.98] hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-white transition-colors">
                    <UtensilsCrossed size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-lg text-foreground">En el Local</h2>
                    <p className="text-sm text-muted-foreground">Pide desde tu mesa</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </button>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 p-6 rounded-[2rem] shadow-card mt-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-foreground">
                  Selecciona tu mesa
                </h3>
                <button
                  onClick={() => setShowTablePicker(false)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto hide-scrollbar p-1 pb-4">
                {tables.map((table, i) => (
                  <motion.button
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleMesa(table.id)}
                    className="flex flex-col items-center justify-center aspect-square gap-1 rounded-2xl border-2 border-transparent bg-secondary/50 py-3 transition-all active:scale-95 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="text-2xl font-bold text-foreground">
                      {table.id}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{table.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
