
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface VotingLoadingModalProps {
  isOpen: boolean;
  voteType: "yes" | "no" | null;
}

export function VotingLoadingModal({ isOpen, voteType }: VotingLoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md glass-card">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-dao-primary" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              Voting {voteType === "yes" ? "Yes" : "No"}...
            </h3>
            <p className="text-sm text-foreground/70">
              Please confirm the transaction in your wallet and wait for confirmation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
