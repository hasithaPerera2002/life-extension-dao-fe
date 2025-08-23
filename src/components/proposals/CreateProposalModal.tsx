
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useContract } from "@/components/contract/useContract";
import { toast } from "sonner";
import { useProposalForm } from "./hooks/useProposalForm";
import { ProposalFormFields } from "./components/ProposalFormFields";
import { Loader2 } from "lucide-react";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalCreated?: () => void;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  onProposalCreated,
}: CreateProposalModalProps) {
  const { loading, memberStatus } = useContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form, submitProposal } = useProposalForm();

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      await submitProposal(data);
      
      // Call the callback to refresh proposals
      if (onProposalCreated) {
        onProposalCreated();
      }
      
      toast.success("Proposal created successfully!");
      handleClose();
    } catch (error: any) {
      console.error("Failed to create proposal:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds to create proposal (requires 0.001 ETH)");
      } else if (error.message?.includes("execution reverted")) {
        toast.error("Transaction failed: " + (error.reason || "Contract execution reverted"));
      } else if (error.message?.includes("network")) {
        toast.error("Network error: Please check your connection and try again");
      } else {
        toast.error(error.reason || error.message || "Failed to create proposal");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen during submission
  if (isSubmitting) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md glass-card">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-dao-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Creating Proposal...</h3>
              <p className="text-sm text-foreground/70">
                Please confirm the transaction in your wallet and wait for confirmation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Proposal</DialogTitle>
          <DialogDescription>
            Submit a new proposal to the DAO for voting
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ProposalFormFields control={form.control} />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading || !memberStatus.isMember}
                className="bg-dao-primary text-background hover:bg-dao-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Create Proposal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
