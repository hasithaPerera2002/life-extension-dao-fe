
import React, { useState } from 'react';
import { useWallet } from '@/components/wallet/useWallet';
import { Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { isConnected, memberStatus } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMember = memberStatus.isMember;
  
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-dao-dark/80 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">InsuraX</span>
        </div>
        
        {isConnected && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground/80 hover:text-dao-primary transition-colors">Dashboard</Link>
            <Link to="/membership" className="text-foreground/80 hover:text-dao-primary transition-colors">Membership</Link>
            {isMember ? (
              <>
                <Link to="/proposals" className="text-foreground/80 hover:text-dao-primary transition-colors">Proposals</Link>
                <Link to="/insurance" className="text-foreground/80 hover:text-dao-primary transition-colors">Insurance</Link>
              </>
            ) : (
              <>
                <span className="text-foreground/40 cursor-not-allowed" title="Join DAO to unlock">Proposals</span>
                <span className="text-foreground/40 cursor-not-allowed" title="Join DAO to unlock">Insurance</span>
              </>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <WalletInfo />
          
          {isConnected && (
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
          )}
        </div>
      </div>
      
      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </nav>
  );
}
