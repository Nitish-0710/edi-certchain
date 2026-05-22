import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CredentialTable, type Credential } from "@/components/CredentialTable";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

export default function IssuerCredentialsPage() {
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

  return (
    <DashboardLayout role="issuer" title="Issued Credentials">
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : credentials.length > 0 ? (
        <CredentialTable credentials={credentials} showStudent showTxHash />
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {!user?.walletAddress ? "Connect your wallet to view issued credentials." : "No credentials issued yet."}
        </div>
      )}
    </DashboardLayout>
  );
}
