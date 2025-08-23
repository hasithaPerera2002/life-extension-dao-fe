
import React from "react";
import { ProposalItem } from "./ProposalItem";
import { ProposalData } from "./types";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProposalListProps {
  proposals: ProposalData[];
  loading: boolean;
  onVote: (proposalId: number, voteInFavor: boolean) => Promise<void>;
  onActivate?: (proposalId: number) => Promise<void>;
  onUpdateProposal?: (proposalId: number, updates: any) => Promise<void>;
  onRequestPayout?: (proposalId: number, amount: string, reason: string) => Promise<void>;
  onUpdateProjectStatus?: (proposalId: number, status: number) => Promise<void>;
  showActivateButton?: boolean;
}

export function ProposalList({ 
  proposals, 
  loading, 
  onVote, 
  onActivate, 
  onUpdateProposal,
  onRequestPayout,
  onUpdateProjectStatus,
  showActivateButton 
}: ProposalListProps) {
  if (loading) {
    return (
      <Card className="p-8 text-center bg-dao-dark border-dao-dark-accent">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-dao-primary" />
        <p className="text-foreground/70">Loading proposals...</p>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="p-8 text-center bg-dao-dark border-dao-dark-accent">
        <p className="text-foreground/70">No proposals found</p>
        <p className="text-sm text-foreground/50 mt-2">
          Be the first to create a proposal for the community
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2 border border-dao-dark-accent/30 rounded-lg  overflow-hidden">
      {proposals.map((proposal, index) => (
        <div key={proposal.id}>
          <ProposalItem
            proposal={proposal}
            onVote={onVote}
            onActivate={onActivate}
            onUpdateProposal={onUpdateProposal}
            onRequestPayout={onRequestPayout}
            onUpdateProjectStatus={onUpdateProjectStatus}
            showActivateButton={showActivateButton}
          />
          <div className="border-t border-dao-dark-accent/30" />
        </div>
      ))}
    </div>
  );
}
