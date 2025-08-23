
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MemberGuard } from '@/components/membership/MemberGuard';
import { useProposals } from '@/components/proposals/useProposals';
import { ProposalData } from '@/components/proposals/types';
import { InsurancePolicy } from '@/components/insurance/InsurancePolicy';
import { MyInsurances } from '@/components/insurance/MyInsurances';
import { ClaimRequests } from '@/components/insurance/ClaimRequests';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck } from 'lucide-react';
import { NetworkAnimation } from '@/components/animations/NetworkAnimation';

const Insurance = () => {
  const { proposals, loading } = useProposals();
  const [activeProposals, setActiveProposals] = useState<ProposalData[]>([]);

  useEffect(() => {
    // Filter to only show approved and active proposals (status = 1) that are not completed
    if (proposals.length > 0) {
      const filtered = proposals.filter(proposal => 
        proposal.status === 1 && proposal.projectStatus !== 2
      );
      setActiveProposals(filtered);
    }
  }, [proposals]);
  
  return (
    <Layout>
      <div className="space-y-6 relative min-h-[80vh]">
        {/* Network Animation Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-dao-dark/80">
        
          <NetworkAnimation />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Insurances</h1>
          <div className="text-sm bg-dao-dark-accent/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-dao-primary">Explore</span> /{" "}
            <span>Insurances</span>
          </div>
        </div>

        <MemberGuard>
          <Tabs defaultValue="available" className="w-full relative z-10">
            <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
              <TabsTrigger value="available">Available Policies</TabsTrigger>
              <TabsTrigger value="my-insurances">My Insurances</TabsTrigger>
              <TabsTrigger value="claim-requests">Claim Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {activeProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProposals.map(proposal => (
                    <InsurancePolicy key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              ) : (
                <Card className="glass-card overflow-hidden backdrop-blur-xl border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-dao-dark-accent/30 to-transparent pointer-events-none"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <div className="w-16 h-16 bg-dao-dark-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={32} className="text-dao-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Active Policies</h3>
                    <p className="text-foreground/70">
                      There are currently no active insurance policies available for subscription.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="my-insurances">
              <MyInsurances />
            </TabsContent>

            <TabsContent value="claim-requests">
              <ClaimRequests />
            </TabsContent>
          </Tabs>
        </MemberGuard>
      </div>
    </Layout>
  );
};

export default Insurance;
