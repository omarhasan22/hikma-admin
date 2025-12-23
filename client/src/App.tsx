import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import DoctorsPage from "@/pages/Doctors";

// Placeholder components for routes not fully implemented yet
// In a real app these would be full pages like DoctorsPage
const OrganizationsPage = () => <div className="p-8">Organizations Page (Coming Soon)</div>;
const UsersPage = () => <div className="p-8">Users Page (Coming Soon)</div>;
const ContentPage = () => <div className="p-8">Content Management (Coming Soon)</div>;
const ServicesPage = () => <div className="p-8">Services (Coming Soon)</div>;
const SettingsPage = () => <div className="p-8">Settings (Coming Soon)</div>;

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/doctors" component={DoctorsPage} />
      <Route path="/organizations" component={OrganizationsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/settings" component={SettingsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
