import { categories } from "@/data/products";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

const CategoryTabs = ({ activeCategory, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground shadow-brand"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
