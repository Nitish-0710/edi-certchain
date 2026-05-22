import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { uploadCredential } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, CheckCircle, Copy } from "lucide-react";

export default function IssueCredentialPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [title, setTitle] = useState("");
  const [credentialType, setCredentialType] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.walletAddress) {
      toast.error("Please connect your MetaMask wallet first");
      return;
    }

    if (!file) {
      toast.error("Please upload a credential file");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentAddress", studentAddress);
      formData.append("issuerAddress", user.walletAddress);
      formData.append("title", title);
      formData.append("credentialType", credentialType);
      formData.append("institution", user.institution || "");
      formData.append("description", `Issued to ${studentName}`);

      const data = await uploadCredential(formData);
      setResult(data.credential);
      toast.success("Credential issued and stored on blockchain!");

      // Reset form
      setStudentName("");
      setStudentAddress("");
      setTitle("");
      setCredentialType("");
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to issue credential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="issuer" title="Issue Credential">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Wallet connection */}
        {!user?.walletAddress && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Connect Wallet First</h3>
            <p className="text-sm text-muted-foreground mb-4">You need to connect your MetaMask wallet to issue credentials.</p>
            <WalletConnectButton />
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-8 card-shadow">
          <h2 className="font-heading text-xl font-semibold text-foreground">Issue New Credential</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a certificate file. It will be hashed, stored on IPFS, and recorded on the blockchain.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Student Name</label>
              <Input
                placeholder="e.g., Alex Johnson"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Student Wallet Address</label>
              <Input
                placeholder="0x..."
                className="font-mono"
                required
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Credential Title</label>
              <Input
                placeholder="e.g., Bachelor of Computer Science"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Credential Type</label>
              <Input
                placeholder="e.g., degree, certificate, transcript"
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
              />
            </div>
            <FileUpload
              accept=".pdf,.png,.jpg,.jpeg"
              onFileSelect={(f) => setFile(f)}
            />
            <Button
              type="submit"
              disabled={loading || !user?.walletAddress}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              {loading ? "Issuing on blockchain..." : "Issue Credential"}
            </Button>
          </form>
        </div>

        {/* Success result */}
        {result && (
          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-accent" />
              <h3 className="font-heading text-lg font-bold text-accent">Credential Issued Successfully!</h3>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Credential Hash", result.credentialHash],
                ["IPFS CID", result.ipfsCid],
                ["TX Hash", result.txHash],
                ["Block", result.blockNumber?.toString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-accent/10 pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(value || ""); toast.success(`${label} copied!`); }}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <code className="hash-text">{value?.slice(0, 12)}...{value?.slice(-8)}</code>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {result.ipfsUrl && (
                <a
                  href={result.ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-primary hover:underline text-sm"
                >
                  View on IPFS →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
