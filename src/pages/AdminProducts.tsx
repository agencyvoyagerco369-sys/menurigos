import { useProducts } from "@/context/ProductsContext";
import { Product, categories } from "@/data/products";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const D = {
  bg: "#151820",
  card: "#1A1F2E",
  border: "#252D3D",
  text: "#F1F3F8",
  textMuted: "#8892A6",
  textDim: "#5C6478",
  brand: "#D42B2B",
  surface: "#161B27",
  input: "#131720",
};

const categoryEmoji: Record<string, string> = {
  dogos: "🌭", botanas: "🍟", bebidas: "🥤", chiles: "🌶️", extras: "➕",
};

const Toggle = ({ checked, onChange, labelOn, labelOff, isDestructive }: {
  checked: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string; isDestructive?: boolean;
}) => (
  <button onClick={() => onChange(!checked)} title={checked ? labelOn : labelOff}>
    <div className="relative h-6 w-10 rounded-full transition-colors"
      style={{ background: checked ? (isDestructive ? D.brand : "#10B981") : "rgba(255,255,255,0.1)" }}>
      <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </div>
  </button>
);

const ProductDialog = ({ product, onSave, onClose }: {
  product: Partial<Product> | null; onSave: (data: Omit<Product, "id">) => void; onClose: () => void;
}) => {
  const isNew = !product?.id;
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || "dogos");
  const [description, setDescription] = useState(product?.description || "");

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("El nombre es requerido"); return; }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) { toast.error("Precio inválido"); return; }
    onSave({ name: name.trim(), price: Number(price), category, description: description.trim() || undefined, active: product?.active ?? true, soldOut: product?.soldOut ?? false });
  };

  const inputStyle = { background: D.input, border: `1px solid ${D.border}`, color: D.text };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-pos" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="relative mx-4 w-full max-w-md rounded-xl p-6" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <button onClick={onClose} className="absolute right-4 top-4" style={{ color: D.textMuted }}>
          <X size={20} strokeWidth={2} />
        </button>
        <h3 className="mb-5 text-xl font-extrabold" style={{ color: D.text }}>
          {isNew ? "Agregar Producto" : "Editar Producto"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: D.textDim }}>Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dogo Clasico" maxLength={100}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: D.textDim }}>Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: D.textMuted }}>$</span>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="59" min={0}
                  className="w-full rounded-lg py-3 pl-7 pr-4 text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: D.textDim }}>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg px-3 py-3 text-sm focus:outline-none" style={inputStyle}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: D.textDim }}>Descripción (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción..." rows={2} maxLength={300}
              className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg py-3 text-sm font-bold transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.06)", color: D.textMuted, border: `1px solid ${D.border}` }}>Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 rounded-lg py-3 text-sm font-bold text-white transition-all duration-150 hover:brightness-110"
            style={{ background: "#10B981" }}>{isNew ? "Agregar" : "Guardar cambios"}</button>
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({ product, onConfirm, onClose }: { product: Product; onConfirm: () => void; onClose: () => void; }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center font-pos" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
    <div className="relative mx-4 w-full max-w-sm rounded-xl p-6" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
      <h3 className="mb-2 text-xl font-extrabold" style={{ color: D.text }}>¿Eliminar producto?</h3>
      <p className="mb-1 text-sm" style={{ color: D.textMuted }}>Estás a punto de eliminar <strong style={{ color: D.text }}>{product.name}</strong>.</p>
      <p className="mb-5 text-xs" style={{ color: D.textDim }}>Esta acción no se puede deshacer.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-lg py-3 text-sm font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: D.textMuted, border: `1px solid ${D.border}` }}>Cancelar</button>
        <button onClick={onConfirm} className="flex-1 rounded-lg py-3 text-sm font-bold text-white hover:brightness-110"
          style={{ background: D.brand }}>Eliminar</button>
      </div>
    </div>
  </div>
);

