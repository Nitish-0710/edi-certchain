import { useState } from "react";
import { Wallet, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnectButton() {
  const { user, linkWallet } = useAuth();
  const [connecting, setConnecting] = useState(false);

  const address = user?.walletAddress || null;

  const connect = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install it from metamask.io");
      return;
    }

    setConnecting(true);
    try {
      // Request MetaMask account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const walletAddr = accounts[0];
        // Save wallet address to backend
        await linkWallet(walletAddr);
        toast.success("Wallet connected successfully!");
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Connection rejected. Please approve the MetaMask request.");
      } else {
        toast.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied!");
    }
  };

  if (address) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-shadow">
        <div className="rounded-lg bg-accent/10 p-2.5">
          <CheckCircle className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">Connected Wallet</p>
          <code className="hash-text text-foreground">
            {address.slice(0, 8)}...{address.slice(-6)}
          </code>
        </div>
        <Button variant="ghost" size="icon" onClick={copyAddress} className="text-muted-foreground hover:text-primary">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={connecting}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting..." : "Connect MetaMask"}
    </Button>
  );
}
