import React, { createContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, ethers, formatEther } from "ethers";
import { toast } from "sonner";
import { NetworkSwitchModal } from "./NetworkSwitchModal";
import { CHAIN_IDS, CONTRACT_ADDRESSES } from "@/constants/address";
import { MEMBERS_ABI } from "@/abis/abi";

export interface WalletContextType {
  /** True if the browser has an Ethereum provider (MetaMask, Rabby, Coinbase Wallet, etc.) */
  hasWallet: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  chainId: number | null;
  chainIdHex: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  memberStatus: {
    isMember: boolean;
    memberSince: number | null;
    balance: string | null;
    loading: boolean;
  };
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainIdHex: string) => Promise<void>;
  ensureNetwork: (targetChainIdHex: string) => Promise<boolean>;
  refreshMemberStatus: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  hasWallet: false,
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  chainIdHex: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  memberStatus: {
    isMember: false,
    memberSince: null,
    balance: null,
    loading: false,
  },
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  ensureNetwork: async () => false,
  refreshMemberStatus: async () => {},
});

// Support Base Mainnet and Base Sepolia
export const SUPPORTED_NETWORKS = {
 
  BASE_SEPOLIA: {
    chainId: parseInt(CHAIN_IDS.BASE_SEPOLIA, 16),
    chainIdHex: CHAIN_IDS.BASE_SEPOLIA,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    currencySymbol: "ETH",
  },
};

// Session storage keys
export const SESSION_KEYS = {
  IS_CONNECTED: "wallet_isConnected",
  ADDRESS: "wallet_address",
  CHAIN_ID: "wallet_chainId",
  CHAIN_ID_HEX: "wallet_chainIdHex",
  BALANCE: "wallet_balance",
  MEMBER_STATUS: "wallet_memberStatus",
  LAST_CONNECTED: "wallet_lastConnected",
};