const AdminProducts = () => {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todos");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (catFilter !== "todos") list = list.filter((p) => p.category === catFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q)); }
    return list;
  }, [products, catFilter, search]);

  const handleSave = (data: Omit<Product, "id">) => {
    if (editProduct) { updateProduct(editProduct.id, data); toast.success("Producto actualizado"); setEditProduct(null); }
    else { addProduct(data); toast.success("Producto agregado"); setShowNew(false); }
  };

  const handleDelete = () => { if (deleteTarget) { deleteProduct(deleteTarget.id); toast.success("Producto eliminado"); setDeleteTarget(null); } };

  return (
    <div className="space-y-4 font-pos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold" style={{ color: D.text }}>Productos</h2>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:brightness-110"
          style={{ background: "#10B981" }}>
          <Plus size={18} strokeWidth={2} /> Agregar producto
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: D.textDim }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..."
            className="w-full rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none"
            style={{ background: D.card, border: `1px solid ${D.border}`, color: D.text }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCatFilter("todos")}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150"
            style={{ background: catFilter === "todos" ? "rgba(212,43,43,0.15)" : "rgba(255,255,255,0.05)", color: catFilter === "todos" ? "#F87171" : D.textMuted, border: `1px solid ${catFilter === "todos" ? "rgba(212,43,43,0.3)" : D.border}` }}>
            Todos
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150"
              style={{ background: catFilter === c.id ? "rgba(212,43,43,0.15)" : "rgba(255,255,255,0.05)", color: catFilter === c.id ? "#F87171" : D.textMuted, border: `1px solid ${catFilter === c.id ? "rgba(212,43,43,0.3)" : D.border}` }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-medium" style={{ color: D.textDim }}>{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</p>

      <div className="overflow-x-auto rounded-xl" style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${D.border}` }}>
              {["Producto", "Categoría", "Precio", "Activo", "Agotado", "Acciones"].map((h, i) => (
                <th key={h} className={cn("px-4 py-3 text-[11px] font-bold uppercase tracking-wider", i === 1 && "hidden sm:table-cell", i >= 2 && i <= 4 && "text-center", i === 2 && "text-right", i === 5 && "text-right")}
                  style={{ color: D.textDim }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const cat = categories.find((c) => c.id === product.category);
              return (
                <tr key={product.id} className={cn("transition-opacity", (!product.active || product.soldOut) && "opacity-40")}
                  style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        {categoryEmoji[product.category] || "🍽️"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold" style={{ color: D.text }}>{product.name}</p>
                        {product.description && <p className="truncate text-xs" style={{ color: D.textDim }}>{product.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="rounded px-2.5 py-1 text-xs font-bold"
                      style={{ background: "rgba(255,255,255,0.06)", color: D.textMuted }}>
                      {cat?.icon} {cat?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: D.text }}>${product.price}</td>
                  <td className="px-4 py-3"><div className="flex justify-center">
                    <Toggle checked={product.active} onChange={(v) => updateProduct(product.id, { active: v })} labelOn="Activo" labelOff="Desactivado" />
                  </div></td>
                  <td className="px-4 py-3"><div className="flex justify-center">
                    <Toggle checked={product.soldOut} onChange={(v) => updateProduct(product.id, { soldOut: v })} labelOn="Agotado" labelOff="Disponible" isDestructive />
                  </div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditProduct(product)} className="rounded-lg p-2 transition-colors"
                        style={{ color: D.textMuted }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteTarget(product)} className="rounded-lg p-2 transition-colors"
                        style={{ color: D.textMuted }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,43,43,0.1)"; e.currentTarget.style.color = "#F87171"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.textMuted; }}>
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm" style={{ color: D.textDim }}>No se encontraron productos</div>}
      </div>

      {(editProduct || showNew) && <ProductDialog product={editProduct || {}} onSave={handleSave} onClose={() => { setEditProduct(null); setShowNew(false); }} />}
      {deleteTarget && <DeleteDialog product={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
};

export default AdminProducts;
