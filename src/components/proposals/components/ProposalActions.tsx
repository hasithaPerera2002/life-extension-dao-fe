
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Settings, Loader2 } from "lucide-react";
import { useWallet } from "@/components/wallet/useWallet";
import { VotingLoadingModal } from "./VotingLoadingModal";

interface ProposalActionsProps {
  proposal: any;
  onVote: (voteInFavor: boolean) => void;
  onActivate?: () => void;
  onRequestPayout?: () => void;
  onUpdateProjectStatus?: () => void;
  canRequestPayout: boolean;
  canUpdateProjectStatus: boolean;
  votingLoading?: boolean;
  actionLoading?: boolean;
}

export function ProposalActions({
  proposal,
  onVote,
  onActivate,
  onRequestPayout,
  onUpdateProjectStatus,
  canRequestPayout,
  canUpdateProjectStatus,
  votingLoading = false,
  actionLoading = false,
}: ProposalActionsProps) {
  const { isConnected } = useWallet();
  const [currentVote, setCurrentVote] = useState<"yes" | "no" | null>(null);
  
  const isDisabled = !isConnected || proposal.active || votingLoading || actionLoading;

  const handleVote = (voteInFavor: boolean) => {
    setCurrentVote(voteInFavor ? "yes" : "no");
    onVote(voteInFavor);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        { !proposal.active && (
          <Button
            variant="outline"
            size="sm"
            className="border-dao-primary/30 text-dao-primary hover:bg-dao-primary/10"
            onClick={onActivate}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate'
            )}
          </Button>
        )}

        {canUpdateProjectStatus && onUpdateProjectStatus && (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={onUpdateProjectStatus}
            disabled={actionLoading}
          >
            <Settings size={14} className="mr-1" />
            Status
          </Button>
        )}

        {canRequestPayout && onRequestPayout && (
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            onClick={onRequestPayout}
            disabled={actionLoading}
          >
            Request Payout
          </Button>
        )}

        {proposal.userHasVoted ? (
          <Badge
            variant="outline"
            className={`${
              proposal.userVotedYes 
                ? "border-green-500/30 text-green-400" 
                : "border-red-500/30 text-red-400"
            }`}
          >
            <Check size={14} className="mr-1" />
            Voted {proposal.userVotedYes ? "Yes" : "No"}
          </Badge>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              disabled={isDisabled}
              onClick={() => handleVote(false)}
            >
              Vote No
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-dao-primary/30 text-dao-primary hover:bg-dao-primary/10"
              disabled={isDisabled}
              onClick={() => handleVote(true)}
            >
              Vote Yes
            </Button>
          </>
        )}
      </div>

      <VotingLoadingModal 
        isOpen={votingLoading} 
        voteType={currentVote} 
      />
    </>
  );
}
