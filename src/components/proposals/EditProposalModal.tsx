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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalData } from "./types";

interface EditProposalModalProps {
  proposal: ProposalData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}

export function EditProposalModal({
  proposal,
  isOpen,
  onClose,
  onSave,
}: EditProposalModalProps) {
  const [formData, setFormData] = useState({
    title: proposal.title,
    description: proposal.description,
    endDate: proposal.deadline
      ? new Date(proposal.deadline).toISOString().slice(0, 16)
      : "",
    projectLink: proposal.projectLink || "",

    projectImageLink: proposal.projectImageLink || "",
    projectVideoLink: proposal.projectVideoLink || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-dao-dark border-dao-dark-accent">
        <DialogHeader>
          <DialogTitle className="text-dao-primary">Edit Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-dao-dark-accent border-dao-dark-accent/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-dao-dark-accent border-dao-dark-accent/50 min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="bg-dao-dark-accent border-dao-dark-accent/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectLink">Project Link</Label>
              <Input
                id="projectLink"
                type="url"
                value={formData.projectLink}
                onChange={(e) =>
                  handleInputChange("projectLink", e.target.value)
                }
                className="bg-dao-dark-accent border-dao-dark-accent/50"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectImageLink">Project Image Link</Label>
              <Input
                id="projectImageLink"
                type="url"
                value={formData.projectImageLink}
                onChange={(e) =>
                  handleInputChange("projectImageLink", e.target.value)
                }
                className="bg-dao-dark-accent border-dao-dark-accent/50"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectVideoLink">Project Video Link</Label>
              <Input
                id="projectVideoLink"
                type="url"
                value={formData.projectVideoLink}
                onChange={(e) =>
                  handleInputChange("projectVideoLink", e.target.value)
                }
                className="bg-dao-dark-accent border-dao-dark-accent/50"
                placeholder="https://..."
              />
            </div>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
