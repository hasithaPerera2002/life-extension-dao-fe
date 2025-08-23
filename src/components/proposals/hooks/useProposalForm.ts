
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers, parseEther, parseUnits } from "ethers";
import { toast } from "sonner";
import { useContract } from "@/components/contract/useContract";
import { handleContractCall } from "@/lib/contractUtils";
import ProposalContract from "../../../abis/Proposal.json";

const proposalFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description cannot exceed 500 characters"),
  projectLink: z.string().url("Must be a valid URL").or(z.literal("")),
  imageLink: z.string().url("Must be a valid URL").or(z.literal("")),
  videoLink: z.string().url("Must be a valid URL").or(z.literal("")),
  duration: z.string().refine(
    (val) => {
      const parsed = parseInt(val);
      return !isNaN(parsed) && parsed >= 100 && parsed <= 3650;
    },
    { message: "Duration must be between 100 days and 10 years" }
  ),
});

export type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export function useProposalForm() {
  const { contracts, memberStatus } = useContract();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      projectLink: "",
      imageLink: "",
      videoLink: "",
      duration: "101",
    },
  });

  const submitProposal = async (data: ProposalFormValues) => {
    if (!contracts.proposalContract) {
      toast.error("Proposal contract not available");
      throw new Error("Contract not available");
    }

    if (!memberStatus.isMember) {
      toast.error("You must be a DAO member to create proposals");
      throw new Error("Not a member");
    }

    const durationInSeconds = parseInt(data.duration) * 86400;
    const endDate = Math.floor(Date.now() / 1000) + durationInSeconds;

    const proposalData = {
      title: data.title,
      description: data.description,
      projectLink: data.projectLink,
      projectImageLink: data.imageLink,
      projectVideoLink: data.videoLink,
      endDate: endDate,
    };

    const txOptions = {
      value: parseEther("0.01"),
      gasLimit: 1000000,
      gasPrice: parseUnits("10", "gwei"),
    };

    return await handleContractCall({
      fn: async () => {
        await contracts.proposalContract.createProposal.staticCall(proposalData, txOptions);
        const tx = await contracts.proposalContract.createProposal(proposalData, txOptions);
        
        // Wait for the transaction to be mined before resolving
        toast.info("Transaction submitted. Waiting for confirmation...");
        await tx.wait();
        console.log("Proposal creation transaction confirmed");
        
        return tx;
      },
      abi: ProposalContract.abi,
      onSuccess: async (tx) => {
        // Transaction is already confirmed at this point
        console.log("Proposal created successfully");
      },
    });
  };

  return {
    form,
    submitProposal,
  };
}
