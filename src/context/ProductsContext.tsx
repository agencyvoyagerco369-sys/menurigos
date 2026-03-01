import React, { createContext, useContext, useState, useCallback } from "react";
import { products as initialProducts, Product, categories, Category } from "@/data/products";

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.map((p) => ({ ...p, soldOut: p.soldOut ?? false }))
  );

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const id = `p-${Date.now().toString(36)}`;
    setProducts((prev) => [...prev, { ...product, id }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProductsContext.Provider value={{ products, categories, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
};
