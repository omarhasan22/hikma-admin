import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import DoctorsPage from "@/pages/Doctors";
import DoctorDetailPage from "@/pages/DoctorDetail";
import OrganizationsPage from "@/pages/Organizations";
import UsersPage from "@/pages/Users";
import SpecialtiesPage from "@/pages/Specialties";
import SlidersPage from "@/pages/Sliders";
import DailyTipsPage from "@/pages/DailyTips";
import ReviewsPage from "@/pages/Reviews";
const SettingsPage = () => <div className="p-8">Settings (Coming Soon)</div>;

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/doctors" component={DoctorsPage} />
      <Route path="/doctors/:doctorId" component={DoctorDetailPage} />
      <Route path="/organizations" component={OrganizationsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/specialties" component={SpecialtiesPage} />
      <Route path="/content/sliders" component={SlidersPage} />
      <Route path="/content/tips" component={DailyTipsPage} />
      <Route path="/content" component={SlidersPage} />
      <Route path="/reviews" component={ReviewsPage} />
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
