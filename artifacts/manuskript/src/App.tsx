import { useEffect } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SessionTimeout } from "@/components/session-timeout";

import LandingPage from "./pages/landing";
import DashboardPage from "./pages/dashboard";
import UploadPage from "./pages/upload";
import FormatPage from "./pages/format";
import CustomizePage from "./pages/customize";
import PreviewPage from "./pages/preview";
import ManuscriptDetailPage from "./pages/manuscript-detail";
import PricingPage from "./pages/pricing";
import SettingsPage from "./pages/settings";
import PaymentCallbackPage from "./pages/payment-callback";
import SignInPage from "./pages/sign-in";
import NotFoundPage from "./pages/not-found";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/sign-in" />;
  return <Component />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/upload">
        <ProtectedRoute component={UploadPage} />
      </Route>
      <Route path="/format/:jobId">
        <ProtectedRoute component={FormatPage} />
      </Route>
      <Route path="/customize/:jobId">
        <ProtectedRoute component={CustomizePage} />
      </Route>
      <Route path="/preview/:jobId">
        <ProtectedRoute component={PreviewPage} />
      </Route>
      <Route path="/manuscripts/:id">
        <ProtectedRoute component={ManuscriptDetailPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/payment/callback">
        <ProtectedRoute component={PaymentCallbackPage} />
      </Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
            <SessionTimeout />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
