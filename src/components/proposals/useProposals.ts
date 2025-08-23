
import { useProposalData } from "./hooks/useProposalData";
import { useProposalActions } from "./hooks/useProposalActions";

export function useProposals() {
  const { proposals, loading, fetchProposals } = useProposalData();
  const { 
    handleVote, 
    activateProposal, 
    setProjectStatus,
    updateProposal, 
    handlePayoutRequest 
  } = useProposalActions(fetchProposals);

  return {
    proposals,
    loading,
    handleVote,
    fetchProposals,
    activateProposal,
    setProjectStatus,
    updateProposal,
    handlePayoutRequest,
  };
}
