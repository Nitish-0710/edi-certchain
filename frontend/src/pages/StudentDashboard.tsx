import { useEffect, useState } from "react";
import { Award, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { CredentialTable, type Credential } from "@/components/CredentialTable";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredentials() {
      if (!user?.walletAddress) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentCredentials(user.walletAddress);
        const mapped: Credential[] = (data.credentials || []).map((c: CredentialData, i: number) => ({
          id: c.credentialHash,
          title: c.metadata?.title || "Untitled Credential",
          issuer: c.metadata?.institution || c.issuerAddress?.slice(0, 10) + "...",
          date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "",
          status: c.isValid ? "Verified" as const : "Revoked" as const,
          txHash: c.txHash,
        }));
        setCredentials(mapped);
      } catch (error) {
        console.error("Failed to load credentials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredentials();
  }, [user?.walletAddress]);

  const verified = credentials.filter((c) => c.status === "Verified").length;
  const pending = credentials.filter((c) => c.status === "Pending").length;

  return (
    <DashboardLayout role="student" title="Dashboard">
      {!user?.walletAddress && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          ⚠️ Connect your MetaMask wallet on the <a href="/student/wallet" className="underline font-medium">Wallet page</a> to view your credentials.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Credentials" value={credentials.length} icon={Award} />
        <StatCard title="Verified" value={verified} icon={CheckCircle} />
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Shared" value={0} icon={TrendingUp} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">My Credentials</h2>
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : credentials.length > 0 ? (
          <CredentialTable credentials={credentials} detailPath="/student/credential" />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No credentials found. {!user?.walletAddress ? "Connect your wallet first." : "Credentials issued to your wallet will appear here."}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
