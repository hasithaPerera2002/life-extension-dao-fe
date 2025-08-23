import { useState, useEffect } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useContract } from "@/components/contract/useContract";
import { handleContractCall } from "@/lib/contractUtils";
import { formatEther } from "ethers";
import { MEMBERS_ABI, PAYOUTS_ABI, PROPOSAL_ABI } from "@/abis/abi";

interface Payment {
  timestamp: number;
  amount: string;
}

interface SubscribedInsurance {
  insuranceId: number;
  installmentFee: string;
  startDate: string;
  totalPaid: string;
  monthsPaid: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  dues: string;
  paymentHistory: Payment[];
  isClaimed: boolean;
  isEligibleForClaim: boolean;
  isRequestForClaim: boolean;
  // Proposal data
  title: string;
  description: string;
  proposer: string;
  createdDate: number;
  projectStatus: number;
  projectLink: string;
  projectImageLink: string;
  projectVideoLink: string;
}

export function useSubscribedInsurances() {
  const [subscribedInsurances, setSubscribedInsurances] = useState<
    SubscribedInsurance[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { address } = useWallet();
  const { contracts } = useContract();

  useEffect(() => {
    if (address && contracts.membersContract) {
      loadSubscribedInsurances();
    }
  }, [address, contracts.membersContract]);

  const loadSubscribedInsurances = async () => {
    if (!address || !contracts.membersContract || !contracts.proposalContract) {
      return;
    }

    setLoading(true);
    try {
      console.log("Loading subscribed insurances for address:", address);

      const rawInsurances = await handleContractCall({
        fn: async () => {
          return contracts.membersContract.getMemberInsurances();
        },
        abi: MEMBERS_ABI,
      });

      if (!rawInsurances || rawInsurances.length === 0) {
        setSubscribedInsurances([]);
        return;
      }

      const insurancesWithData = await Promise.all(
        rawInsurances.map(async (ins: any) => {
          const insuranceId = Number(ins.insuranceId || ins[0]);
          let proposal = null;
          let isEligibleForClaim = false;

          // Fetch proposal data
          try {
            proposal = await handleContractCall({
              fn: async () => {
                return contracts.proposalContract.getProposal(insuranceId);
              },
              abi: PROPOSAL_ABI,
            });
          } catch (err) {
            console.warn(`Proposal ${insuranceId} not found`);
          }

          // Check eligibility for claim
          if (contracts.payoutsContract && Number(proposal?.projectStatus) === 2) {
            
            try {
              isEligibleForClaim = await handleContractCall({
                fn: async () => {
                  await contracts.payoutsContract.checkEligibility.staticCall(
                    insuranceId,
                    address
                  );
                  const res = await contracts.payoutsContract.checkEligibility(
                    insuranceId,
                    address
                  );
                  return res;
                },
                abi: PAYOUTS_ABI,
                onSuccess: (data) => {
                
                },
              });
            } catch (err) {
              console.warn("Eligibility check failed:", err);
            }
          }

          // Handle payment history - expect array of Payment structs with timestamp and amount
          const paymentHistory: Payment[] = Array.isArray(
            ins.paymentHistory || ins[7]
          )
            ? (ins.paymentHistory || ins[7]).map((payment: any) => {
                // Handle Payment struct format: { timestamp: uint32, amount: uint256 }
                if (
                  payment &&
                  typeof payment === "object" &&
                  payment.timestamp !== undefined &&
                  payment.amount !== undefined
                ) {
                  return {
                    timestamp: Number(payment.timestamp),
                    amount: formatEther(payment.amount),
                  };
                }
                if (Array.isArray(payment) && payment.length >= 2) {
                  return {
                    timestamp: Number(payment[0]),
                    amount: formatEther(payment[1]),
                  };
                }
                return {
                  timestamp: Number(payment),
                  amount: formatEther(ins.installmentFee || ins[1] || "0"),
                };
              })
            : [];
              console.log("Payment history for insuranceId", insuranceId, ":", ins);
              
          return {
            insuranceId,
            installmentFee: formatEther(ins.installmentFee || ins[1] || "0"),
            totalPaid: formatEther(ins.totalPaid || ins[3] || "0"),
            dues: formatEther(ins.dues || ins[6] || "0"),
            monthsPaid: Number(ins.monthsPaid || ins[4] || 0),
            isClaimed: Boolean(ins.isClaimed || ins[8] || false),
            startDate: new Date(
              Number(ins.startDate || ins[2] || 0) * 1000
            ).toISOString(),
            lastPaymentDate: new Date(
              Number(ins.lastPaymentDate || ins[5] || 0) * 1000
            ).toISOString(),
            nextPaymentDate: new Date(
              Number(ins.nextPaymentDate || ins[7] || 0) * 1000
            ).toISOString(),
            paymentHistory,
            isEligibleForClaim,
            isRequestForClaim: Boolean(ins.isRequestForClaim || ins[13] || false),
            // Proposal data
            title: proposal?.title || "Unknown Policy",
            description: proposal?.description || "",
            proposer: proposal?.proposer || "",
            createdDate: proposal?.createdDate
              ? Number(proposal.createdDate) * 1000
              : Date.now(),

            projectStatus: proposal?.projectStatus || 0,
            projectLink: proposal?.projectLinks?.[0] || "",
            projectImageLink: proposal?.projectLinks?.[1] || "",
            projectVideoLink: proposal?.projectLinks?.[2] || "",
          };
        })
      );

      setSubscribedInsurances(insurancesWithData);
    } catch (err) {
      console.error("Failed to load subscribed insurances:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscribedInsurances,
    loading,
    refreshSubscriptions: loadSubscribedInsurances,
  };
}
