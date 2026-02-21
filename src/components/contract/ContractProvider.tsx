import React, { createContext, useState, ReactNode, useEffect } from "react";
import { ethers, parseEther } from "ethers";
import { useWallet } from "@/components/wallet/useWallet";
import { CONTRACT_ADDRESSES, CHAIN_IDS } from "@/constants/address";
import { toast } from "sonner";
import { PERSISTENT_KEYS, SESSION_KEYS } from "../wallet/WalletProvider";
import { handleContractCall } from "@/lib/contractUtils";
import { GOVERNANCE_ABI, MEMBERS_ABI, PAYOUTS_ABI, PROPOSAL_ABI } from "@/abis/abi";

interface ContractContextType {
  contracts: {
    membersContract: ethers.Contract | null;
    proposalContract: ethers.Contract | null;
    governanceContract: ethers.Contract | null;
    payoutsContract: ethers.Contract | null;
  };
  loading: boolean;
  joinDao: () => Promise<void>;
  payInsurancePremium: (insuranceId: number, amount: string) => Promise<void>;
  createProposal: (proposalData: any) => Promise<void>;
  requestPayout: (
    proposalId: number,
    amount: string,
    reason: string
  ) => Promise<void>;
}

export const ContractContext = createContext<ContractContextType>({
  contracts: {
    membersContract: null,
    proposalContract: null,
    governanceContract: null,
    payoutsContract: null,
  },
  loading: false,
  joinDao: async () => {},
  payInsurancePremium: async () => {},
  createProposal: async () => {},
  requestPayout: async () => {},
});

