import { Settings } from "lucide-react";

const D = {
  card: "#1A1F2E",
  border: "#252D3D",
  text: "#F1F3F8",
  textMuted: "#8892A6",
  textDim: "#5C6478",
};

const AdminSettings = () => {
  return (
    <div className="space-y-6 font-pos">
      <h2 className="text-2xl font-extrabold" style={{ color: D.text }}>Configuración</h2>
      <div className="flex flex-col items-center justify-center rounded-xl py-24"
        style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
          <Settings size={32} strokeWidth={2} style={{ color: D.textDim }} />
        </div>
        <p className="text-lg font-bold" style={{ color: D.textMuted }}>Próximamente</p>
        <p className="mt-1 text-sm" style={{ color: D.textDim }}>Aquí podrás configurar mesas, horarios y más</p>
      </div>
    </div>
  );
};

export default AdminSettings;
