import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { OrdersProvider } from "@/context/OrdersContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import MesaLanding from "./pages/MesaLanding";
import Admin from "./pages/Admin";
import OrderTracking from "./pages/OrderTracking";
import DeliveryCheckout from "./pages/DeliveryCheckout";
import DeliverySuccess from "./pages/DeliverySuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrdersProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mesa/:mesaId" element={<MesaLanding />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/pedido/:orderId" element={<OrderTracking />} />
              <Route path="/checkout-domicilio" element={<DeliveryCheckout />} />
              <Route path="/pedido-domicilio/:orderId" element={<DeliverySuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </OrdersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
