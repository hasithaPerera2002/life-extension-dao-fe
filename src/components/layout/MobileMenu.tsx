
import React from 'react';
import { useWallet } from '@/components/wallet/useWallet';
import { Link } from 'react-router-dom';

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { isConnected, memberStatus } = useWallet();
  const isMember = memberStatus.isMember;
  
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
          <Link 
            to="/" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link 
            to="/membership" 
            className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
            onClick={onClose}
          >
            Membership
          </Link>
          {isMember ? (
            <>
              <Link 
                to="/proposals" 
                className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
                onClick={onClose}
              >
                Proposals
              </Link>
              <Link 
                to="/insurance" 
                className="text-foreground/90 hover:text-dao-primary transition-colors py-2"
                onClick={onClose}
              >
                Insurance
              </Link>
            </>
          ) : (
            <>
              <span className="text-foreground/40 cursor-not-allowed py-2">Proposals (join required)</span>
              <span className="text-foreground/40 cursor-not-allowed py-2">Insurance (join required)</span>
            </>
          )}
          
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
