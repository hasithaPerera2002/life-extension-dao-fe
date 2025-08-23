import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Proposals from "./pages/Proposals";
import Membership from "./pages/Membership";
import Insurance from "./pages/Insurance";
import Admin from '@/pages/Admin';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { ContractProvider } from '@/components/contract/ContractProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <ContractProvider>
            <Toaster />
            <Sonner />
            <Router>
              <div className="min-h-screen bg-dao-dark text-foreground">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="/insurance" element={<Insurance />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </ContractProvider>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
