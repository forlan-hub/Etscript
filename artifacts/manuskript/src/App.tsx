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
import ReviewPage from "./pages/review";
import PreviewPage from "./pages/preview";
import ManuscriptDetailPage from "./pages/manuscript-detail";
import PricingPage from "./pages/pricing";
import SettingsPage from "./pages/settings";
import PaymentCallbackPage from "./pages/payment-callback";
import SignInPage from "./pages/sign-in";
import LettersPage from "./pages/letters";
import ToolsPage from "./pages/tools";
import ToolsCitationPage from "./pages/tools-citation";
import ToolsIsbnPage from "./pages/tools-isbn";
import ToolsMyTemplatesPage from "./pages/tools-my-templates";
import NotFoundPage from "./pages/not-found";
import AdminDashboardPage from "./pages/admin/index";
import AdminUsersPage from "./pages/admin/users";
import AdminTransactionsPage from "./pages/admin/transactions";
import AdminActivityPage from "./pages/admin/activity";
import PrivacyPolicyPage from "./pages/legal-privacy";
import TermsOfUsePage from "./pages/legal-terms";
import CookieNoticePage from "./pages/legal-cookies";
import DataRetentionPage from "./pages/legal-data-retention";
import UserConsentNoticePage from "./pages/legal-consent";

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
      <Route path="/review/:jobId">
        <ProtectedRoute component={ReviewPage} />
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
      <Route path="/letters/new">
        <ProtectedRoute component={LettersPage} />
      </Route>
      <Route path="/tools">
        <ProtectedRoute component={ToolsPage} />
      </Route>
      <Route path="/tools/citation">
        <ProtectedRoute component={ToolsCitationPage} />
      </Route>
      <Route path="/tools/isbn">
        <ProtectedRoute component={ToolsIsbnPage} />
      </Route>
      <Route path="/tools/my-templates">
        <ProtectedRoute component={ToolsMyTemplatesPage} />
      </Route>
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/transactions" component={AdminTransactionsPage} />
      <Route path="/admin/activity" component={AdminActivityPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/legal/privacy" component={PrivacyPolicyPage} />
      <Route path="/legal/terms" component={TermsOfUsePage} />
      <Route path="/legal/cookies" component={CookieNoticePage} />
      <Route path="/legal/data-retention" component={DataRetentionPage} />
      <Route path="/legal/consent" component={UserConsentNoticePage} />
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
