import { useState } from "react";
import { useContract } from "@/components/contract/useContract";
import { useWallet } from "@/components/wallet/useWallet";
import { toast } from "sonner";
import { ethers, parseEther } from "ethers";
import { handleContractCall } from "@/lib/contractUtils";
import ProposalContract from "../../../abis/Proposal.json";
import PayoutsABI from "../../../abis/Payouts.json";

export function useProposalActions(onSuccess?: () => void) {
  const { isConnected, address } = useWallet();
  const { contracts } = useContract();
  const [loading, setLoading] = useState(false);

  const handleVote = async (proposalId: number, voteInFavor: boolean) => {
    if (!isConnected || !address || !contracts.proposalContract) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      console.log(`Voting on proposal ${proposalId} with vote: ${voteInFavor}`);

      const txOptions = { gasLimit: 500000 };

      await handleContractCall({
        fn: async () => {
          await contracts.proposalContract.voteProposal.staticCall(
            proposalId,
            voteInFavor,
            txOptions
          );
          return contracts.proposalContract.voteProposal(
            proposalId,
            voteInFavor,
            txOptions
          );
        },
        abi: ProposalContract.abi,
        onSuccess: async (tx) => {
          toast.info("Vote transaction submitted...");
          await tx.wait();

          localStorage.setItem(
            `vote-${address}-${proposalId}`,
            voteInFavor ? "yes" : "no"
          );

          toast.success(`Successfully voted ${voteInFavor ? "Yes" : "No"}`);

          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } catch (error) {
      console.error("Error voting on proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const activateProposal = async (proposalId: number) => {
    if (!isConnected || !address || !contracts.proposalContract) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      console.log(`Activating proposal ${proposalId}`);

      await handleContractCall({
        fn: async () => {
          await contracts.proposalContract.setProposalStatus.staticCall(
            proposalId,
            1
          );
          return contracts.proposalContract.setProposalStatus(proposalId, 1);
        },
        abi: ProposalContract.abi,
        onSuccess: async (tx) => {
          toast.info("Activating proposal...");
          await tx.wait();
          toast.success("Proposal activated successfully");

          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } catch (error) {
      console.error("Error activating proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const setProjectStatus = async (proposalId: number, status: number) => {
    if (!isConnected || !address || !contracts.proposalContract) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      console.log(
        `Setting project status for proposal ${proposalId} to ${status}`
      );

      await handleContractCall({
        fn: async () => {
          await contracts.proposalContract.setProjectStatus.staticCall(
            proposalId,
            status
          );
          return contracts.proposalContract.setProjectStatus(
            proposalId,
            status
          );
        },
        abi: ProposalContract.abi,
        onSuccess: async (tx) => {
          toast.info("Updating project status...");
          await tx.wait();
          toast.success("Project status updated successfully");

          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } catch (error) {
      console.error("Error setting project status:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProposal = async (proposalId: number, updates: any) => {
    if (!isConnected || !address || !contracts.proposalContract) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);

      const projectLinks = [
        updates.projectLink || "",
        updates.projectImageLink || "",
        updates.projectVideoLink || "",
        "",
      ];

      handleContractCall({
        fn: async () => {
          console.log(`Updating proposal ${proposalId} with data:`, updates);
          toast.info("Updating proposal...");

          const txData = await contracts.proposalContract
            .getFunction("updateProposalData")
            .populateTransaction(
              proposalId,
              {
                title: updates.title,
                description: updates.description,
                endDate: Math.floor(new Date(updates.endDate).getTime() / 1000)+ 101 * 86400,
                projectLink: projectLinks[0],
                projectImageLink: projectLinks[1],
                projectVideoLink: projectLinks[2],
              },
              {
                value: parseEther("0.001"),
                gasLimit: 500000,
              }
            );
            console.log("Transaction data:", txData);
            
          return contracts.proposalContract.updateProposalData(
            proposalId,
            {
              title: updates.title,
              description: updates.description,
              endDate: Math.floor(new Date(updates.endDate).getTime() / 1000)+ 101 * 86400,
              projectLink: projectLinks[0],
              projectImageLink: projectLinks[1],
              projectVideoLink: projectLinks[2],
            },
            {
              value: parseEther("0.0011"), // Assuming a small fee for updating
              gasLimit: 500000,
            }
          );
        },
        abi: ProposalContract.abi,
        onSuccess: async (tx) => {
          toast.info("Updating proposal...");
          await tx.wait();
          toast.success("Proposal updated successfully");
        },
      });
    } catch (error) {
      console.error("Error updating proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async (
    proposalId: number,
    amount: string,
    reason: string
  ) => {
    if (!isConnected || !address || !contracts.payoutsContract) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      console.log(
        `Requesting payout for proposal ${proposalId}: ${amount} ETH`
      );

      const txOptions = {
        value: parseEther(amount),
        gasLimit: 500000,
      };

      await handleContractCall({
        fn: async () => {
          await contracts.payoutsContract.executePayout.staticCall(
            proposalId,
            txOptions
          );
          return contracts.payoutsContract.executePayout(proposalId, txOptions);
        },
        abi: PayoutsABI.abi,
        onSuccess: async (tx) => {
          toast.info("Payout request submitted...");
          await tx.wait();
          toast.success(`Payout of ${amount} ETH requested successfully!`);
        },
      });
    } catch (error) {
      console.error("Error requesting payout:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleVote,
    activateProposal,
    setProjectStatus,
    updateProposal,
    handlePayoutRequest,
  };
}
