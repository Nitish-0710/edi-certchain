import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifierDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="verifier" title="Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Verifications Today" value={0} icon={Search} />
        <StatCard title="Valid Found" value={0} icon={CheckCircle} />
        <StatCard title="Invalid Found" value={0} icon={XCircle} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-8 card-shadow text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Welcome, {user?.name || "Verifier"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Use the sidebar to verify credentials by uploading certificate files or entering credential hashes.
        </p>
      </div>
    </DashboardLayout>
  );
}
