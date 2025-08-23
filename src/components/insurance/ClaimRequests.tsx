
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Eye, History } from 'lucide-react';
import { format } from 'date-fns';
import { useSubscribedInsurances } from '@/hooks/useSubscribedInsurances';
import { truncateAddress } from '@/lib/utils';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { useState } from 'react';

export function ClaimRequests() {
  const { subscribedInsurances, loading } = useSubscribedInsurances();
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Filter for claim requests
  const claimRequests = subscribedInsurances.filter(insurance => insurance.isRequestForClaim);

  const openProjectDetails = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsDetailsModalOpen(true);
  };

  const openTransactionHistory = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsTransactionModalOpen(true);
  };

  const getClaimStatusInfo = (insurance: any) => {
    if (insurance.isClaimed) {
      return {
        label: "Approved",
        color: "bg-green-500 text-white",
        icon: CheckCircle,
      };
    } else {
      return {
        label: "Pending",
        color: "bg-yellow-500 text-black",
        icon: Clock,
      };
    }
  };

  const formatDateOnly = (dateString: string): string => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dao-primary mx-auto"></div>
        <p className="mt-2 text-foreground/70">Loading claim requests...</p>
      </div>
    );
  }

  if (claimRequests.length === 0) {
    return (
      <Card className="glass-card overflow-hidden backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-dao-dark-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-dao-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Claim Requests</h3>
          <p className="text-foreground/70">
            You haven't submitted any claim requests yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claimRequests.map((insurance) => {
          const statusInfo = getClaimStatusInfo(insurance);
          const StatusIcon = statusInfo.icon;

          return (
            <Card
              key={insurance.insuranceId}
              className="glass-card overflow-hidden h-full flex flex-col relative backdrop-blur-xl border-white/20 shadow-[0_0_15px_rgba(0,255,148,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dao-dark-accent/40 to-transparent pointer-events-none"></div>

              <CardHeader className="bg-dao-dark-accent/40 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insurance.title}</CardTitle>
                  <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="py-4 flex-grow relative z-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">Premium</span>
                      <span className="font-medium">{insurance.installmentFee} ETH</span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">Total Paid</span>
                      <span className="font-medium">{insurance.totalPaid} ETH</span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">Start Date</span>
                      <span className="font-medium">{formatDateOnly(insurance.startDate)}</span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">Months Paid</span>
                      <span className="font-medium">{insurance.monthsPaid}</span>
                    </div>
                  </div>

                  <div className="text-xs text-foreground/60">
                    <span>
                      Proposed by {truncateAddress(insurance.proposer, 6, 4) || "Unknown Proposer"}
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className="bg-dao-dark-accent/40 p-4 border-t border-white/20 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10 text-xs"
                    onClick={() => openProjectDetails(insurance)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10 text-xs"
                    onClick={() => openTransactionHistory(insurance)}
                  >
                    <History className="mr-1 h-3 w-3" />
                    Transactions
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedInsurance && (
        <ProjectDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          insurance={selectedInsurance}
        />
      )}

      {/* Transaction History Modal */}
      {selectedInsurance && (
        <TransactionHistoryModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          insurance={selectedInsurance}
        />
      )}
    </>
  );
}
