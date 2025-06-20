"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate wallet address generation after client-side hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simulate checking if already connected from localStorage or similar
      const storedAddress = localStorage.getItem('routeai-walletAddress');
      if (storedAddress) {
        setWalletAddress(storedAddress);
        setIsConnected(true);
      }
    }
  }, []);
  
  const handleConnect = () => {
    // Simulate MetaMask connection
    const simulatedAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setWalletAddress(simulatedAddress);
    setIsConnected(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('routeai-walletAddress', simulatedAddress);
    }
    toast({
      title: "Wallet Connected",
      description: `Connected with address: ${simulatedAddress.substring(0,6)}...${simulatedAddress.substring(simulatedAddress.length - 4)}`,
    });
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('routeai-walletAddress');
    }
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
  
  if (isConnected && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {walletAddress.substring(2,4).toUpperCase()}
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
    <Button onClick={handleConnect} variant="default" className="shadow-md hover:shadow-lg transition-shadow">
      <Wallet className="mr-2 h-5 w-5" />
      Connect Wallet
    </Button>
  );
}
