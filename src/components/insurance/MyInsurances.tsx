import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, Calendar, Check, AlertCircle, Clock, XCircle, CreditCard, Eye, History, Copy, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useSubscribedInsurances } from '@/hooks/useSubscribedInsurances';
import { useContract } from '@/components/contract/useContract';
import { toast } from 'sonner';
import { truncateAddress } from '@/lib/utils';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { handleContractCall } from '@/lib/contractUtils';
import { parseEther } from 'ethers';
import { GOVERNANCE_ABI, MEMBERS_ABI, PAYOUTS_ABI } from '@/abis/abi';

export function MyInsurances() {
  const { subscribedInsurances, loading, refreshSubscriptions } =
    useSubscribedInsurances();
  const { contracts, loading: contractLoading } = useContract();
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [claimLoading, setClaimLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [paymentAmount, setPaymentAmount] = useState<{ [key: number]: string }>(
    {}
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState<{
    [key: number]: boolean;
  }>({});

  const handleClaim = async (insuranceId: number) => {
    if (!contracts.governanceContract) {
      toast.error(
        "Contracts not initialized. Please check your wallet connection."
      );
      return;
    }

    setClaimLoading((prev) => ({ ...prev, [insuranceId]: true }));

    try {
      console.log("Filing claim for insurance ID:", insuranceId);

      const txOptions = { gasLimit: 500000 };

      await handleContractCall({
        fn: async () => {
          if (!contracts.governanceContract.claim) {
            throw new Error("Claim function not found on governance contract");
          }

          await contracts.governanceContract.claim.staticCall(
            insuranceId,
            txOptions
          );
          return contracts.governanceContract.claim(insuranceId, txOptions);
        },
        abi: GOVERNANCE_ABI,
        onSuccess: async (tx) => {
          toast.info("Claim request processing...");
          await tx.wait();
          toast.success("Claim request submitted successfully!");
          await refreshSubscriptions();
        },
      });
    } catch (error) {
      console.error("Claim filing error:", error);
      toast.error("Failed to file claim request. Please try again.");
    } finally {
      setClaimLoading((prev) => ({ ...prev, [insuranceId]: false }));
    }
  };

  const handlePayPremium = async (insuranceId: number) => {
    if (!contracts.membersContract) {
      toast.error("Contracts not initialized");
      return;
    }

    const amount = paymentAmount[insuranceId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setPaymentLoading((prev) => ({ ...prev, [insuranceId]: true }));

    try {
      const txOptions = {
        value: parseEther(amount),
        gasLimit: 300000,
      };

      await handleContractCall({
        fn: async () => {
          await contracts.membersContract.updateInsurancePayment.staticCall(
            insuranceId,
            txOptions
          );
          return contracts.membersContract.updateInsurancePayment(
            insuranceId,
            txOptions
          );
        },
        abi: MEMBERS_ABI,
        onSuccess: async (tx) => {
          toast.info("Payment processing...");
          await tx.wait();
          toast.success("Premium payment successful!");
          setPaymentModalOpen((prev) => ({ ...prev, [insuranceId]: false }));
          setPaymentAmount((prev) => ({ ...prev, [insuranceId]: "" }));
          await refreshSubscriptions();
        },
      });
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [insuranceId]: false }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const openProjectDetails = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsDetailsModalOpen(true);
  };

  const openTransactionHistory = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsTransactionModalOpen(true);
  };

  const getProjectStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return {
          label: "Active",
          color: "bg-dao-primary text-black",
          icon: ShieldCheck,
        };
      case 1:
        return {
          label: "Inactive",
          color: "bg-gray-500 text-white",
          icon: Clock,
        };
      case 2:
        return {
          label: "Completed",
          color: "bg-green-500 text-white",
          icon: Check,
        };
      case 3:
        return {
          label: "Failed",
          color: "bg-red-500 text-white",
          icon: XCircle,
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-400 text-white",
          icon: AlertCircle,
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
        <p className="mt-2 text-foreground/70">Loading your insurances...</p>
      </div>
    );
  }

  // Filter out insurances that have claim requests
  const activeInsurances = subscribedInsurances.filter(insurance => !insurance.isRequestForClaim);

  if (activeInsurances.length === 0) {
    return (
      <Card className="glass-card overflow-hidden backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-dao-dark-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-dao-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Active Insurances</h3>
          <p className="text-foreground/70">
            You don't have any active insurance policies. Claim requests are moved to the payouts section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeInsurances.map((insurance) => {
          const statusInfo = getProjectStatusInfo(insurance.projectStatus);
          const StatusIcon = statusInfo.icon;
          
          // Updated claim button logic - show for completed projects that aren't claimed and don't have active claim requests
          const showClaimButton = Number(insurance.projectStatus) === 2 && !insurance.isClaimed && !insurance.isRequestForClaim;
          const isCompleted = Number(insurance.projectStatus) === 2;

          console.log(`Insurance ${insurance.insuranceId}:`, {
            projectStatus: insurance.projectStatus,
            isClaimed: insurance.isClaimed,
            isRequestForClaim: insurance.isRequestForClaim,
            isEligibleForClaim: insurance.isEligibleForClaim,
            showClaimButton
          });

          // Get latest payment for recent payments display
          const latestPayment =
            insurance.paymentHistory.length > 0
              ? insurance.paymentHistory.sort(
                  (a, b) => b.timestamp - a.timestamp
                )[0]
              : null;

          return (
            <Card
              key={insurance.insuranceId}
              className="glass-card overflow-hidden h-full flex flex-col relative backdrop-blur-xl border-white/20 shadow-[0_0_15px_rgba(0,255,148,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dao-dark-accent/40 to-transparent pointer-events-none"></div>

              <CardHeader className="bg-dao-dark-accent/40 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insurance.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${statusInfo.color} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    {insurance.isClaimed && (
                      <Badge className="bg-blue-500 text-white">
                        <Check className="mr-1 h-3 w-3" /> Claimed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-4 flex-grow relative z-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="flex items-center gap-1 text-foreground/50 mb-2">
                        <Calendar size={12} /> Start Date
                      </span>
                      <span className="font-medium">
                        {formatDateOnly(insurance.startDate)}
                      </span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">
                        Premium
                      </span>
                      <span className="font-medium">
                        {insurance.installmentFee} ETH
                      </span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">
                        Total Paid
                      </span>
                      <span className="font-medium">
                        {insurance.totalPaid} ETH
                      </span>
                    </div>
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="text-foreground/50 mb-2 block">
                        Months Paid
                      </span>
                      <span className="font-medium">
                        {insurance.monthsPaid}
                      </span>
                    </div>
                  </div>

                  {/* Next Due Date */}
                  <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="text-foreground/50 mb-2 block text-xs">
                      Next Due Date
                    </span>
                    <span className="font-medium text-sm">
                      {formatDateOnly(insurance.nextPaymentDate)}
                    </span>
                  </div>

                  {/* Recent Payment */}
                  {latestPayment && (
                    <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
                      <span className="flex items-center gap-1 text-foreground/50 mb-2 text-xs">
                        <History size={12} /> Recent Payment
                      </span>
                      <div className="text-xs text-dao-primary font-medium">
                        {latestPayment.amount} ETH
                      </div>
                      <div className="text-xs text-foreground/60 mt-1">
                        {format(
                          new Date(latestPayment.timestamp * 1000),
                          "MMM dd, yyyy"
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-foreground/60 flex items-center gap-2">
                    <span>
                      Proposed by{" "}
                      {truncateAddress(insurance.proposer, 6, 4) ||
                        "Unknown Proposer"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-dao-dark-accent/30"
                      onClick={() => copyToClipboard(insurance.proposer)}
                    >
                      <Copy size={10} />
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-dao-dark-accent/40 p-4 border-t border-white/20 space-y-2">
                <div className="w-full space-y-2">
                  {/* Action Buttons Row */}
                  <div className="flex gap-2">
                    {showClaimButton && (
                      <Button
                        className="flex-1 bg-gradient-to-r from-dao-primary/80 to-dao-tertiary/80 hover:from-green-500 hover:to-green-600 text-black font-medium text-xs"
                        onClick={() => handleClaim(insurance.insuranceId)}
                        disabled={
                          claimLoading[insurance.insuranceId] ||
                          contractLoading ||
                          !contracts.governanceContract
                        }
                      >
                        {claimLoading[insurance.insuranceId] ? "Processing..." : "Request Claim"}
                      </Button>
                    )}

                    <Dialog
                      open={paymentModalOpen[insurance.insuranceId] || false}
                      onOpenChange={(open) =>
                        setPaymentModalOpen((prev) => ({
                          ...prev,
                          [insurance.insuranceId]: open,
                        }))
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-gradient-to-r from-dao-primary/80 to-dao-tertiary/80 hover:from-dao-primary hover:to-dao-tertiary text-black font-medium text-xs">
                          <CreditCard className="mr-1 h-3 w-3" />
                          Pay Premium
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card bg-dao-dark border border-white/20 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle>Pay Premium</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount">Payment Amount (ETH)</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.001"
                              placeholder="Enter amount in ETH"
                              value={paymentAmount[insurance.insuranceId] || ""}
                              onChange={(e) =>
                                setPaymentAmount((prev) => ({
                                  ...prev,
                                  [insurance.insuranceId]: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                            <p className="text-xs text-foreground/60 mt-1">
                              Suggested: {insurance.installmentFee} ETH
                            </p>
                          </div>
                          <Button
                            onClick={() =>
                              handlePayPremium(insurance.insuranceId)
                            }
                            disabled={paymentLoading[insurance.insuranceId]}
                            className="w-full"
                          >
                            {paymentLoading[insurance.insuranceId]
                              ? "Processing..."
                              : "Pay Now"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Secondary Buttons Row */}
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
                      <Receipt className="mr-1 h-3 w-3" />
                      Transactions
                    </Button>
                  </div>

                  {/* Status Messages and Debug Info */}
                  <div className="text-xs text-foreground/60 space-y-1">
                    {insurance.isClaimed && (
                      <div className="w-full text-center text-sm text-blue-400 font-medium">
                        Claim Already Processed
                      </div>
                    )}
                    {isCompleted &&
                      !insurance.isEligibleForClaim &&
                      !insurance.isClaimed && (
                        <div className="w-full text-center text-sm text-foreground/70">
                          Not Eligible for Claim
                        </div>
                      )}
                  </div>

                
                </div>
              </CardFooter>
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
