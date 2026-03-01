import { useProducts } from "@/context/ProductsContext";
import { Product, categories } from "@/data/products";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  dogos: "bg-destructive/10 text-destructive",
  botanas: "bg-primary/10 text-primary",
  bebidas: "bg-secondary/30 text-secondary-foreground",
  chiles: "bg-destructive/15 text-destructive",
  extras: "bg-accent/10 text-accent",
};

const categoryEmoji: Record<string, string> = {
  dogos: "🌭",
  botanas: "🍟",
  bebidas: "🥤",
  chiles: "🌶️",
  extras: "➕",
};

// Toggle switch component
const Toggle = ({
  checked,
  onChange,
  labelOn,
  labelOff,
  colorOn = "bg-success",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
  colorOn?: string;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="flex items-center gap-2"
    title={checked ? labelOn : labelOff}
  >
    <div
      className={cn(
        "relative h-6 w-10 rounded-full transition-colors",
        checked ? colorOn : "bg-muted-foreground/30"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </div>
  </button>
);

// Product form dialog
const ProductDialog = ({
  product,
  onSave,
  onClose,
}: {
  product: Partial<Product> | null;
  onSave: (data: Omit<Product, "id">) => void;
  onClose: () => void;
}) => {
  const isNew = !product?.id;
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || "dogos");
  const [description, setDescription] = useState(product?.description || "");

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("El nombre es requerido"); return; }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) { toast.error("Precio inválido"); return; }
    onSave({
      name: name.trim(),
      price: Number(price),
      category,
      description: description.trim() || undefined,
      active: product?.active ?? true,
      soldOut: product?.soldOut ?? false,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h3 className="mb-5 font-display text-2xl text-card-foreground">
          {isNew ? "Agregar Producto" : "Editar Producto"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dogo Clasico"
              maxLength={100}
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="59"
                  min={0}
                  className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-7 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
              rows={2}
              maxLength={300}
              className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-muted py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-success-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {isNew ? "Agregar" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete confirmation dialog
const DeleteDialog = ({
  product,
  onConfirm,
  onClose,
}: {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm">
    <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
      <h3 className="mb-2 font-display text-2xl text-card-foreground">¿Eliminar producto?</h3>
      <p className="mb-1 text-sm text-foreground">
        Estás a punto de eliminar <strong>{product.name}</strong>.
      </p>
      <p className="mb-5 text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-border bg-muted py-3 text-sm font-semibold text-muted-foreground"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-destructive py-3 text-sm font-bold text-destructive-foreground"
        >
          Eliminar
        </button>
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
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, catFilter, search]);

  const handleSave = (data: Omit<Product, "id">) => {
    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success("Producto actualizado");
      setEditProduct(null);
    } else {
      addProduct(data);
      toast.success("Producto agregado");
      setShowNew(false);
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      toast.success("Producto eliminado");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-3xl text-card-foreground">Productos</h2>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-success-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Agregar producto
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCatFilter("todos")}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              catFilter === "todos" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                catFilter === c.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Producto</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground sm:table-cell">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Activo</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Agotado</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const cat = categories.find((c) => c.id === product.category);
              return (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-border/50 last:border-0 transition-opacity",
                    (!product.active || product.soldOut) && "opacity-50"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                        {categoryEmoji[product.category] || "🍽️"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="truncate text-xs text-muted-foreground">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", categoryColors[product.category] || "bg-muted text-muted-foreground")}>
                      {cat?.icon} {cat?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">${product.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Toggle
                        checked={product.active}
                        onChange={(v) => updateProduct(product.id, { active: v })}
                        labelOn="Activo"
                        labelOff="Desactivado"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Toggle
                        checked={product.soldOut}
                        onChange={(v) => updateProduct(product.id, { soldOut: v })}
                        labelOn="Agotado"
                        labelOff="Disponible"
                        colorOn="bg-destructive"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Dialogs */}
      {(editProduct || showNew) && (
        <ProductDialog
          product={editProduct || {}}
          onSave={handleSave}
          onClose={() => { setEditProduct(null); setShowNew(false); }}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminProducts;
