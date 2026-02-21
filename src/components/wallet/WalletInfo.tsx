import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "./useWallet";
import { Card } from "@/components/ui/card";
import { CHAIN_IDS } from "@/constants/address";
import { truncateAddress } from "@/lib/utils";

const WALLET_INSTALL_URL = "https://metamask.io/download/";

export function WalletInfo() {
  const {
    hasWallet,
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();
  const isSupportedNetwork = chainId === parseInt(CHAIN_IDS.BASE_SEPOLIA, 16);

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

  if (!hasWallet) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-amber-400/90">Need a wallet to connect</span>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-400/40 text-amber-400/90 hover:bg-amber-400/10"
          asChild
        >
          <a href={WALLET_INSTALL_URL} target="_blank" rel="noopener noreferrer">
            Install MetaMask or wallet
          </a>
        </Button>
      </div>
    );
  }

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
      {!isSupportedNetwork && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => switchNetwork(CHAIN_IDS.BASE_SEPOLIA)}
          className="bg-amber-600 hover:bg-amber-500 text-white"
        >
          Switch to Base Sepolia
        </Button>
      )}

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
