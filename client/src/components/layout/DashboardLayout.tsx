import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(state => state.token);
  const bootstrapped = useAuthStore(state => state.bootstrapped);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (bootstrapped && !token) {
      setLocation("/login");
    }
  }, [bootstrapped, token, setLocation]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-8 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
