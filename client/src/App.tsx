import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import CampaignAnalytics from "@/pages/campaign-analytics";
import CreatorMatching from "@/pages/creator-matching";
import LivePerformance from "@/pages/live-performance";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg" data-testid="text-loading">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg" data-testid="text-loading">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </ProtectedRoute>
      </Route>

      <Route path="/campaign/:id/analytics">
        <ProtectedRoute>
          <CampaignAnalytics />
        </ProtectedRoute>
      </Route>

      <Route path="/campaign/:id/matching">
        <ProtectedRoute>
          <CreatorMatching />
        </ProtectedRoute>
      </Route>

      <Route path="/live-performance">
        <ProtectedRoute>
          <LivePerformance />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        {isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
