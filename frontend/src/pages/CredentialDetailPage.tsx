import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { verifyCredential } from "@/services/api";

export default function CredentialDetailPage() {
  const { id } = useParams(); // id = credentialHash
  const [credential, setCredential] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredential() {
      if (!id) return;
      try {
        const data = await verifyCredential(id);
        setCredential({
          title: data.metadata?.title || "Credential",
          issuer: data.metadata?.institution || data.blockchain?.issuer || "Unknown",
          student: data.blockchain?.student || "Unknown",
          date: data.blockchain?.issuedAt
            ? new Date(data.blockchain.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "Unknown",
          status: data.verified ? "Verified" : "Invalid",
          txHash: id,
          ipfsCid: data.metadata?.ipfsCid || null,
          credentialType: data.metadata?.credentialType || "",
          description: data.metadata?.description || "",
        });
      } catch (error) {
        console.error("Failed to load credential:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredential();
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="Credential Details">
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading credential details...</div>
      </DashboardLayout>
    );
  }

  if (!credential) {
    return (
      <DashboardLayout role="student" title="Credential Details">
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Credential not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Credential Details">
      <Button variant="ghost" asChild className="mb-6 gap-2 text-muted-foreground">
        <Link to="/student"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="rounded-xl border border-border bg-card p-8 card-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">{credential.title}</h2>
            <p className="mt-1 text-muted-foreground">{credential.issuer}</p>
          </div>
          <Badge
            variant="outline"
            className={`rounded-full font-medium px-4 py-1 ${
              credential.status === "Verified"
                ? "border-accent/20 bg-accent/10 text-accent"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            {credential.status}
          </Badge>
        </div>

        {credential.description && (
          <p className="mt-4 text-sm text-muted-foreground">{credential.description}</p>
        )}

        <div className="mt-8 space-y-4">
          {[
            ["Student Address", credential.student],
            ["Issue Date", credential.date],
            ...(credential.credentialType ? [["Type", credential.credentialType]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border pb-3">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground max-w-[60%] truncate">{value}</span>
            </div>
          ))}

          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm font-medium text-muted-foreground">Credential Hash</span>
            <button
              onClick={() => copyToClipboard(credential.txHash, "Hash")}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <code className="hash-text">{credential.txHash.slice(0, 12)}...{credential.txHash.slice(-8)}</code>
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          {credential.ipfsCid && (
            <div className="flex items-center justify-between pb-3">
              <span className="text-sm font-medium text-muted-foreground">IPFS CID</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(credential.ipfsCid, "IPFS CID")}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <code className="hash-text">{credential.ipfsCid.slice(0, 12)}...{credential.ipfsCid.slice(-6)}</code>
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${credential.ipfsCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {credential.ipfsCid && (
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${credential.ipfsCid}`, "_blank")}
            >
              <Download className="h-4 w-4" /> Download Certificate
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const link = `${window.location.origin}/verify?hash=${credential.txHash}`;
              navigator.clipboard.writeText(link);
              toast.success("Share link copied!");
            }}
          >
            <Share2 className="h-4 w-4" /> Share Credential
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
