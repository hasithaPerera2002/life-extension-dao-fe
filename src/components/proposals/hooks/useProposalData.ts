import { useState, useEffect } from "react";
import { useContract } from "@/components/contract/useContract";
import { useWallet } from "@/components/wallet/useWallet";
import { ProposalData } from "../types";
import { ethers, Interface } from "ethers";
import { toast } from "sonner";
import { handleContractCall } from "@/lib/contractUtils";
import { GOVERNANCE_ABI, MEMBERS_ABI, PROPOSAL_ABI } from "@/abis/abi";

export function useProposalData() {
  const { isConnected, address } = useWallet();
  const { contracts } = useContract();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      isConnected &&
      contracts.proposalContract &&
      contracts.governanceContract
    ) {
      fetchProposals();
    }
  }, [isConnected, contracts.proposalContract, contracts.governanceContract]);

  const fetchProposals = async () => {
    if (
      !contracts.proposalContract ||
      !contracts.governanceContract ||
      !address
    ) {
      return;
    }

    setLoading(true);
    try {
      const proposalCount = await contracts.proposalContract.getProposalCount();
      if (proposalCount === 0) {
        setProposals([]);
        return;
      }
      const rawProposals = await handleContractCall({
        fn: async () => {
          await contracts.proposalContract.getProposals.staticCall();
          const rawProposals = await contracts.proposalContract.getProposals();
          return rawProposals;
        },
        abi: PROPOSAL_ABI,
        onSuccess: (data) => {
          console.log("Fetched proposals successfully:", data);
        },
      });

      const formattedProposals = await Promise.all(
        rawProposals.map(async (proposal: any, index: number) => {
          const proposalId = proposal.id || index;
          let hasVoted = false;
          let userVotedYes = false;

          try {
            handleContractCall({
              fn: async () => {
                await contracts.governanceContract.isVoted.staticCall(
                  proposalId,
                  address
                );
                hasVoted = await contracts.governanceContract.isVoted(
                  proposalId,
                  address
                );
                return hasVoted;
              },
              abi: GOVERNANCE_ABI,
              onSuccess: (data) => {
              },
            });
            if (hasVoted) {
              const voteItem = localStorage.getItem(
                `vote-${address}-${proposalId}`
              );
              userVotedYes = voteItem === "yes";
            }
          } catch (error) {
            console.warn("Error checking vote status:", error);
          }

          const projectLinks = proposal.projectLinks || [];
            
          return {
            id:
              typeof proposalId === "bigint" ? Number(proposalId) : proposalId,
            title: proposal.title || "",
            description: proposal.description || "",
            proposer: proposal.proposer || "",
            votesFor:
              typeof proposal.yesVotes === "bigint"
                ? Number(proposal.yesVotes)
                : proposal.yesVotes || 0,
            votesAgainst:
              typeof proposal.noVotes === "bigint"
                ? Number(proposal.noVotes)
                : proposal.noVotes || 0,
            deadline:
              (typeof proposal.endDate === "bigint"
                ? Number(proposal.endDate)
                : proposal.endDate || 0) * 1000,
            active: Number(proposal.proposalStatus) === 1,
            status:
              typeof proposal.proposalStatus === "bigint"
                ? Number(proposal.proposalStatus)
                : proposal.proposalStatus || 0,
            userHasVoted: hasVoted,
            userVotedYes,
            projectLink: projectLinks[0] || "",
            projectImageLink: projectLinks[1] || "",
            projectVideoLink: projectLinks[2] || "",
            deadlineForApproval:
              (typeof proposal.deadlineForApproval === "bigint"
                ? Number(proposal.deadlineForApproval)
                : proposal.deadlineForApproval || 0) * 1000,
            createdDate:
              (typeof proposal.createdDate === "bigint"
                ? Number(proposal.createdDate)
                : proposal.createdDate || 0) * 1000,
            canActivate:
              proposal.proposer?.toLowerCase() === address?.toLowerCase() &&
              (typeof proposal.proposalStatus === "bigint"
                ? Number(proposal.proposalStatus)
                : proposal.proposalStatus) === 0,
            projectStatus:
              typeof proposal.projectStatus === "bigint"
                ? Number(proposal.projectStatus)
                : proposal.projectStatus || 0,
          };
        })
      );

      console.log("Formatted proposals:", formattedProposals);
      setProposals(formattedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  return {
    proposals,
    loading,
    fetchProposals,
  };
}
