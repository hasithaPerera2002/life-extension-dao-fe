
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Link, Image, FileVideo, Calendar, ShieldCheck, Check, AlertCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { truncateAddress } from '@/lib/utils';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insurance: {
    title: string;
    description: string;
    proposer: string;
    createdDate: number;
    projectStatus: number;
    projectLink: string;
    projectImageLink: string;
    projectVideoLink: string;
  };
}

export function ProjectDetailsModal({ isOpen, onClose, insurance }: ProjectDetailsModalProps) {
  const getProjectStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Active', color: 'bg-dao-primary text-black', icon: ShieldCheck };
      case 1:
        return { label: 'Inactive', color: 'bg-gray-500 text-white', icon: Clock };
      case 2:
        return { label: 'Completed', color: 'bg-green-500 text-white', icon: Check };
      case 3:
        return { label: 'Failed', color: 'bg-red-500 text-white', icon: XCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-400 text-white', icon: AlertCircle };
    }
  };

  const statusInfo = getProjectStatusInfo(insurance.projectStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card bg-dao-dark border border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,148,0.2)] max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{insurance.title}</DialogTitle>
            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {insurance.description || "No description available"}
            </p>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
              <span className="flex items-center gap-2 text-foreground/50 mb-1 text-sm">
                <Calendar size={14} /> Created Date
              </span>
              <span className="font-medium text-sm">
                {format(new Date(insurance.createdDate), "MMMM dd, yyyy")}
              </span>
            </div>
            <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
              <span className="flex items-center gap-2 text-foreground/50 mb-1 text-sm">
                Proposer
              </span>
              <span className="font-medium text-xs">
                {truncateAddress(insurance.proposer, 6, 4) || "Unknown Proposer"}
              </span>
            </div>
          </div>

          {/* Proposer */}

          {/* Project Links */}
          {(insurance.projectLink ||
            insurance.projectImageLink ||
            insurance.projectVideoLink) && (
            <div>
              <h4 className="font-medium mb-3">Project Resources</h4>
              <div className="flex flex-wrap gap-3">
                {insurance.projectLink && (
                  <a
                    href={insurance.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-dao-dark-accent/30 px-3 py-2 rounded-lg hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10 text-sm transition-colors"
                  >
                    <Link size={16} />
                    Project Link
                  </a>
                )}
                {insurance.projectImageLink && (
                  <a
                    href={insurance.projectImageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-dao-dark-accent/30 px-3 py-2 rounded-lg hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10 text-sm transition-colors"
                  >
                    <Image size={16} />
                    Image
                  </a>
                )}
                {insurance.projectVideoLink && (
                  <a
                    href={insurance.projectVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-dao-dark-accent/30 px-3 py-2 rounded-lg hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10 text-sm transition-colors"
                  >
                    <FileVideo size={16} />
                    Video
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
