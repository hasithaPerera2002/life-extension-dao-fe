import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "./useWallet";
import { Card } from "@/components/ui/card";
import { CHAIN_IDS } from "@/constants/address";
import { truncateAddress } from "@/lib/utils";

export function WalletInfo() {
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();

  const getNetworkColor = (chainId: number | null) => {
    if (!chainId) return "text-gray-400";

    // Support both Base Mainnet and Base Sepolia
    if (
        chainId === parseInt(CHAIN_IDS.BASE_SEPOLIA, 16)) {
      return "text-green-400"; 
    }

    return "text-red-400"; // Any other network
  };

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return "Not Connected";

    if (chainId === parseInt(CHAIN_IDS.BASE_SEPOLIA, 16)) {
      return "Base Sepolia";
    }

    return "Unsupported Network";
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="bg-dao-primary text-black hover:bg-dao-primary/80"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Card className="bg-dao-dark-accent py-1 px-3 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${getNetworkColor(chainId)}`}
        ></div>
        <span className="text-xs font-medium">{getNetworkName(chainId)}</span>
      </Card>

      <Card className="bg-dao-dark-accent py-1 px-3 flex items-center">
        <span className="text-xs font-medium">{balance} ETH</span>
      </Card>

      <Button
        variant="outline"
        size="sm"
        className="border-white/10 hover:bg-dao-dark-accent"
        onClick={disconnect}
      >
        {address ? truncateAddress(address) : ""}
      </Button>
    </div>
  );
}
