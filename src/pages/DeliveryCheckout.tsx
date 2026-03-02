import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useOrders, DeliveryDetails } from "@/context/OrdersContext";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Building2, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BANK_INFO = {
  bank: "BBVA",
  name: "Rigoberto Hernández",
  clabe: "012345678901234567",
  card: "4152 3138 0012 3456",
};

const DeliveryCheckout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { addOrder } = useOrders();

  // Address
  const [addressType, setAddressType] = useState<"casa" | "departamento" | null>(null);
  const [street, setStreet] = useState("");
  const [colony, setColony] = useState("");
  const [references, setReferences] = useState("");
  const [aptNumber, setAptNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [hasControlledAccess, setHasControlledAccess] = useState(false);
  const [accessInstructions, setAccessInstructions] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia" | null>(null);
  const [copied, setCopied] = useState(false);

  // Notes
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!addressType) errs.push("Selecciona tipo de domicilio");
    if (!street.trim()) errs.push("Ingresa la calle y número");
    if (street.trim().length > 200) errs.push("La calle es demasiado larga (máx. 200 caracteres)");
    if (!colony.trim()) errs.push("Ingresa la colonia");
    if (colony.trim().length > 100) errs.push("La colonia es demasiado larga (máx. 100 caracteres)");
    if (addressType === "departamento" && !aptNumber.trim()) errs.push("Ingresa el número de departamento");
    if (hasControlledAccess && !accessInstructions.trim()) errs.push("Ingresa las instrucciones de acceso");
    if (!paymentMethod) errs.push("Selecciona método de pago");
    if (items.length === 0) errs.push("Tu carrito está vacío");
    return errs;
  };

  const handleConfirm = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      toast.error(errs[0]);
      return;
    }
    setErrors([]);

    const deliveryDetails: DeliveryDetails = {
      type: addressType!,
      street: street.trim(),
      colony: colony.trim(),
      references: references.trim(),
      aptNumber: addressType === "departamento" ? aptNumber.trim() : undefined,
      floor: addressType === "departamento" && floor.trim() ? floor.trim() : undefined,
      hasControlledAccess,
      accessInstructions: hasControlledAccess ? accessInstructions.trim() : undefined,
      paymentMethod: paymentMethod!,
      additionalNotes: additionalNotes.trim(),
    };

    const fullAddress = [
      street.trim(),
      addressType === "departamento" ? `Depto ${aptNumber.trim()}${floor.trim() ? `, Piso ${floor.trim()}` : ""}` : "",
      `Col. ${colony.trim()}`,
    ].filter(Boolean).join(", ");

    const orderId = await addOrder({
      items: [...items],
      orderType: "domicilio",
      tableNumber: null,
      customerAddress: fullAddress,
      deliveryDetails,
      total,
    });

    clearCart();
    navigate(`/pedido-domicilio/${orderId}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    navigate("/menu?type=domicilio");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-secondary px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-display text-2xl tracking-wide text-accent">Datos de Envío</h1>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-6 px-4 pt-5">
        {/* STEP 1: Address type */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="mb-3 font-display text-xl text-foreground">¿Dónde entregamos?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAddressType("casa")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all",
                addressType === "casa"
                  ? "border-primary bg-primary/10 shadow-brand"
                  : "border-border bg-card"
              )}
            >
              <Home size={28} className={addressType === "casa" ? "text-primary" : "text-muted-foreground"} />
              <span className="text-2xl">🏠</span>
              <span className={cn("text-sm font-bold", addressType === "casa" ? "text-primary" : "text-card-foreground")}>Casa</span>
            </button>
            <button
              onClick={() => setAddressType("departamento")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all",
                addressType === "departamento"
                  ? "border-primary bg-primary/10 shadow-brand"
                  : "border-border bg-card"
              )}
            >
              <Building2 size={28} className={addressType === "departamento" ? "text-primary" : "text-muted-foreground"} />
              <span className="text-2xl">🏢</span>
              <span className={cn("text-sm font-bold", addressType === "departamento" ? "text-primary" : "text-card-foreground")}>Departamento</span>
            </button>
          </div>
        </motion.section>

        {/* STEP 2: Address fields */}
        {addressType && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Input label="Calle y número *" value={street} onChange={setStreet} placeholder="Av. Reforma #123" maxLength={200} />

            {addressType === "departamento" && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="No. de Depto *" value={aptNumber} onChange={setAptNumber} placeholder="4B" maxLength={20} />
                <Input label="Piso (opcional)" value={floor} onChange={setFloor} placeholder="3" maxLength={10} />
              </div>
            )}

            <Input label="Colonia *" value={colony} onChange={setColony} placeholder="Centro" maxLength={100} />
            <Input
              label={addressType === "departamento" ? "Referencias del edificio" : "Referencias (opcional)"}
              value={references}
              onChange={setReferences}
              placeholder="Casa azul, cerca del OXXO"
              maxLength={200}
            />

            {/* Controlled access toggle */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    ¿Acceso controlado, interfón o caseta?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actívalo si necesitas dar instrucciones para entrar
                  </p>
                </div>
                <button
                  onClick={() => setHasControlledAccess(!hasControlledAccess)}
                  className={cn(
                    "relative h-7 w-12 rounded-full transition-colors",
                    hasControlledAccess ? "bg-success" : "bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-foreground shadow transition-transform",
                      hasControlledAccess ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              {hasControlledAccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                  <Input
                    label="Nombre en interfón o instrucciones *"
                    value={accessInstructions}
                    onChange={setAccessInstructions}
                    placeholder="Nombre: García, tocar 2 veces"
                    maxLength={200}
                  />
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* STEP 3: Payment */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-3 font-display text-xl text-foreground">¿Cómo vas a pagar?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("efectivo")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all",
                paymentMethod === "efectivo"
                  ? "border-success bg-success/10"
                  : "border-border bg-card"
              )}
            >
              <span className="text-3xl">💵</span>
              <span className={cn("text-sm font-bold", paymentMethod === "efectivo" ? "text-success" : "text-card-foreground")}>Efectivo</span>
            </button>
            <button
              onClick={() => setPaymentMethod("transferencia")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all",
                paymentMethod === "transferencia"
                  ? "border-success bg-success/10"
                  : "border-border bg-card"
              )}
            >
              <span className="text-3xl">🏦</span>
              <span className={cn("text-sm font-bold", paymentMethod === "transferencia" ? "text-success" : "text-card-foreground")}>Transferencia</span>
            </button>
          </div>

          {paymentMethod === "transferencia" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
            >
              <p className="mb-3 text-sm font-semibold text-foreground">Datos para transferencia:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium text-foreground">{BANK_INFO.bank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Titular:</span>
                  <span className="font-medium text-foreground">{BANK_INFO.name}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">CLABE:</span>
                  <span className="font-mono text-xs font-medium text-foreground">{BANK_INFO.clabe}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tarjeta:</span>
                  <span className="font-mono text-xs font-medium text-foreground">{BANK_INFO.card}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(`CLABE: ${BANK_INFO.clabe}\nTarjeta: ${BANK_INFO.card}\nTitular: ${BANK_INFO.name}\nBanco: ${BANK_INFO.bank}`)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "¡Copiado!" : "Copiar datos bancarios"}
              </button>
            </motion.div>
          )}
        </motion.section>

        {/* STEP 4: Additional notes */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="mb-3 font-display text-xl text-foreground">Notas adicionales</h2>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Instrucciones especiales para el repartidor..."
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </motion.section>

        {/* Order summary */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <h2 className="mb-3 font-display text-xl text-card-foreground">Resumen del pedido</h2>
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}x {item.product.name}
                  {item.extras.length > 0 && (
                    <span className="text-muted-foreground"> + {item.extras.map((e) => e.name).join(", ")}</span>
                  )}
                </span>
                <span className="font-medium text-foreground">${item.unitPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">${total}</span>
          </div>
        </motion.section>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <p className="mb-1 text-sm font-semibold text-destructive">Revisa lo siguiente:</p>
            <ul className="space-y-0.5">
              {errors.map((err, i) => (
                <li key={i} className="text-xs text-destructive">• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full rounded-2xl bg-success py-5 text-center text-xl font-bold text-success-foreground shadow-[0_6px_28px_-4px_hsl(123_46%_34%_/_0.5)]"
        >
          Confirmar pedido 🛵
        </motion.button>
      </div>
    </div>
  );
};

// Reusable input component
const Input = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
}) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
    />
  </div>
);

export default DeliveryCheckout;
