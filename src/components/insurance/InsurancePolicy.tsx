import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProposalData } from "@/components/proposals/types";
import {
  ShieldCheck,
  Calendar,
  Link,
  FileVideo,
  Image,
  Check,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { truncateAddress } from "@/lib/utils";
import { useWallet } from "@/components/wallet/useWallet";
import { useContract } from "@/components/contract/useContract";
import { toast } from "sonner";
import { handleContractCall } from "@/lib/contractUtils";
import { TransactionHistoryModal } from "./TransactionHistoryModal";
import { parseEther } from "ethers";
import { GOVERNANCE_ABI, MEMBERS_ABI } from "@/abis/abi";

interface InsurancePolicyProps {
  proposal: ProposalData;
}

export function InsurancePolicy({ proposal }: InsurancePolicyProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("0.0011");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userInsuranceData, setUserInsuranceData] = useState<any>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { loading, contracts } = useContract();
  const { isConnected, address, memberStatus } = useWallet();
  const [claimLoading, setClaimLoading] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Check if current user has subscribed to this policy
  useEffect(() => {
    checkSubscriptionStatus();
  }, [address, contracts.membersContract, proposal.id]);

  const checkSubscriptionStatus = async () => {
    if (!address || !contracts.membersContract) return;

    try {
      const userInsurances =
        await contracts.membersContract.getMemberInsurances();
      const userInsurance = userInsurances.find(
        (ins: any) => Number(ins.insuranceId || ins[0]) === proposal.id
      );

      if (userInsurance) {
        setIsSubscribed(true);
        // Convert contract data to expected format
        const formattedInsurance = {
          title: proposal.title,
          paymentHistory: Array.isArray(
            userInsurance.paymentHistory || userInsurance[7]
          )
            ? (userInsurance.paymentHistory || userInsurance[7]).map(
                (payment: any) => {
                  if (Array.isArray(payment) && payment.length >= 2) {
                    return {
                      timestamp: new Date(
                        Number(payment[0]) * 1000
                      ).toISOString(),
                      amount: (Number(payment[1]) / 1e18).toString(), // Convert from Wei to ETH
                    };
                  }
                  return {
                    timestamp: new Date(Number(payment) * 1000).toISOString(),
                    amount: (
                      Number(
                        userInsurance.installmentFee || userInsurance[1] || 0
                      ) / 1e18
                    ).toString(),
                  };
                }
              )
            : [],
          totalPaid: (
            Number(userInsurance.totalPaid || userInsurance[3] || 0) / 1e18
          ).toString(),
          installmentFee: (
            Number(userInsurance.installmentFee || userInsurance[1] || 0) / 1e18
          ).toString(),
        };
        setUserInsuranceData(formattedInsurance);
      } else {
        setIsSubscribed(false);
        setUserInsuranceData(null);
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!contracts.membersContract) {
      toast.error("Contracts not initialized");
      return;
    }

    const txOptions = {
      value: parseEther(paymentAmount),
    };

    await handleContractCall({
      fn: async () => {
        await contracts.membersContract
          .getFunction("addInsurance")
          .populateTransaction(proposal.id, txOptions);
        return contracts.membersContract.addInsurance(proposal.id, txOptions);
      },
      abi: MEMBERS_ABI,
      onSuccess: async (tx) => {
        toast.info("Transaction processing...");
        await tx.wait();
        toast.success("Successfully subscribed to insurance policy");
        setIsPaymentModalOpen(false);
        setIsSubscribed(true);
        await checkSubscriptionStatus();
      },
    });
  };

  const handleClaim = async (insuranceId: number) => {
    if (!contracts.governanceContract) {
      toast.error("Contracts not initialized. Please check your wallet connection.");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!memberStatus.isMember) {
      toast.error("Only DAO members can file claims");
      return;
    }

    setClaimLoading((prev) => ({ ...prev, [insuranceId]: true }));

    try {
      console.log("Filing claim for insurance ID:", insuranceId);
      
      const txOptions = { gasLimit: 500000 };

      await handleContractCall({
        fn: async () => {
          // First check if the function exists and do a static call
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
          toast.info("Claim processing...");
          await tx.wait();
          toast.success("Claim processed successfully!");
          await checkSubscriptionStatus();
        },
      });
    } catch (error) {
      console.error("Claim filing error:", error);
      toast.error("Failed to file claim. Please try again.");
    } finally {
      setClaimLoading((prev) => ({ ...prev, [insuranceId]: false }));
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

  const openTransactionHistory = () => {
    setIsTransactionModalOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMMM dd, yyyy");
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

  const statusInfo = getProjectStatusInfo(proposal.projectStatus || 0);
  const StatusIcon = statusInfo.icon;

  // Show subscribe button only for active status (0) and if not already subscribed
  const showSubscribeButton = proposal.projectStatus === 0 && !isSubscribed;

  // Show claim button only for completed status (2) and if subscribed
  const showClaimButton = proposal.projectStatus === 2 && isSubscribed;

  // Hide buttons entirely for inactive (1) or failed (3) status
  const hideButtons =
    proposal.projectStatus === 1 || proposal.projectStatus === 3;

  return (
    <>
      <Card className="glass-card overflow-hidden h-full flex flex-col relative backdrop-blur-xl border-white/20 shadow-[0_0_15px_rgba(0,255,148,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-dao-dark-accent/40 to-transparent pointer-events-none"></div>
        <CardHeader className="bg-dao-dark-accent/40 border-b border-white/20">
          <div className="flex items-center justify-between">
            <CardTitle>{proposal.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
              {isSubscribed && (
                <Badge variant="default" className="bg-dao-primary text-black">
                  <Check className="mr-1 h-3 w-3" /> Subscribed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-4 flex-grow relative z-10">
          <div className="space-y-4">
            <p className="text-sm text-foreground/80">
              {proposal.description.length > 150
                ? `${proposal.description.substring(0, 150)}...`
                : proposal.description}
            </p>

            {/* Important Dates */}
            <div className="flex gap-2 text-xs">
              <div className="flex-1 bg-dao-dark-accent/30 p-2 rounded-lg flex flex-col backdrop-blur-md border border-white/10">
                <span className="flex items-center gap-1 text-foreground/50 mb-1">
                  <Calendar size={12} /> Coverage Starts
                </span>
                <span className="font-medium">
                  {formatDate(proposal.createdDate)}
                </span>
              </div>
            </div>

            {/* Project Links */}
            {(proposal.projectLink ||
              proposal.projectImageLink ||
              proposal.projectVideoLink) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {proposal.projectLink && (
                  <a
                    href={proposal.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10"
                  >
                    <Link size={12} />
                    Project Link
                  </a>
                )}
                {proposal.projectImageLink && (
                  <a
                    href={proposal.projectImageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10"
                  >
                    <Image size={12} />
                    Image
                  </a>
                )}
                {proposal.projectVideoLink && (
                  <a
                    href={proposal.projectVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-dao-dark-accent/30 px-2 py-1 rounded-full hover:bg-dao-dark-accent/50 backdrop-blur-md border border-white/10"
                  >
                    <FileVideo size={12} />
                    Video
                  </a>
                )}
              </div>
            )}

            <div className="text-xs text-foreground/60 flex items-center gap-2">
              <span>Proposed by {truncateAddress(proposal.proposer)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-dao-dark-accent/30"
                onClick={() => copyToClipboard(proposal.proposer)}
              >
                <Copy size={12} />
              </Button>
            </div>
          </div>
        </CardContent>

        {!hideButtons && (
          <CardFooter className="bg-dao-dark-accent/40 p-4 border-t border-white/20">
            <div className="w-full space-y-2">
              {/* Primary Action Button */}
              <div className="flex gap-2">
                {showSubscribeButton && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-dao-primary/80 to-dao-tertiary/80 hover:from-dao-primary hover:to-dao-tertiary text-black font-medium"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={!isConnected || !memberStatus.isMember}
                  >
                    Subscribe Now
                  </Button>
                )}
                {showClaimButton && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-500 hover:to-green-600 text-white font-medium text-xs"
                    onClick={() => handleClaim(proposal.id)}
                    disabled={
                      claimLoading[proposal.id] || 
                      !contracts.governanceContract ||
                      !isConnected ||
                      !memberStatus.isMember
                    }
                  >
                    {claimLoading[proposal.id]
                      ? "Processing..."
                      : "File Claim"}
                  </Button>
                )}
              </div>

              {/* Secondary Actions for Subscribed Users */}
              {isSubscribed && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10 text-xs"
                    onClick={openTransactionHistory}
                  >
                    <Receipt className="mr-1 h-3 w-3" />
                    Transactions
                  </Button>
                </div>
              )}

              {/* Status Message */}
              {isSubscribed && !showClaimButton && (
                <div className="w-full text-center text-sm text-dao-primary font-medium">
                  You are subscribed to this policy
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="glass-card bg-dao-dark border border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,148,0.2)]">
          <DialogHeader>
            <DialogTitle>Subscribe to Insurance Policy</DialogTitle>
            <DialogDescription>
              Enter the premium amount to subscribe to "{proposal.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Premium Amount (ETH)</Label>
              <Input
                id="payment-amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.001"
                min="0.001"
                className="bg-dao-dark-accent/30 border-white/20 focus-visible:ring-dao-primary"
              />
            </div>

            <div className="text-sm text-foreground/70">
              <p className="mt-2">
                You will receive coverage for this policy for 90 days.
              </p>
              <p>
                Coverage period: {formatDate(proposal.createdDate)} -{" "}
                {formatDate(proposal.deadline)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={
                loading || !paymentAmount || parseFloat(paymentAmount) <= 0
              }
              className="bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium"
            >
              {loading ? "Processing..." : "Confirm Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      {isSubscribed && userInsuranceData && (
        <TransactionHistoryModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          insurance={userInsuranceData}
        />
      )}
    </>
  );
}
