import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Shield, LogOut, CreditCard, Loader2, Sliders, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useGetSubscription, useCancelSubscription, useDeleteAccount } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { data: subscription, refetch: refetchSubscription } = useGetSubscription();
  const cancelSubscription = useCancelSubscription();

  const [showBranding, setShowBranding] = useState<boolean>(
    () => localStorage.getItem("etscript_show_branding") !== "false",
  );

  const handleBrandingChange = (value: boolean) => {
    setShowBranding(value);
    localStorage.setItem("etscript_show_branding", value ? "true" : "false");
    toast({
      title: value ? "Attribution badge enabled" : "Attribution badge disabled",
      description: value
        ? '"Formatted with Etscript" will appear on the last page of new books.'
        : 'The "Formatted with Etscript" badge will be hidden on new books.',
    });
  };

  const deleteAccount = useDeleteAccount();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const isPremium = subscription?.plan === "premium";
  const isCancelled = subscription?.status === "cancelled";

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount.mutateAsync();
      await signOut();
    } catch {
      toast({
        title: "Could not delete account",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCancel = async () => {
    const ok = window.confirm(
      "Cancel your Premium subscription? You'll keep clean exports until the end of the current billing period.",
    );
    if (!ok) return;
    try {
      await cancelSubscription.mutateAsync();
      await refetchSubscription();
      toast({
        title: "Subscription cancelled",
        description: "You'll keep Premium access until your current period ends.",
      });
    } catch {
      toast({
        title: "Could not cancel subscription",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const fullName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";
  const firstName = fullName.split(" ")[0] || "";
  const lastName = fullName.split(" ").slice(1).join(" ") || "";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-serif text-primary border border-border">
                  {initial}
                </div>
              )}
              <div>
                <h3 className="font-medium text-lg text-foreground">{fullName}</h3>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">First Name</p>
                <p className="text-foreground">{firstName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Name</p>
                <p className="text-foreground">{lastName || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your Etscript plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Etscript Premium</p>
                      <Badge variant={isCancelled ? "secondary" : "default"}>
                        {isCancelled ? "Cancelling" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isCancelled ? "Access until " : "Renews on "}
                      {formatDate(subscription?.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                {!isCancelled && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={cancelSubscription.isPending}
                      className="gap-2"
                    >
                      {cancelSubscription.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Cancel subscription
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Free plan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Exports include a watermark. Upgrade for clean, unlimited exports.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button>Upgrade</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Email Address</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                Verified
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div>
                  <p className="font-medium text-foreground">Google Account</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" /> Formatting Preferences
            </CardTitle>
            <CardDescription>Defaults applied to new books you format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="global-branding" className="font-medium text-foreground cursor-pointer">
                  Attribution badge
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Show "Formatted with Etscript" on the last page of your books
                </p>
              </div>
              <Switch
                id="global-branding"
                checked={showBranding}
                onCheckedChange={handleBrandingChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div>
                <p className="font-medium text-foreground">Delete My Account</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Permanently removes your account, all manuscripts, jobs, and preferences. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4 shrink-0" disabled={deletingAccount}>
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated data — manuscripts, formatting jobs, exports, and preferences. This action <strong>cannot be undone</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 flex justify-end">
          <Button variant="destructive" onClick={() => signOut()} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
