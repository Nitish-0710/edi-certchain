import { DashboardLayout } from "@/layouts/DashboardLayout";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Wallet, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentWalletPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="student" title="Wallet">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-8 card-shadow text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            {user?.walletAddress ? "Wallet Connected" : "Connect Your Wallet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.walletAddress
              ? "Your MetaMask wallet is linked. Credentials issued to this address will appear in your dashboard."
              : "Link your MetaMask wallet to manage and verify your blockchain credentials."}
          </p>
          <div className="mt-6">
            <WalletConnectButton />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <Shield className="mb-3 h-6 w-6 text-accent" />
            <h3 className="font-heading text-sm font-semibold text-foreground">Secured by Blockchain</h3>
            <p className="mt-1 text-xs text-muted-foreground">Your credentials are immutably stored on-chain.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <Clock className="mb-3 h-6 w-6 text-primary" />
            <h3 className="font-heading text-sm font-semibold text-foreground">Real-time Sync</h3>
            <p className="mt-1 text-xs text-muted-foreground">Credentials update automatically when issued.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
