import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Link, FileVideo, Calendar, Vote, Image as ImageIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { toast } from "sonner";
import { ProposalData } from "./types";
import { useWallet } from "@/components/wallet/useWallet";
import { format } from "date-fns";
import { EditProposalModal } from "./EditProposalModal";
import { PayoutRequestModal } from "../payouts/PayoutRequestModal";
import { ProjectStatusModal } from "./ProjectStatusModal";
import { ProposalActions } from "./components/ProposalActions";

interface ProposalItemProps {
  proposal: ProposalData;
  onVote: (proposalId: number, voteInFavor: boolean) => Promise<void>;
  onActivate?: (proposalId: number) => Promise<void>;
  onUpdateProposal?: (proposalId: number, updates: any) => Promise<void>;
  onRequestPayout?: (proposalId: number, amount: string, reason: string) => Promise<void>;
  onUpdateProjectStatus?: (proposalId: number, status: number) => Promise<void>;
  showActivateButton?: boolean;
}

export function ProposalItem({ 
  proposal, 
  onVote, 
  onActivate, 
  onUpdateProposal, 
  onRequestPayout, 
  onUpdateProjectStatus,
  showActivateButton 
}: ProposalItemProps) {
  const { address } = useWallet();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProjectStatusModal, setShowProjectStatusModal] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const handleVote = async (voteInFavor: boolean) => {
    try {
      setVotingLoading(true);
      await onVote(proposal.id, voteInFavor);
    } catch (error) {
      console.error("Error voting on proposal:", error);
      toast.error("Failed to submit vote");
    } finally {
      setVotingLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!onActivate) return;
    try {
      setActionLoading(true);
      await onActivate(proposal.id);
    } catch (error) {
      console.error("Error activating proposal:", error);
      toast.error("Failed to activate proposal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProjectStatus = async () => {
    setShowProjectStatusModal(true);
  };

  const calculateTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const remaining = deadline - now;

    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;

    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  const formatEndDate = (deadline: number) => {
    if (!deadline) return "N/A";
    return format(new Date(deadline), "MMM dd, yyyy");
  };

  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const yesPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  
  const canActivate = showActivateButton  && proposal.votesFor > proposal.votesAgainst;
  const isOwner = address && proposal.proposer.toLowerCase() === address.toLowerCase();
  const isPending = proposal.status === 0;
  const canEdit = isOwner && isPending && !votingLoading && !actionLoading;
  const isCompleted = proposal.projectStatus === 2;
  const canRequestPayout = isOwner && isCompleted && !actionLoading;
  const canUpdateProjectStatus = isOwner && proposal.status === 1 && !actionLoading;

  // Check if funding amount is valid and greater than 0
  const fundingAmount = parseFloat(proposal.amount);
  const showFunding = !isNaN(fundingAmount) && fundingAmount > 0;

  const handleEditProposal = async (updates: any) => {
    if (onUpdateProposal) {
      try {
        setActionLoading(true);
        await onUpdateProposal(proposal.id, updates);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating proposal:", error);
        toast.error("Failed to update proposal");
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  const handlePayoutRequest = async (proposalId: number, amount: string, reason: string) => {
    if (onRequestPayout) {
      try {
        setActionLoading(true);
        await onRequestPayout(proposalId, amount, reason);
        toast.success("Payout requested successfully");
      } catch (error) {
        console.error("Error requesting payout:", error);
        toast.error("Failed to request payout");
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  const handleProjectStatusUpdate = async (proposalId: number, status: number) => {
    if (onUpdateProjectStatus) {
      try {
        setActionLoading(true);
        await onUpdateProjectStatus(proposalId, status);
        toast.success("Project status updated successfully");
      } catch (error) {
        console.error("Error updating project status:", error);
        toast.error("Failed to update project status");
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  return (
    <div className="p-4 hover:bg-white/10 bg-white/5 shadow-sm shadow-ring transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{proposal.title}</h3>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-dao-primary hover:bg-dao-primary/10"
              onClick={() => setShowEditModal(true)}
              disabled={votingLoading || actionLoading}
            >
              <Edit size={14} />
            </Button>
          )}
        </div>
       
      </div>

      <p className="text-sm text-foreground/70 mb-3 line-clamp-3">
        {proposal.description}
      </p>

      {/* Project Links Section */}
      {(proposal.projectLink ||
        proposal.projectImageLink ||
        proposal.projectVideoLink) && (
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {proposal.projectLink && (
            <a
              href={proposal.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50"
            >
              <Link size={12} />
              Project Link
            </a>
          )}
          {proposal.projectImageLink && (
            <a
              href={proposal.projectImageLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50"
            >
              <ImageIcon size={12} />
              Image
            </a>
          )}
          {proposal.projectVideoLink && (
            <a
              href={proposal.projectVideoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50"
            >
              <FileVideo size={12} />
              Video
            </a>
          )}
        </div>
      )}

      {/* Important Dates Section */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-dao-dark-accent/20 p-2 rounded flex flex-col">
          <span className="flex items-center gap-1 text-foreground/50 mb-1">
            <Calendar size={12} /> Created
          </span>
          <span className="font-medium">
            {formatDate(proposal.createdDate || 0)}
          </span>
        </div>
        <div className="bg-dao-dark-accent/20 p-2 rounded flex flex-col">
          <span className="flex items-center gap-1 text-foreground/50 mb-1">
            <Vote size={12} /> Voting Ends
          </span>
          <span className="font-medium">
            {formatDate(proposal.deadlineForApproval || 0)}
          </span>
        </div>
        <div className="bg-dao-dark-accent/20 p-2 rounded flex flex-col">
          <span className="flex items-center gap-1 text-foreground/50 mb-1">
            <Calendar size={12} /> Project Ends
          </span>
          <span className="font-medium">
            {formatEndDate(proposal.deadline)}
          </span>
        </div>
      </div>

      {/* Voting Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">
            YES: {proposal.votesFor} ({yesPercentage.toFixed(1)}%)
          </span>
          <span className="text-red-400">
            NO: {proposal.votesAgainst} ({noPercentage.toFixed(1)}%)
          </span>
        </div>

        {totalVotes > 0 ? (
          <div className="relative h-2 w-full bg-dao-dark-accent rounded-full overflow-hidden">
            {/* YES votes bar */}
            <div
              className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
              style={{ width: `${yesPercentage}%` }}
            />
            {/* NO votes bar */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-300"
              style={{ width: `${noPercentage}%` }}
            />
          </div>
        ) : (
          <div className="h-2 w-full bg-dao-dark-accent rounded-full">
            <div className="h-full w-0 bg-gray-500 rounded-full transition-all duration-300" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-foreground/70">
          {showFunding && (
            <span>Funding: {fundingAmount.toFixed(2)} ETH • </span>
          )}
          <span className="opacity-70">
            by {truncateAddress(proposal.proposer)}
          </span>
        </div>

        <ProposalActions
          proposal={{...proposal, userHasVoted: proposal.userHasVoted, userVotedYes: proposal.userVotedYes}}
          onVote={handleVote}
          onActivate={handleActivate}
          onRequestPayout={() => setShowPayoutModal(true)}
          onUpdateProjectStatus={handleUpdateProjectStatus}
          canRequestPayout={canRequestPayout}
          canUpdateProjectStatus={canUpdateProjectStatus}
          votingLoading={votingLoading}
          actionLoading={actionLoading}
        />
      </div>

      {showEditModal && (
        <EditProposalModal
          proposal={proposal}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProposal}
        />
      )}

      {showPayoutModal && (
        <PayoutRequestModal
          proposal={proposal}
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          onSubmit={handlePayoutRequest}
        />
      )}

      {showProjectStatusModal && (
        <ProjectStatusModal
          proposal={proposal}
          isOpen={showProjectStatusModal}
          onClose={() => setShowProjectStatusModal(false)}
          onUpdateStatus={handleProjectStatusUpdate}
        />
      )}
    </div>
  );
}
