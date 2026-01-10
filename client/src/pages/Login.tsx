import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    try {
      await loginMutation.mutateAsync({ code });
      setLocation("/");
    } catch (err) {
      // Handled by mutation hook
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-xl shadow-black/5 border border-border animate-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Secure access for Hikma administrators</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Admin Access Code</label>
            <Input
              type="password"
              placeholder="Enter your access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all duration-200 text-center tracking-wider text-lg font-mono"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Enter your superadmin access code to continue
            </p>
          </div>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Login <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground font-medium">
        &copy; {new Date().getFullYear()} Hikma Health System. All rights reserved.
      </p>
    </div>
  );
}
