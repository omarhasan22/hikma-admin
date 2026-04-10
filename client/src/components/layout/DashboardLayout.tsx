import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanelLeftOpen } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(state => state.token);
  const bootstrapped = useAuthStore(state => state.bootstrapped);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (bootstrapped && !token) {
      setLocation("/login");
    }
  }, [bootstrapped, token, setLocation]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      {!isSidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-40 border-border/80 bg-background/90 shadow-md backdrop-blur"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      )}

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        )}
      >
        <div className={cn("max-w-7xl mx-auto p-8 animate-in", !isSidebarOpen && "pt-20")}>
          {children}
        </div>
      </main>
    </div>
  );
}
