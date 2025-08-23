import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SUPPORTED_NETWORKS } from "./WalletProvider";

interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
  currentChainId: number | null;
}

export function NetworkSwitchModal({
  isOpen,
  onClose,
  switchNetwork,
  currentChainId,
}: NetworkSwitchModalProps) {
  const handleNetworkSwitch = async (chainIdHex: string) => {
    await switchNetwork(chainIdHex);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dao-dark-accent border-white/10 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Switch Network</DialogTitle>
          <DialogDescription>
            Please select a supported Base network to continue using the DAO Portal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
       
          
          <NetworkOption
            network={SUPPORTED_NETWORKS.BASE_SEPOLIA}
            isActive={
              currentChainId === SUPPORTED_NETWORKS.BASE_SEPOLIA.chainId
            }
            onClick={() =>
              handleNetworkSwitch(SUPPORTED_NETWORKS.BASE_SEPOLIA.chainIdHex)
            }
            accentColor="border-dao-secondary"
            image="/placeholder.svg"
          />
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-white/10 hover:bg-white/5 hover:border-white/20"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NetworkOptionProps {
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    blockExplorer: string;
    currencySymbol: string;
  };
  isActive: boolean;
  onClick: () => void;
  accentColor: string;
  image: string;
}

function NetworkOption({
  network,
  isActive,
  onClick,
  accentColor,
  image,
}: NetworkOptionProps) {
  return (
    <button
      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
        isActive
          ? `bg-dao-dark border-2 ${accentColor}`
          : "bg-dao-dark hover:bg-dao-light-accent border border-white/10"
      }`}
      onClick={onClick}
      disabled={isActive}
    >
      <div className="w-10 h-10 bg-dao-dark-accent rounded-full flex items-center justify-center overflow-hidden">
        <img src={image} alt={network.name} className="w-6 h-6" />
      </div>

      <div className="flex-1 text-left">
        <h3 className="font-medium">{network.name}</h3>
        <p className="text-sm text-foreground/70">
          Chain ID: {network.chainId}
        </p>
      </div>

      {isActive && (
        <div className="bg-dao-primary text-black text-xs font-medium px-2 py-1 rounded-full">
          Connected
        </div>
      )}
    </button>
  );
}
