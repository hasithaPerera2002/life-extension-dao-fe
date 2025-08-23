
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalData } from "./types";
import { toast } from "sonner";

interface ProjectStatusModalProps {
  proposal: ProposalData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (proposalId: number, status: number) => Promise<void>;
}

enum ProjectStatus {
  Active = 0,
  Inactive = 1,
  Completed = 2,
  Failed = 3,
}

const PROJECT_STATUS_LABELS = {
  [ProjectStatus.Active]: "Active",
  [ProjectStatus.Inactive]: "Inactive", 
  [ProjectStatus.Completed]: "Completed",
  [ProjectStatus.Failed]: "Failed",
};

export function ProjectStatusModal({ 
  proposal, 
  isOpen, 
  onClose, 
  onUpdateStatus 
}: ProjectStatusModalProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (value: string) => {
    const newStatus = parseInt(value);
    
    if (newStatus === proposal.projectStatus) {
      return; // No change needed
    }

    setLoading(true);
    toast.info("Updating project status...");

    try {
      await onUpdateStatus(proposal.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Error updating project status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-dao-dark border-dao-dark-accent">
        <DialogHeader>
          <DialogTitle className="text-dao-primary">Update Project Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectStatus">Project Status</Label>
            <Select
              value={(proposal.projectStatus || ProjectStatus.Active).toString()}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger className="bg-dao-dark-accent border-dao-dark-accent/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dao-dark border-dao-dark-accent">
                {Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="text-sm text-foreground/70 text-center">
              Updating project status...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
