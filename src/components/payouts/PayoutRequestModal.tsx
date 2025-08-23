
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProposalData } from "../proposals/types";

interface PayoutRequestModalProps {
  proposal: ProposalData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposalId: number, amount: string, reason: string) => Promise<void>;
}

export function PayoutRequestModal({ proposal, isOpen, onClose, onSubmit }: PayoutRequestModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(proposal.id, amount, reason);
      onClose();
      setAmount("");
      setReason("");
    } catch (error) {
      console.error("Error requesting payout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-dao-dark border-dao-dark-accent">
        <DialogHeader>
          <DialogTitle className="text-dao-primary">Request Payout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Project: {proposal.title}</Label>
            <p className="text-sm text-foreground/70">
              Original funding: {proposal.amount} ETH
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payout Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-dao-dark-accent border-dao-dark-accent/50"
              placeholder="0.0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Payout</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-dao-dark-accent border-dao-dark-accent/50 min-h-[100px]"
              placeholder="Explain why you're requesting this payout..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-dao-dark-accent/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-dao-primary hover:bg-dao-primary/90"
            >
              {loading ? "Submitting..." : "Request Payout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
