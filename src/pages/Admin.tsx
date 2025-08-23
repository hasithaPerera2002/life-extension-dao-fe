import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContract } from "@/components/contract/useContract";
import { useWallet } from "@/components/wallet/useWallet";
import { format } from "date-fns";
import { truncateAddress } from "@/lib/utils";
import { DollarSign, Users, Clock, CheckCircle } from "lucide-react";
import { NetworkAnimation } from "@/components/animations/NetworkAnimation";
import { handleContractCall } from "@/lib/contractUtils";
import { toast } from "sonner";
import { BrowserProvider, parseEther, formatEther } from "ethers";
import Safe, {
  createERC20TokenTransferTransaction,
} from "@safe-global/protocol-kit";
import { SUPPORTED_NETWORKS } from "@/components/wallet/WalletProvider";
import { CONTRACT_ADDRESSES } from "@/constants/address";
import { PAYOUTS_ABI } from "@/abis/abi";
interface PayoutData {
  proposalId: number;
  member: string;
  amount: string;
  timestamp: number;
  claimed: boolean;
  claimTimestamp: number;
}

const Admin = () => {
  const [payoutsData, setPayoutsData] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [processingPayouts, setProcessingPayouts] = useState<Set<number>>(
    new Set()
  );
  const [safeInstance, setSafeInstance] = useState<Safe | null>(null);

  const [safeConnected, setSafeConnected] = useState(false);
  const [safeAddress] = useState("0xf42edc3A4fDaE8fCF73702712FCaCa1a46f56cc3");
  const { contracts } = useContract();
  const { address, memberStatus, provider, signer } = useWallet();

  useEffect(() => {
    if (address && contracts.membersContract) {
      checkAdminStatus();
    }
  }, [address, contracts.membersContract]);

  useEffect(() => {
    if (contracts.payoutsContract && isAdmin) {
      loadPayoutsData();
    }
  }, [contracts.payoutsContract, isAdmin]);

  useEffect(() => {
    if (provider && signer && isAdmin) {
      initializeSafe();
    }
  }, [provider, signer, isAdmin]);

  const checkAdminStatus = async () => {
    if (!contracts.membersContract || !address) {
      setCheckingAdmin(false);
      return;
    }

    try {
      await handleContractCall({
        fn: async () => {
          const adminStatus = await contracts.membersContract.isOwner();
          setIsAdmin(adminStatus);
          return adminStatus;
        },
        abi: [],
        onSuccess: (result) => {
          setIsAdmin(result);
        },
      });
    } catch (error) {
      console.error("Failed to check admin status:", error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadPayoutsData = async () => {
    if (!contracts.payoutsContract) return;

    setLoading(true);
    console.log("Loading payouts data...");

    try {
      await handleContractCall({
        fn: async () => {
          return contracts.payoutsContract.getPayoutData();
        },
        abi: [],
        onSuccess: (data) => {
          const formattedData = data.map((payout: any) => ({
            proposalId: payout.proposalId,
            member: payout.member,
            amount: Number(payout.amount),
            timestamp: Number(payout.timestamp) * 1000,
            claimed: payout.claimed,
            claimTimestamp: Number(payout.claimTimestamp) * 1000,
          }));
          console.log("Payouts data loaded:", formattedData);
          setPayoutsData(formattedData);
        },
      });
    } catch (error) {
      console.error("Failed to load payouts data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSafe = async () => {
    try {
      const ethereum = window.ethereum;
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      if (!provider || !signer) {
        console.warn("Provider or signer not available");
        return;
      }
      const safe = await Safe.init({
        safeAddress: safeAddress,
        provider: window.ethereum,
        signer: signer.address,
      });

      setSafeInstance(safe);
      toast.success("Safe wallet connected successfully");
      setSafeConnected(true);
    } catch (error) {
      console.error("Failed to initialize Safe:", error);
      toast.error("Failed to connect to Safe wallet");
    }
  };

  const handlePayoutClaim = async (
    proposalId: number,
    memberAddress: string,
    amount: string
  ) => {
    if (!contracts.payoutsContract)
      return toast.error("Payouts contract not available");
    if (!safeInstance) return toast.error("Safe wallet not connected");

    setProcessingPayouts((prev) => new Set(prev).add(proposalId));

    try {
      const ethAmount = formatAmount(amount);

      // Encode call to setPayoutStatus
      const encodedCall = contracts.payoutsContract.interface.encodeFunctionData(
        "setPayoutStatus",
        [proposalId, memberAddress, true, parseEther(ethAmount)]
      );

      const transaction = await safeInstance.createTransaction({
        transactions: [
          {
            to: memberAddress,
            value: parseEther(ethAmount).toString(),
            data: "0x",
          }
        ],
      });

      toast.info("Creating Safe transaction for payout...");

      await handleContractCall({
        fn: async () => {
          await contracts.payoutsContract.setPayoutStatus.staticCall(
            proposalId,
            memberAddress,
            true,
            parseEther(ethAmount)
          );
          return contracts.payoutsContract.setPayoutStatus(
            proposalId,
            memberAddress,  
            true,
            parseEther(ethAmount)
          );

        },
        abi: PAYOUTS_ABI,
        onSuccess: () => {
          console.log(
            `Payout status updated for proposal ${proposalId} and member ${memberAddress}`
          );
        }
      })


      const txResponse = await safeInstance.executeTransaction(transaction);
      toast.info("Safe transaction submitted. Waiting for confirmation...");

      await txResponse.transactionResponse;
      toast.success(
        `Successfully paid ${ethAmount} ETH and updated payout status for ${truncateAddress(
          memberAddress
        )}`
      );

      await loadPayoutsData();
    } catch (error) {
      console.error("Failed to process Safe payout:", error);
      toast.error("Safe payout failed");
    } finally {
      setProcessingPayouts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(proposalId);
        return newSet;
      });
    }
  };
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy HH:mm");
  };

  const formatAmount = (amount: string) => {
    return formatEther(amount);
  };

  if (checkingAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dao-primary mx-auto mb-4"></div>
              <p className="text-foreground/70">Checking admin privileges...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-foreground/70">
                You don't have admin privileges to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalPayouts = payoutsData.length;
  const claimedPayouts = payoutsData.filter((p) => p.claimed).length;
  const totalAmount = payoutsData.reduce(
    (sum, p) => sum + parseFloat(formatEther(p.amount)),
    0
  );

  return (
    <Layout>
      <div className="space-y-6 relative min-h-[80vh]">
        {/* Network Animation Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-dao-dark/80">
          <NetworkAnimation />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">
            Admin Dashboard
          </h1>
          <div className="text-sm bg-dao-dark-accent/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-dao-primary">Admin</span> /{" "}
            <span>Payouts</span>
          </div>
        </div>

        {/* Safe Connection Status */}
        <Card className="glass-card backdrop-blur-xl border-white/20 relative z-10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    safeConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  Safe Wallet: {safeConnected ? "Connected" : "Disconnected"}
                </span>
                <span className="text-xs text-foreground/70">
                  ({truncateAddress(safeAddress)})
                </span>
              </div>
              {!safeConnected && (
                <Button
                  size="sm"
                  onClick={initializeSafe}
                  className="bg-dao-primary text-black hover:bg-dao-primary/90"
                >
                  Connect Safe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Total Payouts</p>
                  <p className="text-2xl font-bold">{totalPayouts}</p>
                </div>
                <Users className="h-8 w-8 text-dao-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Claimed</p>
                  <p className="text-2xl font-bold">{claimedPayouts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Pending</p>
                  <p className="text-2xl font-bold">
                    {totalPayouts - claimedPayouts}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {totalAmount.toFixed(4)} ETH
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-dao-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card className="glass-card backdrop-blur-xl border-white/20 relative z-10">
          <CardHeader>
            <CardTitle>Payouts Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dao-primary mx-auto"></div>
                <p className="mt-2 text-foreground/70">
                  Loading payouts data...
                </p>
              </div>
            ) : payoutsData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/70">No payouts data available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2">Proposal ID</th>
                      <th className="text-left py-3 px-2">Member</th>
                      <th className="text-left py-3 px-2">Amount (ETH)</th>
                      <th className="text-left py-3 px-2">Created</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Claimed</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutsData.map((payout, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-3 px-2">#{payout.proposalId}</td>
                        <td className="py-3 px-2">
                          {truncateAddress(payout.member)}
                        </td>
                        <td className="py-3 px-2">
                          {formatAmount(payout.amount)}
                        </td>
                        <td className="py-3 px-2">
                          {formatDate(payout.timestamp)}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={payout.claimed ? "default" : "secondary"}
                          >
                            {payout.claimed ? "Claimed" : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {payout.claimed
                            ? formatDate(payout.claimTimestamp)
                            : "N/A"}
                        </td>
                        <td className="py-3 px-2">
                          {!payout.claimed && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handlePayoutClaim(
                                  payout.proposalId,
                                  payout.member,
                                  payout.amount
                                )
                              }
                              disabled={
                                processingPayouts.has(payout.proposalId) ||
                                !safeConnected
                              }
                              className="bg-dao-primary text-black hover:bg-dao-primary/90 disabled:opacity-50"
                            >
                              {processingPayouts.has(payout.proposalId) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                "Pay Claim"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
