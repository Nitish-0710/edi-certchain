import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  title: string;
  onMenuClick: () => void;
}

export function DashboardNavbar({ title, onMenuClick }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
