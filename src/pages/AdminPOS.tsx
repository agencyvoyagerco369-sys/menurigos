import { useState, useMemo } from "react";
import { products, Product } from "@/data/products";
import { useOrders } from "@/context/OrdersContext";
import { T } from "@/lib/admin-theme";
import { Plus, Minus, X, ShoppingBag, UtensilsCrossed, Trash2, Search, CheckCircle2 } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<POSCartItem[]>([]);

    // Modal State (Solo para Dogos/Burgers)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
    const [notes, setNotes] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Order Details
    const [orderType, setOrderType] = useState<"mesa" | "domicilio">("mesa");
    const [tableNumber, setTableNumber] = useState<string>("1");
    const [customerName, setCustomerName] = useState("");

    const filteredProducts = products.filter((p) => {
        if (!p.active || p.category === "extras") return false;
        if (searchQuery) return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return p.category === activeCategory;
    });

    const extrasList = products.filter((p) => p.category === "extras" && p.active);
    const totalCart = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const handleAddToCartFast = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id && i.extras.length === 0 && !i.notes);
            if (existing) {
                return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                id: `${product.id}-${Date.now()}`,
                product,
                extras: [],
                notes: "",
                quantity: 1,
                unitPrice: product.price
            }];
        });
        toast.success(`Agregado: ${product.name}`);
    };

    const openProductModalOrAdd = (product: Product) => {
        const isMainDish = product.category === "dogos" || product.category === "burgers";
        if (!isMainDish) {
            handleAddToCartFast(product);
        } else {
            setSelectedProduct(product);
            setSelectedExtras([]);
            setNotes("");
            setQuantity(1);
        }
    };

    const handleAddToCartWithExtras = () => {
        if (!selectedProduct) return;
        const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
        const unitPrice = selectedProduct.price + extrasTotal;

        setCart((prev) => [...prev, {
            id: `${selectedProduct.id}-${Date.now()}`,
            product: selectedProduct,
            extras: selectedExtras,
            notes,
            quantity,
            unitPrice,
        }]);
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
                paymentMethod: "efectivo"
            });
            toast.success("Pedido creado y enviado a cocina ✨");
            setCart([]);
            setTableNumber("1");
            setCustomerName("");
        } catch (error) {
            toast.error("No se pudo crear el pedido");
        }
    };

    const modalTotal = useMemo(() => {
        if (!selectedProduct) return 0;
        return (selectedProduct.price + selectedExtras.reduce((s, e) => s + e.price, 0)) * quantity;
    }, [selectedProduct, selectedExtras, quantity]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100 font-pos -m-4 lg:-m-6 relative">
            {/* Left Area: Menu Grid */}
            <div className="flex-1 flex flex-col min-w-0 z-0">
                <div className="bg-white border-b px-6 py-4 shrink-0 flex flex-col gap-4 shadow-sm relative z-10" style={{ borderColor: T.border }}>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-10 py-2.5 text-sm font-medium outline-none focus:border-orange-500 transition-all placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {!searchQuery && (
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-2xl whitespace-nowrap text-sm font-black transition-all border-2",
                                        activeCategory === cat.id
                                            ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25"
                                            : "bg-white text-gray-600 border-gray-100 hover:border-orange-300 hover:bg-orange-50/50"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-20">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-white rounded-3xl p-3 flex flex-col cursor-pointer shadow-sm hover:shadow-xl transition-all duration-100 active:scale-[0.96] group border border-gray-100/50"
                                onClick={() => openProductModalOrAdd(product)}
                            >
                                <div className="aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            {product.category === "dogos" ? "🌭" : product.category === "botanas" ? "🍟" : product.category === "bebidas" ? "🥤" : "🍔"}
                                        </span>
                                    )}
                                </div>
                                <div className="px-1 flex flex-col flex-1">
                                    <h3 className="font-extrabold text-gray-900 text-[15px] leading-tight flex-1 tracking-tight">{product.name}</h3>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-orange-500 font-black text-[17px] tracking-tight">${product.price}</span>
                                        <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:bg-orange-600 transition-colors">
                                            <Plus size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Area: Cart Panel */}
            <div className="w-[420px] bg-white border-l flex flex-col shadow-2xl z-20 relative" style={{ borderColor: T.border }}>
                <div className="p-5 border-b flex flex-col gap-4 shrink-0 bg-gray-50/50" style={{ borderColor: T.border }}>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <ShoppingBag size={22} className="text-orange-500" /> Nueva Comanda
                    </h2>

                    <div className="flex bg-gray-200/70 p-1.5 rounded-2xl gap-1">
                        <button
                            onClick={() => setOrderType("mesa")}
                            className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", orderType === "mesa" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Comedor
                        </button>
                        <button
                            onClick={() => setOrderType("domicilio")}
                            className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", orderType === "domicilio" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Para Llevar
                        </button>
                    </div>

                    <div className="flex gap-3">
                        {orderType === "mesa" && (
                            <div className="relative w-1/3">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">#</span>
                                <input
                                    type="number"
                                    placeholder="Mesa"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-7 pr-3 py-2.5 text-[15px] font-black text-gray-900 outline-none focus:border-orange-500 transition-all shadow-sm"
                                />
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="Nombre del cliente"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-orange-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
                    {cart.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative group transition-all hover:shadow-md hover:border-orange-100">
                            <button onClick={() => removeCartItem(item.id)} className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-md border rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-10">
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                            <div className="flex justify-between items-start mb-2 pr-2">
                                <span className="font-extrabold text-gray-900 text-[15px] leading-tight max-w-[75%]">{item.product.name}</span>
                                <span className="font-black text-gray-900 text-[15px]">${item.unitPrice * item.quantity}</span>
                            </div>
                            {item.extras.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mb-2">
                                    {item.extras.map(e => (
                                        <span key={e.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">+{e.name}</span>
                                    ))}
                                </div>
                            )}
                            {item.notes && <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md font-medium mb-3 italic">Nota: {item.notes}</p>}
                            <div className="flex items-center gap-4 mt-3 bg-gray-50 w-fit rounded-xl p-1 border border-gray-100">
                                <button onClick={() => updateCartItemQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-black active:scale-95 transition-all">
                                    <Minus size={16} strokeWidth={2.5} />
                                </button>
                                <span className="font-black text-[15px] w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateCartItemQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-black active:scale-95 transition-all">
                                    <Plus size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-white shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]" style={{ borderColor: T.border }}>
                    <div className="flex justify-between items-end mb-5">
                        <span className="text-[14px] font-black text-gray-400 uppercase tracking-[0.15em]">Total a cobrar</span>
                        <span className="text-[40px] font-black text-orange-500 leading-none">${totalCart}</span>
                    </div>
                    <button
                        onClick={submitOrder}
                        disabled={cart.length === 0}
                        className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white font-black text-[17px] py-4.5 rounded-2xl shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98] disabled:active:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                        style={{ padding: "18px" }}
                    >
                        Cobrar y Enviar Comanda
                    </button>
                </div>
            </div>

            {/* Modal for Main Dishes (Extras & Notes ONLY) */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-100">
                    <div className="bg-white w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden rounded-[2rem] animate-in zoom-in-95 duration-200 relative" style={{ maxHeight: '85vh', height: '100%' }}>
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h3 className="font-extrabold text-3xl text-gray-900 tracking-tight leading-none mb-1">{selectedProduct.name}</h3>
                                <p className="text-gray-500 font-medium">Personaliza este platillo</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-500 transition-colors">
                                <X size={22} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 bg-gray-50/50 space-y-8">
                            {extrasList.length > 0 && (
                                <div>
                                    <h4 className="text-[14px] font-black text-gray-800 uppercase tracking-widest mb-4">Selecciona Extras</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                        "p-4 rounded-2xl text-[14px] font-bold border-2 transition-all flex justify-between items-center gap-3 relative group",
                                                        isSelected ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50/30"
                                                    )}
                                                >
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="leading-tight text-left">{extra.name}</span>
                                                        <span className={cn("text-[12px]", isSelected ? "text-orange-600/80 font-black" : "text-gray-400 font-bold")}>+${extra.price}</span>
                                                    </div>
                                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 text-transparent")}>
                                                        <CheckCircle2 size={14} strokeWidth={3} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.10em] mb-4">Notas / Peticiones</h4>
                                <textarea
                                    rows={2}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-[15px] font-medium text-gray-800 focus:bg-white focus:border-orange-500 outline-none resize-none transition-all placeholder:text-gray-400"
                                    placeholder="Ej: Sin tomate, dorados..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="py-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col items-center">
                                <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.10em] mb-5 text-center">Cantidad</h4>
                                <div className="flex items-center justify-center gap-6 bg-gray-50 p-2 rounded-full border border-gray-100">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 active:scale-95 transition-transform hover:text-red-500">
                                        <Minus size={24} strokeWidth={3} />
                                    </button>
                                    <span className="text-4xl font-black w-12 text-center text-gray-900">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 shadow-md text-white active:scale-95 transition-transform hover:bg-orange-600">
                                        <Plus size={24} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 border-t border-gray-100 bg-white shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">Cuenta Parcial</span>
                                <span className="font-black text-3xl text-gray-900">${modalTotal}</span>
                            </div>
                            <button
                                onClick={handleAddToCartWithExtras}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 md:py-5 text-lg rounded-2xl active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(249,115,22,0.5)]"
                            >
                                Agregar a la Comanda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
