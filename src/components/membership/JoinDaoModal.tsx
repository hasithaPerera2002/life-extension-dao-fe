
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContract } from "@/components/contract/useContract";
import { useWallet } from "@/components/wallet/useWallet";
import { toast } from "sonner";
import { ethers, formatEther } from "ethers";
import { MEMBERS_ABI } from "@/abis/abi";
import { CHAIN_IDS, CONTRACT_ADDRESSES } from "@/constants/address";
import { Loader2 } from "lucide-react";

interface JoinDaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinDaoModal({ isOpen, onClose }: JoinDaoModalProps) {
  const [contribution, setContribution] = useState("0.001");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const { joinDao, memberStatus, loading: contractLoading } = useContract();
  const { signer, address, chainId, refreshMemberStatus, provider } =
    useWallet();

  const isLoading = isSubmitting || isCheckingMembership || contractLoading;

  // Check membership status when modal opens with fresh API call
  useEffect(() => {
    if (isOpen && signer && address) {
      checkMembershipStatusFromContract();
    }
  }, [isOpen, signer, address]);

  const updateMembershipInStorage = async (isMember: boolean) => {
    try {
      // Import session keys
      const { SESSION_KEYS } = await import(
        "@/components/wallet/WalletProvider"
      );

      // Update session storage directly
      const memberStatus = {
        isMember: isMember,
        memberSince: isMember ? Date.now() : null,
        balance:
          provider && address
            ? formatEther(await provider.getBalance(address))
            : null,
        loading: false,
      };

      memberStatus.isMember = isMember;

      sessionStorage.setItem(
        SESSION_KEYS.MEMBER_STATUS,
        JSON.stringify(memberStatus)
      );
      sessionStorage.setItem(
        SESSION_KEYS.LAST_CONNECTED,
        Date.now().toString()
      );

      console.log("Updated session storage with member status:", memberStatus);

      // Also call refresh to update global state
      await refreshMemberStatus();
    } catch (error) {
      console.error("Failed to update membership in storage:", error);
    }
  };

  const checkMembershipStatusFromContract = async () => {
    if (!signer || !address) return;

    setIsCheckingMembership(true);
    try {
      // Check if on Base Mainnet or Base Sepolia
      if (chainId !== parseInt(CHAIN_IDS.BASE_SEPOLIA, 16)) {
        setIsCheckingMembership(false);
        return;
      }

      const membersContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Members,
        MEMBERS_ABI,
        signer
      );

      // Make fresh contract call
      const isMember = await membersContract.isMember(address);

      if (isMember) {
        // Update both session storage and global state
        await updateMembershipInStorage(true);
        toast.info("You are already a DAO member!");
        onClose();
        return;
      }
    } catch (error) {
      console.error("Failed to check membership status from contract:", error);
    } finally {
      setIsCheckingMembership(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Make fresh contract call before proceeding
      if (signer && address) {
        const { CONTRACT_ADDRESSES, CHAIN_IDS } = await import(
          "@/constants/address"
        );

        if (chainId === parseInt(CHAIN_IDS.BASE_SEPOLIA, 16)) {
          const membersContract = new ethers.Contract(
            CONTRACT_ADDRESSES.Members,
            MEMBERS_ABI,
            signer
          );

          const isMember = await membersContract.isMember(address);

          if (isMember) {
            // Update both session storage and global state
            await updateMembershipInStorage(true);
            toast.info("You are already a DAO member");
            onClose();
            return;
          }
        }
      }

      setIsSubmitting(true);
      await joinDao();

      // Update membership status after successful join
      await updateMembershipInStorage(true);
      onClose();
    } catch (error: any) {
      console.error("Failed to join DAO:", error);
      toast.error(error.message || "Failed to join the DAO");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking membership
  if (isCheckingMembership) {
    return (
      <Dialog open={isOpen} onOpenChange={!isLoading ? onClose : undefined}>
        <DialogContent className="bg-dao-dark-accent border-white/10 text-foreground sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-dao-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3">Checking membership status...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show loading screen during DAO joining
  if (isSubmitting) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="bg-dao-dark-accent border-white/10 text-foreground sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-dao-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Joining DAO...</h3>
              <p className="text-sm text-foreground/70">
                Please confirm the transaction in your wallet and wait for confirmation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={!isLoading ? onClose : undefined}>
      <DialogContent className="bg-dao-dark-accent border-white/10 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            Join DAO Membership
          </DialogTitle>
          <DialogDescription>
            Contribute ETH to become a member and access exclusive benefits
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label htmlFor="contribution" className="text-sm font-medium">
                Contribution Amount (ETH)
              </label>
              <div className="relative">
                <Input
                  id="contribution"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="bg-dao-dark border-white/10 pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70">
                  ETH
                </div>
              </div>
              <p className="text-xs text-foreground/70">
                Minimum contribution: 0.001 ETH
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Membership Benefits</h3>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-dao-primary"></div>
                  <span className="text-foreground/80">
                    Voting rights on all proposals
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-dao-primary"></div>
                  <span className="text-foreground/80">
                    Access to insurance products
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-dao-primary"></div>
                  <span className="text-foreground/80">
                    Share in DAO revenue distributions
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || memberStatus.isMember}
              className="bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : memberStatus.isMember ? (
                "Already a Member"
              ) : (
                "Join DAO"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
