import { CheckCircle, XCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VerificationResultProps {
  valid: boolean;
  data?: {
    issuer: string;
    student: string;
    title: string;
    date: string;
    txHash: string;
  };
}

export function VerificationResult({ valid, data }: VerificationResultProps) {
  const copyHash = () => {
    if (data?.txHash) {
      navigator.clipboard.writeText(data.txHash);
      toast.success("Transaction hash copied!");
    }
  };

  if (valid && data) {
    return (
      <div className="animate-fade-in rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-accent" />
          <h3 className="font-heading text-xl font-bold text-accent">Credential Verified</h3>
        </div>
        <div className="space-y-3">
          {[
            ["Issuer", data.issuer],
            ["Student", data.student],
            ["Credential", data.title],
            ["Issue Date", data.date],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-accent/10 pb-2">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-muted-foreground">TX Hash</span>
            <button onClick={copyHash} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <code className="hash-text">{data.txHash.slice(0, 10)}...{data.txHash.slice(-8)}</code>
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-center gap-3">
        <XCircle className="h-8 w-8 text-destructive" />
        <h3 className="font-heading text-xl font-bold text-destructive">
          Credential Not Found or Invalid
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        The uploaded certificate could not be verified on the blockchain.
      </p>
    </div>
  );
}
