import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Proposals from "./pages/Proposals";
import Membership from "./pages/Membership";
import Insurance from "./pages/Insurance";
import Admin from '@/pages/Admin';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { useWallet } from "@/components/wallet/useWallet";
import { ContractProvider } from '@/components/contract/ContractProvider';

const queryClient = new QueryClient();

function GuardedRoute({
  allow,
  redirectTo,
  children,
}: {
  allow: boolean;
  redirectTo: string;
  children: React.ReactNode;
}) {
  if (!allow) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isConnected, memberStatus } = useWallet();
  const isMember = memberStatus.isMember;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/membership"
        element={
          <GuardedRoute allow={isConnected} redirectTo="/">
            <Membership />
          </GuardedRoute>
        }
      />
      <Route
        path="/proposals"
        element={
          <GuardedRoute
            allow={isConnected && isMember}
            redirectTo={isConnected ? "/membership" : "/"}
          >
            <Proposals />
          </GuardedRoute>
        }
      />
      <Route
        path="/insurance"
        element={
          <GuardedRoute
            allow={isConnected && isMember}
            redirectTo={isConnected ? "/membership" : "/"}
          >
            <Insurance />
          </GuardedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <GuardedRoute
            allow={isConnected && isMember}
            redirectTo={isConnected ? "/membership" : "/"}
          >
            <Admin />
          </GuardedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

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
                <AppRoutes />
              </div>
            </Router>
          </ContractProvider>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
