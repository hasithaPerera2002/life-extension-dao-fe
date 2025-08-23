
import React, { useState } from 'react';
import { useWallet } from '@/components/wallet/useWallet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { WalletInfo } from '@/components/wallet/WalletInfo';

export function Navbar() {
  const { connect, disconnect, address, isConnected, chainId } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-dao-dark/80 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">InsuraX</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-foreground/80 hover:text-dao-primary transition-colors">Dashboard</a>
          <a href="/proposals" className="text-foreground/80 hover:text-dao-primary transition-colors">Proposals</a>
          <a href="/membership" className="text-foreground/80 hover:text-dao-primary transition-colors">Membership</a>
          <a href="/insurance" className="text-foreground/80 hover:text-dao-primary transition-colors">Insurance</a>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <WalletInfo />
          ) : (
            <Button 
              onClick={connect}
              className="bg-gradient-to-r from-dao-primary to-dao-tertiary hover:opacity-90 text-black font-medium"
            >
              Connect Wallet
            </Button>
          )}
          
          <button 
            className="md:hidden neo-button p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </nav>
  );
}
