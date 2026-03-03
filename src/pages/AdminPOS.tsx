import { useState, useMemo } from "react";
import { products, Product } from "@/data/products";
import { useOrders } from "@/context/OrdersContext";
import { T } from "@/lib/admin-theme";
import { Plus, Minus, X, Info, ShoppingBag, UtensilsCrossed, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface POSCartItem {
    id: string;
    product: Product;
    extras: Product[];
    notes: string;
    quantity: number;
    unitPrice: number;
}

const CATEGORIES = [
    { id: "dogos", label: "Dogos" },
    { id: "burgers", label: "Burgers" },
    { id: "botanas", label: "Botanas" },
    { id: "bebidas", label: "Bebidas" },
    { id: "chiles", label: "Chiles" },
] as const;

export default function AdminPOS() {
    const { addOrder } = useOrders();

    // State
    const [activeCategory, setActiveCategory] = useState<string>("dogos");
    const [cart, setCart] = useState<POSCartItem[]>([]);

    // Modal for adding items
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
    const [notes, setNotes] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Order Details
    const [orderType, setOrderType] = useState<"mesa" | "domicilio">("mesa");
    const [tableNumber, setTableNumber] = useState<string>("1");
    const [customerName, setCustomerName] = useState("");

    const filteredProducts = products.filter((p) => p.category === activeCategory && p.active && p.category !== "extras");
    const extrasList = products.filter((p) => p.category === "extras" && p.active);

    // Cart Totals
    const totalCart = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setSelectedExtras([]);
        setNotes("");
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
        const unitPrice = selectedProduct.price + extrasTotal;

        setCart((prev) => [
            ...prev,
            {
                id: `${selectedProduct.id}-${Date.now()}`,
                product: selectedProduct,
                extras: selectedExtras,
                notes,
                quantity,
                unitPrice,
            },
        ]);
        setSelectedProduct(null);
    };

    const updateCartItemQty = (id: string, delta: number) => {
        setCart((prev) => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeCartItem = (id: string) => {
        setCart((prev) => prev.filter(item => item.id !== id));
    };

    const submitOrder = async () => {
        if (cart.length === 0) {
            toast.error("El carrito está vacío");
            return;
        }
        if (orderType === "mesa" && !tableNumber) {
            toast.error("Ingresa el número de mesa");
            return;
        }

        try {
            await addOrder({
                items: cart.map(c => ({
                    id: c.id,
                    product: c.product,
                    extras: c.extras,
                    notes: c.notes,
                    quantity: c.quantity,
                    unitPrice: c.unitPrice
                })),
                orderType,
                tableNumber: orderType === "mesa" ? parseInt(tableNumber) || 1 : null,
                customerName: customerName || undefined,
                total: totalCart,
                paymentMethod: "efectivo" // Default for POS, can be customized later
            });
            toast.success("Pedido creado correctamente");
            setCart([]);
            setTableNumber("1");
            setCustomerName("");
        } catch (error) {
            toast.error("No se pudo crear el pedido");
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50 font-pos -m-4 lg:-m-6">
            {/* Left Area: Menu Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white border-b px-4 py-3 shrink-0" style={{ borderColor: T.border }}>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all",
                                    activeCategory === cat.id ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl border p-3 flex flex-col cursor-pointer hover:shadow-lg transition-all active:scale-95 group"
                                style={{ borderColor: T.border }}
                                onClick={() => openProductModal(product)}
                            >
                                <div className="aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <span className="text-4xl text-gray-300">
                                            {product.category === "dogos" ? "🌭" : product.category === "botanas" ? "🍟" : product.category === "bebidas" ? "🥤" : "🍔"}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm leading-tight flex-1">{product.name}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-orange-500 font-extrabold">${product.price}</span>
                                    <div className="w-7 h-7 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Area: Cart Panel */}
            <div className="w-96 bg-white border-l flex flex-col shadow-2xl z-10" style={{ borderColor: T.border }}>
                <div className="p-4 border-b flex flex-col gap-3 shrink-0" style={{ borderColor: T.border }}>
                    <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-orange-500" /> Nuevo Pedido
                    </h2>

                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setOrderType("mesa")}
                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", orderType === "mesa" ? "bg-white shadow text-gray-900" : "text-gray-500")}
                        >
                            Comedor
                        </button>
                        <button
                            onClick={() => setOrderType("domicilio")}
                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", orderType === "domicilio" ? "bg-white shadow text-gray-900" : "text-gray-500")}
                        >
                            Para Llevar
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {orderType === "mesa" && (
                            <input
                                type="number"
                                placeholder="Mesa #"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-1/3 bg-gray-50 border rounded-lg px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-orange-500"
                            />
                        )}
                        <input
                            type="text"
                            placeholder="Nombre del cliente"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center mt-12 text-gray-400">
                            <UtensilsCrossed size={48} className="mb-4 opacity-20" />
                            <p className="font-semibold text-sm">El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="bg-white border rounded-xl p-3 shadow-sm relative group">
                                <button onClick={() => removeCartItem(item.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex justify-between items-start mb-2 pr-5">
                                    <span className="font-bold text-gray-800 text-sm leading-tight">{item.product.name}</span>
                                    <span className="font-bold text-gray-900 text-sm">${item.unitPrice * item.quantity}</span>
                                </div>

                                {item.extras.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mb-1">
                                        {item.extras.map(e => (
                                            <span key={e.id} className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold uppercase">+{e.name}</span>
                                        ))}
                                    </div>
                                )}

                                {item.notes && <p className="text-[11px] text-gray-500 italic mb-2 line-clamp-1">"{item.notes}"</p>}

                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateCartItemQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 active:bg-gray-200">
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateCartItemQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 active:bg-gray-200">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-white shrink-0" style={{ borderColor: T.border }}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total</span>
                        <span className="text-3xl font-black text-gray-900">${totalCart}</span>
                    </div>
                    <button
                        onClick={submitOrder}
                        disabled={cart.length === 0}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:active:scale-100 disabled:shadow-none"
                    >
                        Cobrar y Enviar Comanda
                    </button>
                </div>
            </div>

            {/* Product Modal (Fast Add) */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b flex justify-between items-center relative pb-3">
                            <h3 className="font-black text-xl text-gray-900">{selectedProduct.name}</h3>
                            <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[60vh]">
                            {selectedProduct.category !== 'extras' && extrasList.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Extras</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {extrasList.map(extra => {
                                            const isSelected = selectedExtras.some(e => e.id === extra.id);
                                            return (
                                                <button
                                                    key={extra.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedExtras(prev => prev.filter(e => e.id !== extra.id));
                                                        } else {
                                                            setSelectedExtras(prev => [...prev, extra]);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all flex justify-between items-center",
                                                        isSelected ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-100 bg-gray-50 text-gray-600"
                                                    )}
                                                >
                                                    <span>{extra.name}</span>
                                                    <span className="opacity-70 text-xs">+${extra.price}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notas Generales</h4>
                                <textarea
                                    rows={2}
                                    className="w-full bg-gray-50 border rounded-xl p-3 text-sm focus:border-orange-500 outline-none resize-none"
                                    placeholder="Sin cebolla, etc..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="mt-5 flex items-center justify-center gap-6">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="text-3xl font-black w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 active:bg-orange-200"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 border-t bg-gray-50">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl active:scale-95 transition-all text-lg shadow-xl shadow-gray-900/20"
                            >
                                Agregar ${((selectedProduct.price + selectedExtras.reduce((s, e) => s + e.price, 0)) * quantity)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
