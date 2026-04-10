import { Router, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { api } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { mapBackendUserToFrontendUser } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import DoctorsPage from "@/pages/Doctors";
import DoctorDetailPage from "@/pages/DoctorDetail";
import OrganizationsPage from "@/pages/Organizations";
import ClinicUsersPage from "@/pages/ClinicUsers";
import UsersPage from "@/pages/Users";
import SpecialtiesPage from "@/pages/Specialties";
import SlidersPage from "@/pages/Sliders";
import DailyTipsPage from "@/pages/DailyTips";
import ReviewsPage from "@/pages/Reviews";
import SubscriptionPlansPage from "@/pages/SubscriptionPlans";
const SettingsPage = () => <div className="p-8">Settings (Coming Soon)</div>;

// Get base path from Vite (automatically includes /hakeemak-admin/ in production)
// Remove trailing slash for wouter's base prop
// If base is just '/', use undefined (no base path needed)
const baseUrl = import.meta.env.BASE_URL;
const basePath = baseUrl === '/' ? undefined : baseUrl.replace(/\/$/, '');

function AppRouter() {
  return (
    <Router base={basePath}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route path="/doctors" component={DoctorsPage} />
        <Route path="/doctors/new" component={DoctorDetailPage} />
        <Route path="/doctors/:doctorId" component={DoctorDetailPage} />
        <Route path="/organizations" component={OrganizationsPage} />
        <Route path="/organizations/:clinicId/users" component={ClinicUsersPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/specialties" component={SpecialtiesPage} />
        <Route path="/content/sliders" component={SlidersPage} />
        <Route path="/content/tips" component={DailyTipsPage} />
        <Route path="/content" component={SlidersPage} />
        <Route path="/reviews" component={ReviewsPage} />
        <Route path="/subscription-plans" component={SubscriptionPlansPage} />
        <Route path="/settings" component={SettingsPage} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        hydrateAuth();
        const { refreshToken, user, token } = useAuthStore.getState();

        // Keep persisted access token active immediately while we try to rotate quietly.
        if (token && !refreshToken) {
          return;
        }

        if (!refreshToken) {
          return;
        }

        const res = await apiFetch(api.auth.refresh.path, {
          method: api.auth.refresh.method,
          body: api.auth.refresh.input.parse({ refreshToken }),
          skipAuthRefresh: true,
        });
        const json = await res.json();
        const parsed = api.auth.refresh.responses[200].safeParse(json);
        if (parsed.success && parsed.data.result.access_token && !cancelled) {
          const refreshedUser = parsed.data.result.profile
            ? mapBackendUserToFrontendUser(parsed.data.result.profile)
            : user;
          setAuth(
            parsed.data.result.access_token,
            parsed.data.result.refresh_token ?? refreshToken,
            refreshedUser
          );
        }
      } catch {
        logout();
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateAuth, logout, setAuth, setBootstrapped]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
