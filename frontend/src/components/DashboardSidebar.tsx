import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Award,
  Share2,
  Wallet,
  LogOut,
  FileText,
  Database,
  FilePlus,
  Shield,
  Search,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

const studentNav: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/student" },
  { title: "My Credentials", icon: Award, href: "/student/credentials" },
  { title: "Share Credential", icon: Share2, href: "/student/share" },
  { title: "Wallet", icon: Wallet, href: "/student/wallet" },
];

const issuerNav: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/issuer" },
  { title: "Issue Credential", icon: FilePlus, href: "/issuer/issue" },
  { title: "Issued Credentials", icon: FileText, href: "/issuer/credentials" },
  { title: "Blockchain Records", icon: Database, href: "/issuer/records" },
];

const verifierNav: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/verifier" },
  { title: "Verify Credential", icon: Search, href: "/verifier/verify" },
];

interface DashboardSidebarProps {
  role: "student" | "issuer" | "verifier";
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ role, open, onClose }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const items =
    role === "student"
      ? studentNav
      : role === "issuer"
      ? issuerNav
      : verifierNav;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-heading text-lg font-bold text-foreground">CertChain</span>
        </div>

        {/* User info */}
        {user && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => {
              logout();
              onClose();
              navigate("/login");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
