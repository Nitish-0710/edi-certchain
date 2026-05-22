import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { VerificationResult } from "@/components/VerificationResult";
import { verifyCredential } from "@/services/api";
import { toast } from "sonner";

export default function VerificationPortal() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [mode, setMode] = useState<"file" | "hash">("file");

  // Auto-verify if hash is in URL query params (from share link)
  useEffect(() => {
    const hash = searchParams.get("hash");
    if (hash) {
      setMode("hash");
      setHashInput(hash);
      handleVerifyHash(hash);
    }
  }, [searchParams]);

  const hashFile = async (f: File): Promise<string> => {
    const buffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleVerifyHash = async (hash: string) => {
    setVerifying(true);
    setResult(null);
    try {
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

  const handleVerify = async () => {
    if (mode === "file" && file) {
      const hash = await hashFile(file);
      handleVerifyHash(hash);
    } else if (mode === "hash" && hashInput.trim()) {
      handleVerifyHash(hashInput.trim());
    } else {
      toast.error(mode === "file" ? "Please select a file" : "Please enter a hash");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">CertChain</span>
          </Link>
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-16 lg:py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Verify Credential Authenticity
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a certificate file or enter its hash to verify on the blockchain.
          </p>
        </div>

        <div className="mt-8">
          {/* Mode selector */}
          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            {(["file", "hash"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setResult(null); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-card text-foreground card-shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "file" ? "Upload File" : "Enter Hash"}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {mode === "file" ? (
              <FileUpload
                label=""
                accept=".pdf,.png,.jpg,.jpeg"
                onFileSelect={(f) => { setFile(f); setResult(null); }}
              />
            ) : (
              <Input
                value={hashInput}
                onChange={(e) => { setHashInput(e.target.value); setResult(null); }}
                placeholder="Enter SHA-256 credential hash..."
                className="font-mono"
              />
            )}

            <Button
              onClick={handleVerify}
              disabled={verifying || (mode === "file" ? !file : !hashInput.trim())}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              {verifying ? "Verifying on blockchain..." : "Verify Credential"}
            </Button>

            {result && (
              <VerificationResult
                valid={result.verified}
                data={result.data}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
