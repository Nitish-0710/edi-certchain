import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Database, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCredentials } from "@/services/api";
import type { CredentialData } from "@/services/api";

interface BlockchainRecord {
  txHash: string;
  credentialHash: string;
  title: string;
  timestamp: string;
  status: string;
  ipfsCid: string;
}

export default function IssuerRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      if (!user?.walletAddress) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentCredentials(user.walletAddress);
        const mapped: BlockchainRecord[] = (data.credentials || []).map((c: CredentialData) => ({
          txHash: c.txHash || "",
          credentialHash: c.credentialHash,
          title: c.metadata?.title || "Credential",
          timestamp: c.issuedAt ? new Date(c.issuedAt).toLocaleString() : "",
          status: c.isValid ? "Confirmed" : "Revoked",
          ipfsCid: c.ipfsCid || "",
        }));
        setRecords(mapped);
      } catch (error) {
        console.error("Failed to load records:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [user?.walletAddress]);

  return (
    <DashboardLayout role="issuer" title="Blockchain Records">
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading blockchain records...</div>
      ) : records.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card card-shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Credential</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">TX / Hash</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">IPFS</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                  <td className="px-6 py-4 font-medium text-foreground">{r.title}</td>
                  <td className="px-6 py-4">
                    <code className="hash-text text-foreground">
                      {r.txHash ? `${r.txHash.slice(0, 10)}...${r.txHash.slice(-8)}` : "—"}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{r.timestamp}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`rounded-full font-medium ${
                        r.status === "Confirmed"
                          ? "border-accent/20 bg-accent/10 text-accent"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {r.ipfsCid && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${r.ipfsCid}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {!user?.walletAddress ? "Connect your wallet to view blockchain records." : "No blockchain records yet."}
        </div>
      )}
    </DashboardLayout>
  );
}
