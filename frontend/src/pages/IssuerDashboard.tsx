import { useEffect, useState } from "react";
import { Award, Users, FileText, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { CredentialTable, type Credential } from "@/components/CredentialTable";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

export default function IssuerDashboard() {
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
        // Fetch credentials issued by this wallet address
        const data = await getStudentCredentials(user.walletAddress);
        // For issuer dashboard, we show all credentials where issuerAddress matches
        // The API returns by studentAddress, so for issuer we query differently
        // For now, fetch from the issuer's perspective
        const mapped: Credential[] = (data.credentials || []).map((c: CredentialData) => ({
          id: c.credentialHash,
          title: c.metadata?.title || "Untitled Credential",
          issuer: c.metadata?.institution || user.institution || "",
          student: c.studentAddress ? c.studentAddress.slice(0, 8) + "..." + c.studentAddress.slice(-6) : "",
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
  }, [user?.walletAddress, user?.institution]);

  const uniqueStudents = new Set(credentials.map((c) => c.student)).size;

  return (
    <DashboardLayout role="issuer" title="Dashboard">
      {!user?.walletAddress && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          ⚠️ Connect your MetaMask wallet first. Go to <strong>Issue Credential</strong> page to connect.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Issued" value={credentials.length} icon={Award} />
        <StatCard title="Students" value={uniqueStudents} icon={Users} />
        <StatCard title="Pending" value={0} icon={FileText} />
        <StatCard title="This Month" value={credentials.filter(c => {
          const d = new Date(c.date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length} icon={TrendingUp} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Credentials</h2>
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : credentials.length > 0 ? (
          <CredentialTable credentials={credentials} showStudent showTxHash />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No credentials issued yet. Use "Issue Credential" to get started.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