function getHasWallet(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { ethereum?: unknown }).ethereum;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [hasWallet, setHasWallet] = useState(false);
  const [provider, setProvider] =
    useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainIdHex, setChainIdHex] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [memberStatus, setMemberStatus] = useState({
    isMember: false,
    memberSince: null as number | null,
    balance: null as string | null,
    loading: false,
  });

  // Detect wallet availability (MetaMask, Rabby, Coinbase Wallet, etc.)
  useEffect(() => {
    setHasWallet(getHasWallet());
  }, []);

  // Load data from session storage on initialization
  useEffect(() => {
    if (!getHasWallet()) {
      setHasInitialized(true);
      return;
    }

    const loadFromSession = async () => {
      try {
        const storedIsConnected =
          sessionStorage.getItem(SESSION_KEYS.IS_CONNECTED) === "true";
        const storedAddress = sessionStorage.getItem(SESSION_KEYS.ADDRESS);
        const storedChainId = sessionStorage.getItem(SESSION_KEYS.CHAIN_ID);
        const storedChainIdHex = sessionStorage.getItem(
          SESSION_KEYS.CHAIN_ID_HEX
        );
        const storedBalance = sessionStorage.getItem(SESSION_KEYS.BALANCE);
        const storedMemberStatus = sessionStorage.getItem(
          SESSION_KEYS.MEMBER_STATUS
        );
        const lastConnected = sessionStorage.getItem(
          SESSION_KEYS.LAST_CONNECTED
        );

        // Check if session is still valid (less than 1 hour old)
        const isSessionValid =
          lastConnected &&
          Date.now() - parseInt(lastConnected) < 60 * 60 * 1000;

        if (storedIsConnected && storedAddress && isSessionValid) {
          setAddress(storedAddress);
          setChainId(storedChainId ? parseInt(storedChainId) : null);
          setChainIdHex(storedChainIdHex);
          setBalance(storedBalance);
          setIsConnected(true);

          if (storedMemberStatus) {
            try {
              const parsedMemberStatus = JSON.parse(storedMemberStatus);
              setMemberStatus(parsedMemberStatus);
              
            } catch (e) {
              console.warn("Failed to parse stored member status");
            }
          }

          // Reconnect to provider
          const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
          if (eth) {
            const ethProvider = new ethers.BrowserProvider(eth);
            const s = await ethProvider.getSigner();
            setProvider(ethProvider);
            setSigner(s);
          }
        } else {
          // Clear invalid session data
          clearSessionStorage();
        }
      } catch (error) {
        console.warn("Failed to load session data:", error);
        clearSessionStorage();
      }
    };

    loadFromSession();
    setHasInitialized(true);
  }, []);

  // Save data to session storage whenever state changes
  useEffect(() => {
    if (hasInitialized && isConnected) {
      try {
        sessionStorage.setItem(
          SESSION_KEYS.IS_CONNECTED,
          isConnected.toString()
        );
        if (address) sessionStorage.setItem(SESSION_KEYS.ADDRESS, address);
        if (chainId)
          sessionStorage.setItem(SESSION_KEYS.CHAIN_ID, chainId.toString());
        if (chainIdHex)
          sessionStorage.setItem(SESSION_KEYS.CHAIN_ID_HEX, chainIdHex);
        if (balance) sessionStorage.setItem(SESSION_KEYS.BALANCE, balance);
        sessionStorage.setItem(
          SESSION_KEYS.MEMBER_STATUS,
          JSON.stringify(memberStatus)
        );
        sessionStorage.setItem(
          SESSION_KEYS.LAST_CONNECTED,
          Date.now().toString()
        );
      } catch (error) {
        console.warn("Failed to save session data:", error);
      }
    }
  }, [
    hasInitialized,
    isConnected,
    address,
    chainId,
    chainIdHex,
    balance,
    memberStatus,
  ]);

  const clearSessionStorage = () => {
    Object.values(SESSION_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  };

  const resetStatesForNewAccount = () => {
    setBalance(null);
    setMemberStatus({
      isMember: false,
      memberSince: null,
      balance: null,
      loading: false,
    });
    clearSessionStorage();
  };

  // Only check wallet connection if not already loaded from session
  useEffect(() => {
    if (!hasInitialized || !hasWallet) return;

    const checkConnection = async () => {
      // If we already have connection data from session, don't reconnect
      if (isConnected && address) {
        return;
      }

      if (window.ethereum?.selectedAddress && !isConnecting) {
        try {
          console.log("Attempting to reconnect wallet...");
          await connect();
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
        }
      }
    };

    // Small delay to prevent multiple calls
    const timeoutId = setTimeout(checkConnection, 100);
    return () => clearTimeout(timeoutId);
  }, [hasInitialized, hasWallet, isConnected, address, isConnecting]);

  // Listen for account changes
  useEffect(() => {
    if (!hasWallet || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
        toast.info("Wallet disconnected");
      } else if (accounts[0] !== address) {
        console.log("Account changed from", address, "to", accounts[0]);
        // Reset cache and states for new account
        resetStatesForNewAccount();
        setAddress(accounts[0]);
        updateBalance(accounts[0]);
        toast.info("Account changed");
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      console.log("Chain changed:", chainIdHex);

      setChainIdHex(chainIdHex);
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      // Accept both Base Mainnet and Base Sepolia
      if (chainIdHex !== CHAIN_IDS.BASE_SEPOLIA) {
        if (!isConnecting) {
          setShowNetworkModal(true);
        }
      } else {
        const networkName = chainIdHex === CHAIN_IDS.BASE_SEPOLIA ? "Base Sepolia" : "Base";
        toast.success(`Connected to ${networkName}`);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [hasWallet, address, isConnecting]);

  // Update balance when address or chainId changes
  useEffect(() => {
    if (address && provider && hasInitialized) {
      updateBalance(address);
    }
  }, [address, chainId, provider, hasInitialized]);

  const updateBalance = async (walletAddress: string) => {
    if (!provider) return;

    try {
      const balanceWei = await provider.getBalance(walletAddress);
      const balanceEth = formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const connect = async () => {
    if (!getHasWallet() || !window.ethereum) {
      setError("A wallet is required to connect (e.g. MetaMask or any Ethereum/Base wallet). Please install one.");
      toast.error("Need a wallet to connect");
      return;
    }

    // Prevent multiple connection attempts
    if (isConnecting) {
      console.log("Already connecting, skipping...");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethProvider = new BrowserProvider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      const ethSigner = await ethProvider.getSigner();
      const chainIdHex = await ethProvider.send("eth_chainId", []);
      const networkChainId = parseInt(chainIdHex, 16);

      setProvider(ethProvider);
      setSigner(ethSigner);
      setAddress(accounts[0]);
      setChainId(networkChainId);
      setChainIdHex(chainIdHex);
      setIsConnected(true);

      if ( chainIdHex !== CHAIN_IDS.BASE_SEPOLIA) {
        toast.info(
          "For full functionality, you may need to switch to Base network"
        );
      }

      console.log("Wallet connected successfully");
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setChainIdHex(null);
    setBalance(null);
    setIsConnected(false);
    setError(null);
    setMemberStatus({
      isMember: false,
      memberSince: null,
      balance: null,
      loading: false,
    });
    clearSessionStorage();
    toast.info("Wallet disconnected");
  };

  const switchNetwork = async (targetChainIdHex: string) => {
    if (!getHasWallet() || !window.ethereum) {
      setError("A wallet is required");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          let networkParams;

          if (targetChainIdHex === CHAIN_IDS.BASE_SEPOLIA) {
            networkParams = {
              chainId: CHAIN_IDS.BASE_SEPOLIA,
              chainName: SUPPORTED_NETWORKS.BASE_SEPOLIA.name,
              nativeCurrency: {
                name: "Base Sepolia Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [SUPPORTED_NETWORKS.BASE_SEPOLIA.rpcUrl],
              blockExplorerUrls: [
                SUPPORTED_NETWORKS.BASE_SEPOLIA.blockExplorer,
              ],
            };
          }

          if (networkParams) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networkParams],
            });
          } else {
            throw new Error("Unsupported network");
          }
        } catch (addError) {
          console.error("Failed to add network:", addError);
          setError("Failed to add network");
          toast.error("Failed to add network");
        }
      } else {
        console.error("Failed to switch network:", switchError);
        setError("Failed to switch network");
        toast.error("Failed to switch network");
      }
    }
  };

  const ensureNetwork = async (targetChainIdHex: string): Promise<boolean> => {
    if (!getHasWallet() || !window.ethereum) {
      toast.error("Need a wallet to connect");
      return false;
    }

    try {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== targetChainIdHex) {
        const networkName = targetChainIdHex === CHAIN_IDS.BASE_SEPOLIA ? "Base Sepolia" : "Base";
        toast.warning(
          `Some features may be limited. Current network is not ${networkName}.`
        );
        setShowNetworkModal(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Network check error:", error);
      return false;
    }
  };

  const refreshMemberStatus = async () => {
    if (
      !provider ||
      !signer ||
      !address ||
      chainIdHex !== CHAIN_IDS.BASE_SEPOLIA
    ) {
      // Only reset if we're truly disconnected or on wrong network
      if (!isConnected || chainIdHex !== CHAIN_IDS.BASE_SEPOLIA) {
        const emptyStatus = {
          isMember: false,
          memberSince: null,
          balance: null,
          loading: false,
        };
        setMemberStatus(emptyStatus);
      }
      return;
    }

    // Check if we have recent cached data - if user is already a member, don't refresh
    const cachedMemberStatus = sessionStorage.getItem(
      SESSION_KEYS.MEMBER_STATUS
    );
    const lastConnected = sessionStorage.getItem(SESSION_KEYS.LAST_CONNECTED);

    if (cachedMemberStatus && lastConnected) {
      try {
        const parsedStatus = JSON.parse(cachedMemberStatus);
        const timeSinceLastCheck = Date.now() - parseInt(lastConnected);

        // If user is a confirmed member and data is less than 10 minutes old, use cached data
        if (
          parsedStatus.isMember === true &&
          timeSinceLastCheck < 10 * 60 * 1000
        ) {
          console.log("Using cached member status (confirmed member)");
          setMemberStatus(parsedStatus);
          return;
        }

        // If user is not a member and data is less than 1 minute old, use cached data
        if (
          parsedStatus.isMember === false &&
          timeSinceLastCheck < 1 * 60 * 1000
        ) {
          console.log("Using recent cached member status (non-member)");
          setMemberStatus(parsedStatus);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cached member status");
      }
    }

    console.log("Refreshing member status from contract...");
    setMemberStatus((prev) => ({ ...prev, loading: true }));

    try {
     
      const membersContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Members,
        MEMBERS_ABI,
        signer
      );

      // Properly await the contract call to get boolean result
      const isMemberResult = await membersContract.isMember(address);
      const isMember = Boolean(isMemberResult); // Ensure it's a boolean

      let memberSince = null;
      let memberBalance = null;

      if (isMember) {
        try {
          const memberInfo = await membersContract.getMemberInfo(address);
          memberSince = memberInfo?.joinDate ? memberInfo.joinDate : null;
        } catch (error) {
          console.warn("Could not fetch member info:", error);
        }

        const balanceWei = await provider.getBalance(address);
        memberBalance = formatEther(balanceWei);
      }

      const newMemberStatus = {
        isMember,
        memberSince,
        balance: memberBalance ? parseFloat(memberBalance).toFixed(4) : null,
        loading: false,
      };

      setMemberStatus(newMemberStatus);
    } catch (error) {
      console.error("Failed to fetch member status:", error);
      // Don't reset to false if we had a valid member status before
      setMemberStatus((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // Only refresh member status when connection state changes, not on every page navigation
  useEffect(() => {
    if (
      hasInitialized &&
      isConnected &&
      signer &&
      address &&
      chainIdHex === CHAIN_IDS.BASE_SEPOLIA
    ) {
      // Only refresh if we don't have any member status data at all or if the current data is clearly invalid
      const needsRefresh =
        memberStatus.isMember === undefined ||
        (memberStatus.isMember === false &&
          memberStatus.memberSince === null &&
          !memberStatus.loading);

      if (needsRefresh) {
        console.log("Initial member status check needed");
        refreshMemberStatus();
      }
    }
    // Don't reset member status when navigating - only when truly disconnected
  }, [hasInitialized, isConnected, signer, address, chainIdHex]);

  const walletContextValue: WalletContextType = {
    hasWallet,
    provider,
    signer,
    address,
    chainId,
    chainIdHex,
    balance,
    isConnected,
    isConnecting,
    error,
    memberStatus,
    connect,
    disconnect,
    switchNetwork,
    ensureNetwork,
    refreshMemberStatus,
  };

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
      <NetworkSwitchModal
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        switchNetwork={switchNetwork}
        currentChainId={chainId}
      />
    </WalletContext.Provider>
  );
}
