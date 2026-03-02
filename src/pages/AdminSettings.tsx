import { T } from "@/lib/admin-theme";
import { Settings } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="space-y-6 font-pos">
      <h2 className="text-2xl font-extrabold" style={{ color: T.text }}>Configuración</h2>
      <div className="flex flex-col items-center justify-center rounded-xl py-24"
        style={{ background: T.card, border: `1px solid ${T.border}` }}>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
          <Settings size={32} strokeWidth={2} style={{ color: T.textDim }} />
        </div>
        <p className="text-lg font-bold" style={{ color: T.textMuted }}>Próximamente</p>
        <p className="mt-1 text-sm" style={{ color: T.textDim }}>Aquí podrás configurar mesas, horarios y más</p>
      </div>
    </div>
  );
};

export default AdminSettings;
