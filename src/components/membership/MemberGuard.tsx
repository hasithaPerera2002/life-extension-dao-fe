
import React, { useState } from 'react';
import { useWallet } from '../wallet/useWallet';
import { Button } from '@/components/ui/button';
import { JoinDaoModal } from './JoinDaoModal';

interface MemberGuardProps {
  children: React.ReactNode;
}

export function MemberGuard({ children }: MemberGuardProps) {
  const { memberStatus, isConnected } = useWallet();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  
  if (memberStatus.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-2 border-dao-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Verifying membership status...</p>
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 gradient-text">Connect Your Wallet</h2>
          <p className="text-foreground/70 mb-4">Please connect your wallet to access DAO features</p>
          <Button 
            onClick={() => window.dispatchEvent(new Event('open-wallet-connect'))}
            className="bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }
  
  if (!memberStatus.isMember) {
    return (
      <>
        <div className="flex flex-col relative z-10 items-center justify-center h-64 space-y-6 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 gradient-text">DAO Membership Required</h2>
            <p className="text-foreground/70 mb-4">You need to join the DAO to access this feature</p>
            <Button 
              onClick={() => setJoinModalOpen(true)}
              className="bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium"
            >
              Join DAO Now
            </Button>
          </div>
        </div>
        <JoinDaoModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
      </>
    );
  }
  
  return <>{children}</>;
}
