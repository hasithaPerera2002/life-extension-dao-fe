
import React from 'react';
import { useWallet } from '@/components/wallet/useWallet';

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { isConnected } = useWallet();
  
  return (
    <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm md:hidden">
      <div className="flex flex-col gap-8 p-6 h-full">
        <div className="flex justify-end">
          <button 
            className="text-white hover:text-dao-primary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
        
        <nav className="flex flex-col gap-6 items-center text-xl">
          <a 
            href="/" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Dashboard
          </a>
          <a 
            href="/proposals" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Proposals
          </a>
          <a 
            href="/membership" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Membership
          </a>
          <a 
            href="/insurance" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Insurance
          </a>
          
          {isConnected && (
            <a 
              href="#" 
              className="text-red-500 hover:text-red-400 transition-colors py-2"
              onClick={() => {
                onClose();
              }}
            >
              Disconnect
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
