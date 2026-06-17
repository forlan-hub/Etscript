import { FC, ReactNode } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { BarChart2, Users, CreditCard, Activity, ArrowLeft, ShieldAlert } from "lucide-react";
import { useGetAdminCheck } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { name: "Overview", href: "/admin", icon: BarChart2, exact: true },
  { name: "Users", href: "/admin/users", icon: Users, exact: false },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard, exact: false },
  { name: "Activity", href: "/admin/activity", icon: Activity, exact: false },
];

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

function LoadingFull() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-3 w-64">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 bg-background">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        You don't have admin privileges. Contact the system owner to request access.
      </p>
      <Link to="/dashboard">
        <span className="text-primary text-sm underline underline-offset-4">
          Back to dashboard
        </span>
      </Link>
    </div>
  );
}

function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">Etscript Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ name, href, icon: Icon, exact }) => {
            const active = exact ? location === href : location.startsWith(href);
            return (
              <Link key={href} to={href}>
                <div
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {name}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <Link to="/dashboard">
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </div>
          </Link>
        </div>
      </aside>

      <div className="md:hidden flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm flex-1">Admin</span>
        {NAV.map(({ href, icon: Icon, exact }) => {
          const active = exact ? location === href : location.startsWith(href);
          return (
            <Link key={href} to={href}>
              <div
                className={`p-2 rounded-md transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <main className="flex-1 overflow-auto">
        {title && (
          <div className="border-b border-border bg-card px-6 py-4">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function AdminGuard({ children, title }: { children: ReactNode; title?: string }) {
  const { isSuccess, isError, isPending } = useGetAdminCheck();
  if (isPending) return <LoadingFull />;
  if (isError) return <AccessDenied />;
  if (!isSuccess) return null;
  return <AdminShell title={title}>{children}</AdminShell>;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, loading: authLoading } = useAuth();
  if (authLoading) return <LoadingFull />;
  if (!user) return <Redirect to="/sign-in" />;
  return <AdminGuard title={title}>{children}</AdminGuard>;
};
