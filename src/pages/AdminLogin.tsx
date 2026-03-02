import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import logoRigos from "@/assets/logo-rigos.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (error) {
        toast.error("Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Check admin/staff role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      const hasAccess = roles?.some((r) => r.role === "admin" || r.role === "staff");

      if (!hasAccess) {
        await supabase.auth.signOut();
        toast.error("No tienes acceso al panel");
        setLoading(false);
        return;
      }

      toast.success("¡Bienvenido!");
      navigate("/admin/pedidos");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-brand" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(190_62%_27%_/_0.4)_0%,_transparent_70%)]" />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <img src={logoRigos} alt="Rigo's" className="mx-auto mb-4 h-28 w-28 drop-shadow-[0_4px_20px_rgba(245,166,35,0.3)]" />
          <h1 className="font-display text-4xl text-accent">Panel de Control</h1>
          <p className="text-sm text-muted-foreground">Ingresa con tu cuenta del personal</p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-brand disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </motion.button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver al menú
        </button>
      </motion.form>
    </div>
  );
};

export default AdminLogin;
