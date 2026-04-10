import { Link, useLocation } from "wouter";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Settings,
  LogOut,
  Image,
  Sparkles,
  MessageSquare,
  Lightbulb,
  CreditCard,
  PanelLeftClose,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Organizations", href: "/organizations", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Specialties", href: "/specialties", icon: Sparkles },
  { label: "Sliders", href: "/content/sliders", icon: Image },
  { label: "Daily Tips", href: "/content/tips", icon: Lightbulb },
  { label: "Reviews", href: "/reviews", icon: MessageSquare },
  { label: "Subscription Plans", href: "/subscription-plans", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ isOpen, isMobile, onClose, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const logoutMutation = useLogout();
  const faviconSrc = `${import.meta.env.BASE_URL}favicon.png`;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border/80 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="border-b border-border/70 bg-muted/20 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 shadow-md ring-1 ring-primary/20">
              <img
                src={faviconSrc}
                alt="Hikma logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-tight tracking-tight">Hakeemak</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Admin Hub</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-border/70 bg-background/70"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isMobile ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-4 inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Super Admin
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/12 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
                onClick={() => {
                  if (isMobile) onClose();
                }}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 bg-muted/20 p-3">
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
