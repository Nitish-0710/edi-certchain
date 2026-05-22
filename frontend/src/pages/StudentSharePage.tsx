import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CredentialTable, type Credential } from "@/components/CredentialTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

export default function StudentSharePage() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedHash, setSelectedHash] = useState("");

  useEffect(() => {
    async function fetchCredentials() {
      if (!user?.walletAddress) return;
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
        if (mapped.length > 0) setSelectedHash(mapped[0].id);
      } catch (error) {
        console.error("Failed to load credentials:", error);
      }
    }
    fetchCredentials();
  }, [user?.walletAddress]);

  const shareLink = selectedHash
    ? `${window.location.origin}/verify?hash=${selectedHash}`
    : "";

  return (
    <DashboardLayout role="student" title="Share Credential">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <h2 className="font-heading text-lg font-semibold text-foreground">Generate Share Link</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a credential and share a verification link with employers or verifiers.</p>

          {shareLink && (
            <div className="mt-6 flex items-center gap-3">
              <Input value={shareLink} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(shareLink); toast.success("Link copied!"); }}
                className="gap-2 shrink-0"
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Select Credential to Share</h2>
          {credentials.length > 0 ? (
            <CredentialTable credentials={credentials} detailPath="/student/credential" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              {!user?.walletAddress ? "Connect your wallet first." : "No credentials to share."}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
