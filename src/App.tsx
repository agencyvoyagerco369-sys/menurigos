import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import MesaLanding from "./pages/MesaLanding";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminCashRegister from "./pages/AdminCashRegister";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import OrderTracking from "./pages/OrderTracking";
import DeliveryCheckout from "./pages/DeliveryCheckout";
import DeliverySuccess from "./pages/DeliverySuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrdersProvider>
          <ProductsProvider>
            <CartProvider>
              <OfflineBanner />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/mesa/:mesaId" element={<MesaLanding />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/pedido/:orderId" element={<OrderTracking />} />
                  <Route path="/checkout-domicilio" element={<DeliveryCheckout />} />
                  <Route path="/pedido-domicilio/:orderId" element={<DeliverySuccess />} />

                  {/* Admin */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/inicio" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                  </Route>
                  <Route path="/admin/pedidos" element={<AdminLayout />}>
                    <Route index element={<AdminOrders />} />
                  </Route>
                  <Route path="/admin/productos" element={<AdminLayout />}>
                    <Route index element={<AdminProducts />} />
                  </Route>
                  <Route path="/admin/caja" element={<AdminLayout />}>
                    <Route index element={<AdminCashRegister />} />
                  </Route>
                  <Route path="/admin/reportes" element={<AdminLayout />}>
                    <Route index element={<AdminReports />} />
                  </Route>
                  <Route path="/admin/config" element={<AdminLayout />}>
                    <Route index element={<AdminSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </ProductsProvider>
        </OrdersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
