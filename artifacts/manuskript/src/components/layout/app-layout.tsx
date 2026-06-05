import { FC, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Book, LayoutDashboard, Settings, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, title, actions }) => {
  const [location] = useLocation();
  const { signOut, user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Manuscript", href: "/upload", icon: Upload },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex-col hidden md:flex">
        <div className="p-6 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <Book className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">Etscript</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-medium text-xs">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <Book className="w-5 h-5" />
            <span className="font-serif font-bold text-lg">Etscript</span>
          </Link>
        </header>

        {/* Desktop Header */}
        {(title || actions) && (
          <header className="hidden md:flex items-center justify-between px-8 py-6">
            <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">{title}</h1>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>
        )}

        {/* Mobile Title */}
        {(title || actions) && (
          <div className="md:hidden px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-serif font-semibold text-foreground">{title}</h1>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 pt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
