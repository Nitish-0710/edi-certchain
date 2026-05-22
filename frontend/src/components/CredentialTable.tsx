import { Eye, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  student?: string;
  date: string;
  status: "Verified" | "Pending" | "Revoked";
  txHash?: string;
}

interface CredentialTableProps {
  credentials: Credential[];
  showStudent?: boolean;
  showTxHash?: boolean;
  detailPath?: string;
}

export function CredentialTable({ credentials, showStudent, showTxHash, detailPath }: CredentialTableProps) {
  const statusColor = (s: string) =>
    s === "Verified" ? "bg-accent/10 text-accent border-accent/20" :
    s === "Pending" ? "bg-warning/10 text-warning border-warning/20" :
    "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card card-shadow">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Credential Title</th>
            {showStudent && <th className="px-6 py-4 text-left font-medium text-muted-foreground">Student</th>}
            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Issuer</th>
            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Issue Date</th>
            {showTxHash && <th className="px-6 py-4 text-left font-medium text-muted-foreground">TX Hash</th>}
            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map((cred) => (
            <tr key={cred.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
              <td className="px-6 py-4 font-medium text-foreground">{cred.title}</td>
              {showStudent && <td className="px-6 py-4 text-muted-foreground">{cred.student}</td>}
              <td className="px-6 py-4 text-muted-foreground">{cred.issuer}</td>
              <td className="px-6 py-4 text-muted-foreground">{cred.date}</td>
              {showTxHash && (
                <td className="px-6 py-4">
                  <code className="hash-text text-muted-foreground">
                    {cred.txHash ? `${cred.txHash.slice(0, 8)}...${cred.txHash.slice(-6)}` : "—"}
                  </code>
                </td>
              )}
              <td className="px-6 py-4">
                <Badge variant="outline" className={cn("rounded-full font-medium", statusColor(cred.status))}>
                  {cred.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  {detailPath && (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Link to={`${detailPath}/${cred.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
