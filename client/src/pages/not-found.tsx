import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30">
      <div className="bg-card p-8 rounded-3xl shadow-xl shadow-black/5 border border-border text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">404 Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        
        <Link href="/">
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200">
            Return to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
