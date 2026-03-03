import { useState, useMemo } from "react";
import { products, Product } from "@/data/products";
import { useOrders } from "@/context/OrdersContext";
import { T } from "@/lib/admin-theme";
import { Plus, Minus, X, ShoppingBag, UtensilsCrossed, Trash2, Search, ArrowRight, CheckCircle2 } from "lucide-react";
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

type ModalStep = "extras" | "bebidas" | "botanas";

export default function AdminPOS() {
    const { addOrder } = useOrders();

    // State
    const [activeCategory, setActiveCategory] = useState<string>("dogos");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<POSCartItem[]>([]);

    // Modal Wizard State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalStep, setModalStep] = useState<ModalStep>("extras");

    // Step 1: Main product
    const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
    const [notes, setNotes] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Step 2 & 3: Cross-selling
    const [selectedCrossItems, setSelectedCrossItems] = useState<{ product: Product, qty: number }[]>([]);

    // Order Details
    const [orderType, setOrderType] = useState<"mesa" | "domicilio">("mesa");
    const [tableNumber, setTableNumber] = useState<string>("1");
    const [customerName, setCustomerName] = useState("");

    const filteredProducts = products.filter((p) => {
        if (!p.active || p.category === "extras") return false;
        if (searchQuery) {
            return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return p.category === activeCategory;
    });

    const extrasList = products.filter((p) => p.category === "extras" && p.active);
    const bebidasList = products.filter((p) => p.category === "bebidas" && p.active);
    const botanasList = products.filter((p) => p.category === "botanas" && p.active);

    // Cart Totals
    const totalCart = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setSelectedExtras([]);
        setNotes("");
        setQuantity(1);
        setSelectedCrossItems([]);
        setModalStep("extras");
    };

    const handleCrossItemChange = (product: Product, delta: number) => {
        setSelectedCrossItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                const nq = existing.qty + delta;
                if (nq <= 0) return prev.filter(i => i.product.id !== product.id);
                return prev.map(i => i.product.id === product.id ? { ...i, qty: nq } : i);
            } else if (delta > 0) {
                return [...prev, { product, qty: delta }];
            }
            return prev;
        });
    };

    const getCrossItemQty = (productId: string) => {
        return selectedCrossItems.find(i => i.product.id === productId)?.qty || 0;
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        let newItems: POSCartItem[] = [];

        // 1. Add the main product
        const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
        const unitPrice = selectedProduct.price + extrasTotal;

        newItems.push({
            id: `${selectedProduct.id}-${Date.now()}-main`,
            product: selectedProduct,
            extras: selectedExtras,
            notes,
            quantity,
            unitPrice,
        });

        // 2. Add all cross-sell items independently
        selectedCrossItems.forEach(item => {
            newItems.push({
                id: `${item.product.id}-${Date.now()}-${Math.random()}`,
                product: item.product,
                extras: [],
                notes: "", // Cross-sell items won't have notes by default here
                quantity: item.qty,
                unitPrice: item.product.price,
            });
        });

        setCart((prev) => [...prev, ...newItems]);
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

    const isMainDish = selectedProduct?.category === "dogos" || selectedProduct?.category === "burgers";

    // Calculates total cost of current modal (Main item * qty) + (Cross items sum)
    const modalTotal = useMemo(() => {
        if (!selectedProduct) return 0;
        const main = (selectedProduct.price + selectedExtras.reduce((s, e) => s + e.price, 0)) * quantity;
        const cross = selectedCrossItems.reduce((s, i) => s + i.product.price * i.qty, 0);
        return main + cross;
    }, [selectedProduct, selectedExtras, quantity, selectedCrossItems]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100 font-pos -m-4 lg:-m-6 relative">
            {/* Left Area: Menu Grid */}
            <div className="flex-1 flex flex-col min-w-0 z-0">
                {/* Header: Categories & Search */}
                <div className="bg-white border-b px-6 py-4 shrink-0 flex flex-col gap-4 shadow-sm relative z-10" style={{ borderColor: T.border }}>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-10 py-2.5 text-sm font-medium outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                                >
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

                    {searchQuery && (
                        <div className="px-1">
                            <h3 className="text-sm font-bold text-gray-500">Resultados para "{searchQuery}"</h3>
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="font-semibold text-lg">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-20">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-3xl p-3 flex flex-col cursor-pointer shadow-sm hover:shadow-xl transition-all duration-200 active:scale-[0.98] group border border-gray-100/50"
                                    onClick={() => openProductModal(product)}
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
                    )}
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
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-7 pr-3 py-2.5 text-[15px] font-black text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                                />
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="Nombre del cliente"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center mt-8 text-gray-400">
                            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                                <UtensilsCrossed size={40} className="opacity-20 text-gray-600" />
                            </div>
                            <p className="font-bold text-gray-500 text-center">Agrega productos asombrosos<br />para iniciar la cuenta</p>
                        </div>
                    ) : (
                        cart.map((item) => (
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
                        ))
                    )}
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

            {/* Product Stepper Wizard Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Contenedor Bulletproof con altura estricta */}
                    <div
                        className="bg-white w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden rounded-[2rem] animate-in zoom-in-95 duration-300 relative"
                        style={{ maxHeight: 'calc(100vh - 2rem)' }}
                    >

                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start relative shrink-0 bg-white">
                            <div className="flex-1 pr-6">
                                <h3 className="font-extrabold text-3xl text-gray-900 tracking-tight leading-none mb-3">{selectedProduct.name}</h3>
                                {isMainDish && (
                                    <div className="flex flex-wrap items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-widest mt-3">
                                        <span className={cn("px-3 py-1.5 rounded-full transition-all", modalStep === "extras" ? "bg-orange-100 text-orange-600" : "bg-gray-100")}>1. Prepara</span>
                                        <ArrowRight size={12} className={cn(modalStep === "bebidas" || modalStep === "botanas" ? "text-orange-400" : "text-gray-300")} />
                                        <span className={cn("px-3 py-1.5 rounded-full transition-all", modalStep === "bebidas" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400")}>2. Bebida</span>
                                        <ArrowRight size={12} className={cn(modalStep === "botanas" ? "text-blue-400" : "text-gray-300")} />
                                        <span className={cn("px-3 py-1.5 rounded-full transition-all", modalStep === "botanas" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400")}>3. Botana</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 flex flex-col items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-500 transition-colors shrink-0">
                                <X size={22} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">

                            {/* STEP 1: EXTRAS & PREPARATION */}
                            {modalStep === "extras" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    {selectedProduct.category !== 'extras' && extrasList.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-5">
                                                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black">1</span>
                                                <h4 className="text-[14px] font-black text-gray-800 uppercase tracking-widest">Personaliza tu plato</h4>
                                            </div>
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
                                                                "p-4 rounded-2xl text-[14px] font-bold border-2 transition-all flex justify-between items-center gap-3 relative overflow-hidden group",
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
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-[15px] font-medium text-gray-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none resize-none transition-all placeholder:text-gray-400"
                                            placeholder="Ej: Sin tomate, dorados, mayonesa aparte..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="py-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col items-center">
                                        <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.10em] mb-5 text-center">¿Cuántos de estos vas a preparar?</h4>
                                        <div className="flex items-center justify-center gap-6 bg-gray-50 p-2 rounded-full border border-gray-100">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 active:scale-95 transition-transform hover:text-red-500"
                                            >
                                                <Minus size={24} strokeWidth={3} />
                                            </button>
                                            <span className="text-4xl font-black w-12 text-center text-gray-900">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 shadow-md text-white active:scale-95 transition-transform hover:bg-orange-600"
                                            >
                                                <Plus size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: BEBIDAS */}
                            {modalStep === "bebidas" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">🥤</div>
                                        <h4 className="text-[22px] font-black text-gray-900">¿Desea bebida para acompañar?</h4>
                                        <p className="text-base text-gray-500 font-medium max-w-sm mx-auto mt-2">Ofrece un refresco o agua fresca para subir el valor del ticket.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {bebidasList.map(drink => {
                                            const qty = getCrossItemQty(drink.id);
                                            return (
                                                <div key={drink.id} className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                                    qty > 0 ? "border-blue-500 bg-blue-50/30" : "border-transparent bg-white shadow-sm hover:border-blue-200"
                                                )}>
                                                    <div className="flex-1 pr-2">
                                                        <h5 className="font-extrabold text-[15px]">{drink.name}</h5>
                                                        <span className="text-blue-600 font-black">${drink.price}</span>
                                                    </div>

                                                    {qty === 0 ? (
                                                        <button
                                                            onClick={() => handleCrossItemChange(drink, 1)}
                                                            className="px-5 py-2.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-900 rounded-xl font-bold text-sm transition-colors"
                                                        >
                                                            Agregar
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 border shadow-sm border-blue-100">
                                                            <button onClick={() => handleCrossItemChange(drink, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                                                                <Minus size={16} strokeWidth={3} />
                                                            </button>
                                                            <span className="font-black text-[15px] w-4 text-center">{qty}</span>
                                                            <button onClick={() => handleCrossItemChange(drink, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors">
                                                                <Plus size={16} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: BOTANAS */}
                            {modalStep === "botanas" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">🍟</div>
                                        <h4 className="text-[22px] font-black text-gray-900">¿Algún antojo salado?</h4>
                                        <p className="text-base text-gray-500 font-medium max-w-sm mx-auto mt-2">Sugiere unas papas o botana para hacer combo perfecto.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {botanasList.map(snack => {
                                            const qty = getCrossItemQty(snack.id);
                                            return (
                                                <div key={snack.id} className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                                    qty > 0 ? "border-amber-500 bg-amber-50/30" : "border-transparent bg-white shadow-sm hover:border-amber-200"
                                                )}>
                                                    <div className="flex-1 pr-2">
                                                        <h5 className="font-extrabold text-[15px] line-clamp-1">{snack.name}</h5>
                                                        <span className="text-amber-600 font-black">${snack.price}</span>
                                                    </div>

                                                    {qty === 0 ? (
                                                        <button
                                                            onClick={() => handleCrossItemChange(snack, 1)}
                                                            className="px-5 py-2.5 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-900 rounded-xl font-bold text-sm transition-colors"
                                                        >
                                                            Agregar
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 border shadow-sm border-amber-100">
                                                            <button onClick={() => handleCrossItemChange(snack, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                                                                <Minus size={16} strokeWidth={3} />
                                                            </button>
                                                            <span className="font-black text-[15px] w-4 text-center">{qty}</span>
                                                            <button onClick={() => handleCrossItemChange(snack, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-colors">
                                                                <Plus size={16} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer - Strict Height */}
                        <div className="p-6 md:p-8 border-t border-gray-100 bg-white shrink-0 flex flex-col gap-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-center px-2 mb-2">
                                <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">Cuenta Parcial</span>
                                <span className="font-black text-3xl text-gray-900">${modalTotal}</span>
                            </div>

                            <div className="flex gap-4">
                                {isMainDish ? (
                                    <>
                                        {modalStep === "extras" && (
                                            <button
                                                onClick={() => setModalStep("bebidas")}
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 md:py-5 text-lg rounded-2xl active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(249,115,22,0.5)] flex justify-center items-center gap-3"
                                            >
                                                Siguiente: Bebidas <ArrowRight size={22} />
                                            </button>
                                        )}
                                        {modalStep === "bebidas" && (
                                            <>
                                                <button
                                                    onClick={() => setModalStep("extras")}
                                                    className="w-1/3 py-4 md:py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                                                >
                                                    Atrás
                                                </button>
                                                <button
                                                    onClick={() => setModalStep("botanas")}
                                                    className="w-2/3 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 md:py-5 text-lg rounded-2xl active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.5)] flex justify-center items-center gap-3"
                                                >
                                                    Siguiente: Botanas <ArrowRight size={22} />
                                                </button>
                                            </>
                                        )}
                                        {modalStep === "botanas" && (
                                            <>
                                                <button
                                                    onClick={() => setModalStep("bebidas")}
                                                    className="w-1/3 py-4 md:py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                                                >
                                                    Atrás
                                                </button>
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="w-2/3 bg-gray-900 hover:bg-black text-white font-black py-4 md:py-5 text-lg rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-3"
                                                >
                                                    Terminar y Agregar
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 md:py-5 text-lg rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20"
                                    >
                                        Agregar al Pedido
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
