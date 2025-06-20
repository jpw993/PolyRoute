
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const POLYGON_MAINNET_CHAIN_ID = '0x89'; // 137
const POLYGON_NETWORK_PARAMS = {
  chainId: POLYGON_MAINNET_CHAIN_ID,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const { toast } = useToast();

  const clearState = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setIsLoading(false);
    setIsWrongNetwork(false);
    // setError(null); // Keep previous errors for a bit if needed, or clear specific ones.
  };

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      toast({ title: "Wallet Disconnected", description: "Please connect your wallet again.", variant: "destructive" });
      clearState();
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      // Re-check network if account changes while connected
      checkNetwork();
    }
  }, []);

  const handleChainChanged = useCallback((chainId: string) => {
    if (chainId !== POLYGON_MAINNET_CHAIN_ID) {
      setIsWrongNetwork(true);
      toast({ title: "Wrong Network", description: "Please switch to the Polygon Mainnet.", variant: "destructive" });
    } else {
      setIsWrongNetwork(false);
      setError(null); // Clear network errors
      toast({ title: "Network Switched", description: "Successfully connected to Polygon Mainnet." });
    }
  }, []);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== POLYGON_MAINNET_CHAIN_ID) {
        setIsWrongNetwork(true);
        return false;
      }
      setIsWrongNetwork(false);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error checking network:", err);
      setError("Could not verify network. Please try again.");
      setIsWrongNetwork(true); // Assume wrong network on error
      return false;
    }
  }, []);

  const switchToPolygonNetwork = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_MAINNET_CHAIN_ID }],
      });
      setIsWrongNetwork(false);
      setError(null); // Clear previous errors
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_NETWORK_PARAMS],
          });
          setIsWrongNetwork(false);
          setError(null);
        } catch (addError) {
          console.error("Failed to add Polygon network:", addError);
          setError("Failed to add Polygon network. Please add it manually in MetaMask.");
        }
      } else {
        console.error("Failed to switch network:", switchError);
        setError("Failed to switch to Polygon network. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to connect.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsWrongNetwork(false);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
          description: `Connected with address: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
        });
        const onPolygon = await checkNetwork();
        if (!onPolygon) {
           toast({ title: "Wrong Network", description: "Please switch to Polygon Mainnet.", variant: "destructive" });
        }
      } else {
        setError("No accounts found. Please ensure your MetaMask wallet is unlocked and has accounts.");
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) { // User rejected the request
        setError("Connection request rejected. Please try again.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
      clearState();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to check connection on mount and set up listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected (MetaMask remembers connections)
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleAccountsChanged(accounts); // Sets address, connected status and checks network
          }
        })
        .catch((err: any) => console.error("Error fetching initial accounts:", err));

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);


  const handleDisconnect = () => {
    clearState();
    toast({
      title: "Wallet Disconnected",
    });
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  if (!isLoading && error && !isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Alert variant="destructive" className="max-w-xs">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={connectWallet} variant="destructive" className="shadow-md hover:shadow-lg transition-shadow">
          <Wallet className="mr-2 h-5 w-5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (isConnected && walletAddress) {
    if (isWrongNetwork) {
      return (
         <div className="flex flex-col items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {walletAddress.substring(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Address</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={switchToPolygonNetwork} variant="destructive" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
            Switch to Polygon
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {walletAddress.substring(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button onClick={connectWallet} variant="default" className="shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wallet className="mr-2 h-5 w-5" />}
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}

    