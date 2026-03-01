import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { tables } from "@/data/products";
import { motion } from "framer-motion";
import logoRigos from "@/assets/logo-rigos.png";

const MesaLanding = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const { setOrderType, setTableNumber } = useCart();
  const tableNum = Number(mesaId);
  const table = tables.find((t) => t.id === tableNum);

  const handleVerMenu = () => {
    setOrderType("mesa");
    setTableNumber(tableNum);
    navigate(`/menu?type=mesa&mesa=${tableNum}`);
  };

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary-foreground">Mesa no encontrada</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_hsl(190_62%_32%_/_0.5)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(190_40%_10%_/_0.8)_0%,_transparent_70%)]" />

      {/* Subtle decorative circles */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 mx-auto h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
          <img
            src={logoRigos}
            alt="Rigo's"
            className="relative mx-auto h-28 w-28 drop-shadow-[0_4px_20px_rgba(245,166,35,0.25)]"
          />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-1 text-center font-display text-6xl leading-none tracking-wide text-accent drop-shadow-[0_2px_12px_rgba(245,194,0,0.3)]"
        >
          Rigo's
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-10 text-center text-base font-medium tracking-widest text-secondary-foreground/80"
        >
          Dogos y Hamburguesas
        </motion.p>

        {/* Mesa card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mb-10 w-full rounded-3xl border border-border/40 bg-card/60 px-6 py-8 text-center shadow-[0_8px_40px_-8px_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Bienvenido a
          </p>
          <div className="my-3 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <span className="font-display text-5xl text-primary">
              Mesa {tableNum}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tu pedido será enviado directamente a esta mesa
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleVerMenu}
          className="w-full rounded-2xl bg-success py-5 text-center text-xl font-bold text-success-foreground shadow-[0_6px_28px_-4px_hsl(123_46%_34%_/_0.5)] transition-shadow hover:shadow-[0_8px_36px_-4px_hsl(123_46%_34%_/_0.6)]"
        >
          Ver el menú 🌭
        </motion.button>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-muted-foreground/60"
        >
          Desde 1996 · Sonora, México
        </motion.p>
      </div>
    </div>
  );
};

export default MesaLanding;
