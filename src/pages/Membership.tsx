import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MembershipSummary } from "@/components/membership/MembershipSummary";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MemberGuard } from "@/components/membership/MemberGuard";
import { useProposals } from "@/components/proposals/useProposals";
import { ProposalList } from "@/components/proposals/ProposalList";
import { useWallet } from "@/components/wallet/useWallet";
import { ProposalData } from "@/components/proposals/types";
import { NetworkAnimation } from "@/components/animations/NetworkAnimation";

const Membership = () => {
  const { proposals, loading, handleVote, activateProposal,setProjectStatus } = useProposals();
  const [userProposals, setUserProposals] = useState<ProposalData[]>([]);
  const { address } = useWallet();

  useEffect(() => {
    // Filter proposals created by the current user
    if (proposals.length > 0 && address) {
      const userProposalsFiltered = proposals.filter(
        (proposal) => proposal.proposer.toLowerCase() === address.toLowerCase()
      );
      setUserProposals(userProposalsFiltered);
    }
  }, [proposals, address]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-dao-dark/80">
          <NetworkAnimation />
        </div>
        <div className="flex  items-center justify-between">
          <h1 className="text-4xl z-10 font-bold tracking-tight gradient-text">
            Memberships
          </h1>
          <div className="text-sm bg-dao-dark-accent/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-dao-primary">Explore</span> /{" "}
            <span>Memberships</span>
          </div>
        </div>
        <MemberGuard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card className="glass-card max-h-[60vh] overflow-hidden h-full">
                <MembershipSummary />
              </Card>
            </div>

            <div>
              <Card className="glass-card overflow-hidden">
                <CardHeader className="bg-dao-dark-accent/30 border-b border-white/10">
                  <CardTitle>Your Proposals</CardTitle>
                  <CardDescription>Proposals you have created</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ProposalList
                    proposals={userProposals}
                    loading={loading}
                    onVote={handleVote}
                    onActivate={activateProposal}
                    showActivateButton={true}
                    onUpdateProjectStatus={setProjectStatus}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </MemberGuard>
      </div>
    </Layout>
  );
};

export default Membership;
