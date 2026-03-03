import { useState, useMemo } from "react";
import { products, Product } from "@/data/products";
import { useOrders } from "@/context/OrdersContext";
import { T } from "@/lib/admin-theme";
import { Plus, Minus, X, ShoppingBag, UtensilsCrossed, Trash2, Search, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────── */
interface POSCartItem {
    id: string;
    product: Product;
    extras: Product[];
    notes: string;
    quantity: number;
    unitPrice: number;
}

/* ── Categories must match products.ts ─────── */
const CATEGORIES = [
    { id: "dogos", label: "🌭 Dogos", color: "orange" },
    { id: "botanas", label: "🍟 Botanas", color: "amber" },
    { id: "bebidas", label: "🥤 Bebidas", color: "blue" },
    { id: "chiles", label: "🌶️ Chiles", color: "red" },
] as const;

export default function AdminPOS() {
    const { addOrder } = useOrders();

    /* ── Core State ─────────────────────────── */
    const [activeCategory, setActiveCategory] = useState<string>("dogos");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<POSCartItem[]>([]);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    /* ── Order Info ─────────────────────────── */
    const [orderType, setOrderType] = useState<"mesa" | "domicilio">("mesa");
    const [tableNumber, setTableNumber] = useState<string>("1");
    const [customerName, setCustomerName] = useState("");

    /* ── Upselling Banner ──────────────────── */
    const [showUpsell, setShowUpsell] = useState(false);

    /* ── Derived Data ──────────────────────── */
    const extrasList = useMemo(() => products.filter(p => p.category === "extras" && p.active), []);
    const bebidasList = useMemo(() => products.filter(p => p.category === "bebidas" && p.active), []);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (!p.active || p.category === "extras") return false;
            if (searchQuery) return p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return p.category === activeCategory;
        });
    }, [activeCategory, searchQuery]);

    const totalCart = useMemo(() => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cart]);
    const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    /* ── Actions ───────────────────────────── */

    /** Click any product → add to cart instantly */
    const addProductToCart = (product: Product) => {
        setCart(prev => {
            // Merge with existing identical item (same product, no extras, no notes)
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
                unitPrice: product.price,
            }];
        });

        // Show upselling banner after adding a main dish
        if (product.category === "dogos" || product.category === "chiles") {
            setShowUpsell(true);
            setTimeout(() => setShowUpsell(false), 8000);
        }
    };

    /** Toggle an extra on a cart item */
    const toggleExtra = (cartItemId: string, extra: Product) => {
        setCart(prev => prev.map(item => {
            if (item.id !== cartItemId) return item;
            const has = item.extras.some(e => e.id === extra.id);
            const newExtras = has ? item.extras.filter(e => e.id !== extra.id) : [...item.extras, extra];
            const extrasTotal = newExtras.reduce((s, e) => s + e.price, 0);
            return { ...item, extras: newExtras, unitPrice: item.product.price + extrasTotal };
        }));
    };

    /** Update notes on a cart item */
    const updateNotes = (cartItemId: string, notes: string) => {
        setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, notes } : item));
    };

    const updateCartItemQty = (id: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id !== id) return item;
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null as any;
                return { ...item, quantity: newQty };
            }).filter(Boolean);
        });
    };

    const removeCartItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    /** Submit order to Supabase */
    const submitOrder = async () => {
        if (cart.length === 0) { toast.error("El carrito está vacío"); return; }
        if (orderType === "mesa" && !tableNumber) { toast.error("Ingresa el número de mesa"); return; }

        try {
            await addOrder({
                items: cart.map(c => ({
                    id: c.id,
                    product: c.product,
                    extras: c.extras,
                    notes: c.notes,
                    quantity: c.quantity,
                    unitPrice: c.unitPrice,
                })),
                orderType,
                tableNumber: orderType === "mesa" ? parseInt(tableNumber) || 1 : null,
                customerName: customerName || undefined,
                total: totalCart,
                paymentMethod: "efectivo",
            });
            toast.success("✅ Comanda #" + Math.floor(Math.random() * 9000 + 1000) + " enviada a cocina");
            setCart([]);
            setCustomerName("");
        } catch {
            toast.error("Error al enviar pedido. Intenta de nuevo.");
        }
    };

    /* ── Quick Upsell: add a drink fast ────── */
    const quickAddDrink = (drink: Product) => {
        addProductToCart(drink);
        setShowUpsell(false);
    };

    /* ── RENDER ─────────────────────────────── */
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100 -m-4 lg:-m-6 relative">

            {/* ═══ LEFT: Product Grid ═══ */}
            <div className="flex-1 flex flex-col min-w-0 z-0">
                {/* Header */}
                <div className="bg-white border-b px-4 py-3 shrink-0 flex flex-col gap-3 shadow-sm" style={{ borderColor: T.border }}>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-10 py-2.5 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full p-1">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setSearchQuery(""); }}
                                className={cn(
                                    "px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all border",
                                    activeCategory === cat.id && !searchQuery
                                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="font-semibold text-lg">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addProductToCart(product)}
                                    className={cn(
                                        "bg-white rounded-2xl p-3 flex flex-col text-left shadow-sm hover:shadow-lg transition-all duration-100 active:scale-[0.96] group border border-gray-100",
                                        product.soldOut && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl">
                                                {product.category === "dogos" ? "🌭" : product.category === "botanas" ? "🍟" : product.category === "bebidas" ? "🥤" : "🌶️"}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{product.name}</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-orange-500 font-black text-base">${product.price}</span>
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center shadow group-hover:bg-orange-600 transition-colors">
                                            <Plus size={18} strokeWidth={3} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ RIGHT: Cart Panel ═══ */}
            <div className="w-[380px] bg-white border-l flex flex-col shadow-2xl z-20 relative" style={{ borderColor: T.border }}>
                {/* Cart Header */}
                <div className="p-4 border-b flex flex-col gap-3 shrink-0 bg-gray-50/50" style={{ borderColor: T.border }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-orange-500" /> Comanda
                            {itemCount > 0 && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>}
                        </h2>
                        {cart.length > 0 && (
                            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-bold">
                                Vaciar
                            </button>
                        )}
                    </div>

                    <div className="flex bg-gray-200/70 p-1 rounded-xl gap-1">
                        <button onClick={() => setOrderType("mesa")} className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", orderType === "mesa" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>
                            Comedor
                        </button>
                        <button onClick={() => setOrderType("domicilio")} className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", orderType === "domicilio" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>
                            Para Llevar
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {orderType === "mesa" && (
                            <input type="number" placeholder="# Mesa" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
                                className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-gray-900 outline-none focus:border-orange-500 transition-all" />
                        )}
                        <input type="text" placeholder="Nombre cliente (opcional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-orange-500 transition-all" />
                    </div>
                </div>

                {/* Upselling Banner */}
                {showUpsell && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 shrink-0 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} />
                            <span className="font-bold text-sm">¿Agregar bebida?</span>
                            <button onClick={() => setShowUpsell(false)} className="ml-auto text-white/70 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {bebidasList.slice(0, 6).map(drink => (
                                <button
                                    key={drink.id}
                                    onClick={() => quickAddDrink(drink)}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                                >
                                    {drink.name} ${drink.price}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <UtensilsCrossed size={36} className="opacity-20 mb-3" />
                            <p className="font-bold text-gray-500 text-center text-sm">Toca un producto<br />para agregarlo aquí</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const isExpanded = expandedItem === item.id;
                            const isDogo = item.product.category === "dogos" || item.product.category === "chiles";
                            return (
                                <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm transition-all">
                                    {/* Main Row */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{item.product.name}</span>
                                                <span className="font-black text-gray-900 text-sm shrink-0">${item.unitPrice * item.quantity}</span>
                                            </div>
                                            {item.extras.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                    {item.extras.map(e => (
                                                        <span key={e.id} className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">+{e.name}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {item.notes && <p className="text-[10px] text-amber-600 mt-1 italic">📝 {item.notes}</p>}
                                        </div>
                                    </div>

                                    {/* Quantity + Actions Row */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                            <button onClick={() => updateCartItemQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition-all">
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateCartItemQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-green-500 active:scale-95 transition-all">
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>

                                        <div className="flex gap-1.5">
                                            {isDogo && (
                                                <button
                                                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                                    className={cn("text-[10px] font-bold px-2 py-1 rounded-md transition-colors", isExpanded ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500 hover:bg-orange-50")}
                                                >
                                                    Extras {isExpanded ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />}
                                                </button>
                                            )}
                                            <button onClick={() => removeCartItem(item.id)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Extras Panel */}
                                    {isExpanded && isDogo && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-2 gap-1.5 mb-2">
                                                {extrasList.map(extra => {
                                                    const isSelected = item.extras.some(e => e.id === extra.id);
                                                    return (
                                                        <button
                                                            key={extra.id}
                                                            onClick={() => toggleExtra(item.id, extra)}
                                                            className={cn(
                                                                "px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-left",
                                                                isSelected ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                                                            )}
                                                        >
                                                            {extra.name} <span className="text-[9px] opacity-70">+${extra.price}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Notas: sin tomate, dorados..."
                                                value={item.notes}
                                                onChange={(e) => updateNotes(item.id, e.target.value)}
                                                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Cart Footer - Always Visible */}
                <div className="p-4 border-t bg-white shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.08)]" style={{ borderColor: T.border }}>
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total</span>
                        <span className="text-3xl font-black text-orange-500 leading-none">${totalCart}</span>
                    </div>
                    <button
                        onClick={submitOrder}
                        disabled={cart.length === 0}
                        className={cn(
                            "w-full font-black text-base py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                            cart.length > 0
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {cart.length > 0 ? `💰 Cobrar $${totalCart}` : "Agrega productos para cobrar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
