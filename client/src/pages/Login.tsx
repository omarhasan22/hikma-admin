import { useState } from "react";
import { useLogin, useVerifyOtp } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = useLogin();
  const verifyMutation = useVerifyOtp();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    try {
      await loginMutation.mutateAsync({ phone });
      setStep('otp');
    } catch (err) {
      // Handled by mutation hook
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    try {
      await verifyMutation.mutateAsync({ phone, otp });
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

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all duration-200"
                required
              />
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
                  Send Code <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-foreground">Verification Code</label>
                <button 
                  type="button" 
                  onClick={() => setStep('phone')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Change number
                </button>
              </div>
              <Input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all duration-200 text-center tracking-[0.5em] text-lg font-mono"
                required
                maxLength={6}
              />
            </div>
            <Button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify & Login"
              )}
            </Button>
          </form>
        )}
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground font-medium">
        &copy; {new Date().getFullYear()} Hikma Health System. All rights reserved.
      </p>
    </div>
  );
}
