import React from "react";
import { Navbar } from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "./Footer";
import { useWallet } from "@/components/wallet/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { hasWallet } = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {!hasWallet && (
        <Alert className="rounded-none border-amber-500/40 bg-amber-500/10 text-amber-200">
          <AlertDescription>
            You need a wallet to connect (e.g. MetaMask or any Ethereum/Base wallet).{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-100"
            >
              Install a wallet
            </a>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex-1 flex">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
          <div className="container max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
