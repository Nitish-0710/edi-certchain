import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CredentialTable, type Credential } from "@/components/CredentialTable";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

export default function StudentCredentialsPage() {
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
          issuer: c.metadata?.institution || c.issuerAddress?.slice(0, 10) + "...",
          date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "",
          status: c.isValid ? "Verified" as const : "Revoked" as const,
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

  return (
    <DashboardLayout role="student" title="My Credentials">
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading credentials...</div>
      ) : credentials.length > 0 ? (
        <CredentialTable credentials={credentials} detailPath="/student/credential" />
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {!user?.walletAddress ? "Connect your wallet to view credentials." : "No credentials found."}
        </div>
      )}
    </DashboardLayout>
  );
}