export function ContractProvider({ children }: { children: ReactNode }) {
  const {
    provider,
    signer,
    address,
    chainId,
    chainIdHex,
    isConnected,
    ensureNetwork,
    memberStatus,
    refreshMemberStatus,
  } = useWallet();

  const [contracts, setContracts] = useState({
    membersContract: null as ethers.Contract | null,
    proposalContract: null as ethers.Contract | null,
    governanceContract: null as ethers.Contract | null,
    payoutsContract: null as ethers.Contract | null,
  });

  const [loading, setLoading] = useState(false);

  const persistMemberStatus = (walletAddress: string, isMember: boolean) => {
    try {
      const raw = localStorage.getItem(PERSISTENT_KEYS.MEMBER_STATUS_BY_ADDRESS);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[walletAddress.toLowerCase()] = {
        isMember,
        memberSince: Date.now(),
        balance: null,
        loading: false,
      };
      localStorage.setItem(
        PERSISTENT_KEYS.MEMBER_STATUS_BY_ADDRESS,
        JSON.stringify(parsed)
      );
    } catch (error) {
      console.warn("Failed to persist member status:", error);
    }
  };

  useEffect(() => {
    if (isConnected && signer) {
      initializeContracts();
    } else {
      setContracts({
        membersContract: null,
        proposalContract: null,
        governanceContract: null,
        payoutsContract: null,
      });
    }
  }, [isConnected, signer, chainIdHex]);

  const initializeContracts = () => {
    try {
      if (!signer) return;

      // Check if we're on Base Mainnet or Base Sepolia
      const isCorrectNetwork = chainIdHex === CHAIN_IDS.BASE_SEPOLIA;
      if (!isCorrectNetwork) {
        // Set contracts to null and show warning
        setContracts({
          membersContract: null,
          proposalContract: null,
          governanceContract: null,
          payoutsContract: null,
        });
        return;
      }

      const membersContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Members,
        MEMBERS_ABI,
        signer
      );

      const proposalContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Proposal,
        PROPOSAL_ABI,
        signer
      );

      const payoutsContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Payouts,
        PAYOUTS_ABI,
        signer
      );

      const governanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Governance,
        GOVERNANCE_ABI,
        signer
      );

      setContracts({
        membersContract,
        proposalContract,
        governanceContract,
        payoutsContract,
      });
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      toast.error("Failed to initialize contracts");
    }
  };

  const joinDao = async () => {
    if (!contracts.membersContract || !address) {
      toast.error("Contract or wallet not connected");
      return;
    }

    setLoading(true);

    try {
      const alreadyMemberOnChain = await contracts.membersContract.isMember(address);
      if (alreadyMemberOnChain) {
        toast.info("You are already a DAO member");
        persistMemberStatus(address, true);
        await refreshMemberStatus();
        setLoading(false);
        return;
      }

      if (memberStatus.isMember) {
        toast.info("You are already a DAO member");
        persistMemberStatus(address, true);
        setLoading(false);
        return;
      }

      const txOptions = {
        value: parseEther("0.001"),
      };

      await handleContractCall({
        fn: async () => {
          await contracts.membersContract.joinDAO.staticCall(txOptions);
          return contracts.membersContract.joinDAO(txOptions);
        },
        abi: MEMBERS_ABI,
        onSuccess: async (tx) => {
          toast.info("Transaction submitted. Waiting for confirmation...");
          await tx.wait();

          // Only update session storage and member status AFTER successful transaction
          toast.success("Successfully joined the DAO!");

          // Update the member status in session storage
          const updatedMemberStatus = {
            ...memberStatus,
            isMember: true,
            loading: false,
            memberSince: Date.now(),
          };

          sessionStorage.setItem(
            SESSION_KEYS.MEMBER_STATUS,
            JSON.stringify(updatedMemberStatus)
          );
          persistMemberStatus(address, true);

          // Refresh member status from contract to ensure consistency
          await refreshMemberStatus();
        },
      });
    } catch (error: any) {
      console.error("Failed to join DAO:", error);
      
      // Ensure member status remains false on failure
      const failedMemberStatus = {
        ...memberStatus,
        isMember: false,
        loading: false,
      };

      sessionStorage.setItem(
        SESSION_KEYS.MEMBER_STATUS,
        JSON.stringify(failedMemberStatus)
      );
    } finally {
      setLoading(false);
    }
  };

  const payInsurancePremium = async (insuranceId: number, amount: string) => {
    if (!contracts.membersContract || !address) {
      toast.error("Contract or wallet not connected");
      return;
    }

    setLoading(true);

    try {
      const isOnCorrectNetwork = await ensureNetwork(CHAIN_IDS.BASE_SEPOLIA);
      if (!isOnCorrectNetwork) {
        toast.error("You need to be on Base network for this action");
        setLoading(false);
        return;
      }

      const txOptions = {
        value: parseEther(amount || "0.01"),
        gasLimit: 1000000,
      };

      await handleContractCall({
        fn: async () => {
          await contracts.membersContract.addInsurance.populateTransaction(insuranceId, txOptions);
          return contracts.membersContract.addInsurance(insuranceId, txOptions);
        },
        abi: MEMBERS_ABI,
        onSuccess: async (tx) => {
          toast.info("Payment transaction submitted. Waiting for confirmation...");
          await tx.wait();
          toast.success("Insurance premium payment successful!");

          await refreshMemberStatus();
        },
      });
    } catch (error: any) {
      console.error("Failed to pay insurance premium:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: any) => {
    if (!contracts.proposalContract || !address) {
      toast.error("Contract or wallet not connected");
      return;
    }

    setLoading(true);

    try {
      const networkReady = await ensureNetwork(CHAIN_IDS.BASE_SEPOLIA);
      if (!networkReady) {
        toast.error("Please switch to Base network");
        setLoading(false);
        return;
      }

      if (!memberStatus.isMember) {
        toast.error("You must be a DAO member to create proposals");
        setLoading(false);
        return;
      }

      const txOptions = {
        value: parseEther("0.001"),
        gasLimit: 1000000,
      };

      await handleContractCall({
        fn: async () => {
          await contracts.proposalContract.createProposal.staticCall(proposalData, txOptions);
          return contracts.proposalContract.createProposal(proposalData, txOptions);
        },
        abi: PROPOSAL_ABI,
        onSuccess: async (tx) => {
          toast.info("Proposal creation in progress...");
          await tx.wait();
          toast.success("Proposal created successfully!");
        },
      });
    } catch (error: any) {
      console.error("Failed to create proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async (
    proposalId: number,
    amount: string,
    reason: string
  ) => {
    if (!contracts.payoutsContract || !address) {
      toast.error("Contract or wallet not connected");
      return;
    }

    setLoading(true);

    try {
      const networkReady = await ensureNetwork(CHAIN_IDS.BASE_SEPOLIA);
      if (!networkReady) {
        toast.error("Please switch to Base network");
        setLoading(false);
        return;
      }

      const txOptions = {
        value: parseEther(amount),
        gasLimit: 500000,
      };

      await handleContractCall({
        fn: async () => {
          await contracts.payoutsContract.executePayout.populateTransaction(proposalId, txOptions);
          return contracts.payoutsContract.executePayout(proposalId, txOptions);
        },
        abi: PAYOUTS_ABI,
        onSuccess: async (tx) => {
          toast.info("Payout request in progress...");
          await tx.wait();
          toast.success(`Payout of ${amount} ETH requested successfully!`);
        },
      });
    } catch (error: any) {
      console.error("Failed to request payout:", error);
    } finally {
      setLoading(false);
    }
  };

  const contractContextValue: ContractContextType = {
    contracts,
    loading,
    joinDao,
    payInsurancePremium,
    createProposal,

    requestPayout,
  };

  return (
    <ContractContext.Provider value={contractContextValue}>
      {children}
    </ContractContext.Provider>
  );
}
