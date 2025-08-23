
import React from "react";
import { ProposalList } from "./ProposalList";
import { CreateProposalModal } from "./CreateProposalModal";
import { useProposals } from "./useProposals";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ProposalOverview() {
  const {
    proposals,
    loading,
    handleVote,
    activateProposal,
    setProjectStatus,
    updateProposal,
    handlePayoutRequest,
    fetchProposals,
  } = useProposals();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProposals = proposals.filter((proposal) => proposal.status !== 3); // 3 = rejected status

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleProposalCreated = () => {
    // Refresh proposals when a new one is created
    console.log("Proposal created, fetching updated proposals...");
    fetchProposals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proposals</h2>
          <p className="text-muted-foreground">
            Vote on community proposals and help shape the future of the DAO
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-dao-primary hover:bg-dao-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      <ProposalList
        proposals={filteredProposals}
        loading={loading}
        onVote={handleVote}
        onActivate={activateProposal}
        onUpdateProposal={updateProposal}
        onRequestPayout={handlePayoutRequest}
        onUpdateProjectStatus={setProjectStatus}
        showActivateButton={false}
      />

      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onProposalCreated={handleProposalCreated}
      />
    </div>
  );
}
