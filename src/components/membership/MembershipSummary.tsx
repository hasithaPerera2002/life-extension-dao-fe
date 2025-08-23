
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { JoinDaoModal } from './JoinDaoModal';
import { useWallet } from '@/components/wallet/useWallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Calendar, Wallet } from 'lucide-react';
import { ProposalData } from '@/components/proposals/types';
import { useProposals } from '@/components/proposals/useProposals';

// Define the insurance policy interface
interface InsurancePolicy {
  id: string;
  name: string;
  active: boolean;
  coverageAmount?: string;
  premium?: string;
  expiryDate?: Date;
  proposalId?: number;
}

export function MembershipSummary() {
  const { memberStatus, isConnected, address } = useWallet();
  const { proposals } = useProposals();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  
  // Get user's subscribed insurance policies from the blockchain
  // This should be replaced with actual API call to fetch user's policies
  const [userInsurancePolicies, setUserInsurancePolicies] = useState<InsurancePolicy[]>([]);
  
  useEffect(() => {
    // TODO: Replace this with actual API call to fetch user's insurance policies
    // For now, we're setting it to empty array to show the "no policies" state
    // When you have the API ready, replace this with:
    // fetchUserInsurancePolicies().then(setUserInsurancePolicies);
    setUserInsurancePolicies([]);
  }, [address, isConnected]);
  
  // Function to handle viewing policy details
  const handleViewPolicyDetails = (policy: InsurancePolicy) => {
    setSelectedPolicy(policy);
    setShowPolicyDetails(true);
  };
  
  // Find the corresponding proposal for the selected policy
  const findProposalById = (proposalId: number | undefined): ProposalData | undefined => {
    if (!proposalId) return undefined;
    return proposals.find(p => p.id === proposalId);
  };
  
  const selectedProposal = selectedPolicy?.proposalId ? 
    findProposalById(selectedPolicy.proposalId) : undefined;
  
  if (memberStatus.loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-40">
        <div className="h-6 w-6 border-2 border-dao-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-foreground/70">Loading membership data...</p>
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-dao-dark-accent text-dao-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Connect Wallet</h3>
        <p className="text-sm text-foreground/70 mb-4">
          Connect your wallet to view membership status
        </p>
      </div>
    );
  }
  
  if (!memberStatus.isMember) {
    return (
      <div className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-dao-dark-accent text-dao-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Not a Member</h3>
        <p className="text-sm text-foreground/70 mb-4">
          Join with a minimum contribution of 0.001 ETH to access member benefits
        </p>
        <Button 
          onClick={() => setShowJoinModal(true)}
          className="bg-dao-primary text-black hover:bg-dao-primary/90"
        >
          Join DAO
        </Button>
        
        <JoinDaoModal 
          isOpen={showJoinModal} 
          onClose={() => setShowJoinModal(false)} 
        />
      </div>
    );
  }
  
  return (
    <div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Member Since</h3>
            <p className="text-foreground/70 text-sm">
              {memberStatus.memberSince 
                ? format(new Date(Number(String(memberStatus.memberSince).padEnd(13, '0'))), 'MMM d, yyyy') 
                : 'Unknown'}
            </p>
          </div>
          <div className="bg-dao-primary/20 text-dao-primary px-3 py-1 rounded-full text-sm">
            Active
          </div>
        </div>
        
        <Separator className="bg-white/10 my-4" />
        
        <div>
          <h3 className="font-medium mb-2">Your Insurance Policies</h3>
          {userInsurancePolicies.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userInsurancePolicies.map((policy) => (
                <div 
                  key={policy.id}
                  className="flex flex-col p-3 rounded bg-dao-dark text-sm cursor-pointer hover:bg-dao-dark-accent/20 transition-colors"
                  onClick={() => handleViewPolicyDetails(policy)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{policy.name}</span>
                    <span className={policy.active 
                      ? "text-dao-primary text-xs px-2 py-0.5 bg-dao-primary/10 rounded-full"
                      : "text-foreground/50 text-xs"}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-foreground/70 space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Policy ID:</span>
                      <span>{policy.id}</span>
                    </div>
                    {policy.coverageAmount && (
                      <div className="flex justify-between">
                        <span>Coverage:</span>
                        <span>{policy.coverageAmount}</span>
                      </div>
                    )}
                    {policy.premium && (
                      <div className="flex justify-between">
                        <span>Premium:</span>
                        <span className="text-dao-primary">{policy.premium}</span>
                      </div>
                    )}
                    {policy.expiryDate && (
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span>{format(policy.expiryDate, 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-dao-dark-accent/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6 text-dao-primary/50" />
              </div>
              <h4 className="text-sm font-medium mb-1">No Policies Subscribed</h4>
              <p className="text-xs text-foreground/70 mb-3">
                You haven't subscribed to any insurance policies yet
              </p>
              <Button 
                size="sm"
                variant="outline"
                className="border-dao-primary/30 text-dao-primary hover:bg-dao-primary/10"
                onClick={() => window.location.href = '/insurance'}
              >
                Browse Available Plans
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-dao-dark-accent/50 p-4 border-t border-white/10">
        <Button 
          variant="outline"
          className="w-full border-dao-primary/30 text-dao-primary hover:bg-dao-primary/10"
          onClick={() => window.location.href = '/insurance'}
        >
          Browse Insurance Plans
        </Button>
      </div>
      
      {/* Policy Details Modal */}
      <Dialog open={showPolicyDetails} onOpenChange={setShowPolicyDetails}>
        <DialogContent className="glass-card bg-dao-dark border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-dao-primary" />
              {selectedPolicy?.name} Details
            </DialogTitle>
            <DialogDescription>
              Details about your insurance policy
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="space-y-4 py-4">
              <div className="bg-dao-dark-accent/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-dao-primary text-black">Active</Badge>
                  <span className="text-xs text-foreground/70">Policy ID: {selectedPolicy.id}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-dao-dark-accent/50 rounded-full flex items-center justify-center text-dao-primary flex-shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Coverage Amount</h4>
                      <p className="text-lg font-bold">{selectedPolicy.coverageAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-dao-dark-accent/50 rounded-full flex items-center justify-center text-dao-primary flex-shrink-0">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Premium Paid</h4>
                      <p className="text-lg font-bold">{selectedPolicy.premium}</p>
                      <p className="text-xs text-foreground/70">Last payment: {format(new Date(), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-dao-dark-accent/50 rounded-full flex items-center justify-center text-dao-primary flex-shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Coverage Period</h4>
                      <p className="text-sm">
                        From <span className="font-medium">{format(new Date(), 'MMM d, yyyy')}</span>
                        <br />
                        To <span className="font-medium">{selectedPolicy.expiryDate ? format(selectedPolicy.expiryDate, 'MMM d, yyyy') : 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedProposal && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Policy Description</h4>
                  <p className="text-sm text-foreground/80 bg-dao-dark-accent/20 p-3 rounded-lg">
                    {selectedProposal.description}
                  </p>
                </div>
              )}
              
              <div className="text-xs text-foreground/50">
                This insurance policy provides coverage according to the terms and conditions of the DAO insurance protocol. 
                For questions or claims, please contact the DAO governance committee.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <JoinDaoModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </div>
  );
}
