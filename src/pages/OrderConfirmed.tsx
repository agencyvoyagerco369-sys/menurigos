import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const OrderConfirmed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm text-center"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
          <CheckCircle size={48} className="text-success" />
        </div>
        <h1 className="mb-2 font-display text-4xl text-foreground">¡Pedido Enviado!</h1>
        <p className="mb-8 text-muted-foreground">
          Tu pedido ha sido recibido y se está preparando. ¡Gracias por tu preferencia!
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-primary px-8 py-3 font-bold text-primary-foreground shadow-brand"
        >
          Volver al Inicio
        </button>
      </motion.div>
    </div>
  );
};

export default OrderConfirmed;
