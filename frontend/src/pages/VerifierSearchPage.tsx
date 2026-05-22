import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { VerificationResult } from "@/components/VerificationResult";
import { verifyCredential } from "@/services/api";
import { Search, Hash } from "lucide-react";
import { toast } from "sonner";

export default function VerifierSearchPage() {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [mode, setMode] = useState<"file" | "hash">("file");

  // Hash a file using the browser's built-in SubtleCrypto
  const hashFile = async (f: File): Promise<string> => {
    const buffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);

    try {
      let hash = "";

      if (mode === "file" && file) {
        hash = await hashFile(file);
      } else if (mode === "hash" && hashInput.trim()) {
        hash = hashInput.trim();
      } else {
        toast.error(mode === "file" ? "Please select a file" : "Please enter a hash");
        setVerifying(false);
        return;
      }

      const data = await verifyCredential(hash);
      setResult({
        verified: data.verified,
        data: data.verified
          ? {
              issuer: data.metadata?.institution || data.blockchain.issuer,
              student: data.blockchain.student,
              title: data.metadata?.title || "Credential",
              date: data.blockchain.issuedAt
                ? new Date(data.blockchain.issuedAt).toLocaleDateString()
                : "Unknown",
              txHash: hash,
              ipfsCid: data.metadata?.ipfsCid,
            }
          : undefined,
      });
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
      setResult({ verified: false });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout role="verifier" title="Verify Credential">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Mode selector */}
        <div className="flex rounded-lg bg-secondary p-1">
          {(["file", "hash"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); }}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-card text-foreground card-shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "file" ? "Upload File" : "Enter Hash"}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-8 card-shadow">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {mode === "file" ? "Upload Certificate to Verify" : "Enter Credential Hash"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "file"
              ? "Upload the same file that was originally issued to verify its authenticity on the blockchain."
              : "Paste the SHA-256 hash of the credential to check its status on the blockchain."}
          </p>

          <div className="mt-6 space-y-4">
            {mode === "file" ? (
              <FileUpload
                label=""
                accept=".pdf,.png,.jpg,.jpeg"
                onFileSelect={(f) => { setFile(f); setResult(null); }}
              />
            ) : (
              <div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={hashInput}
                    onChange={(e) => { setHashInput(e.target.value); setResult(null); }}
                    placeholder="Enter SHA-256 hash (e.g., a1b2c3d4...)"
                    className="pl-10 font-mono"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={verifying || (mode === "file" ? !file : !hashInput.trim())}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              {verifying ? "Verifying on blockchain..." : "Verify Credential"}
            </Button>
          </div>
        </div>

        {result && (
          <VerificationResult
            valid={result.verified}
            data={result.data}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
