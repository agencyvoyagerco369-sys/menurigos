import { products, categories } from "@/data/products";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AdminProducts = () => {
  const [filter, setFilter] = useState("todos");

  const filtered = filter === "todos" ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      <h2 className="mb-4 font-display text-3xl text-card-foreground">Productos</h2>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("todos")}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            filter === "todos" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          Todos ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filter === c.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {c.icon} {c.name} ({products.filter((p) => p.category === c.id).length})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {categories.find((c) => c.id === p.category)?.icon}{" "}
                  {categories.find((c) => c.id === p.category)?.name}
                </td>
                <td className="px-4 py-3 text-right font-bold text-primary">${p.price}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    p.active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {p.active ? "Disponible" : "Agotado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
