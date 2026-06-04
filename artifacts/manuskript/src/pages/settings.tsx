import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/react";
import { User, Mail, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

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
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-serif text-primary border border-border">
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="font-medium text-lg text-foreground">{user?.fullName || "User"}</h3>
                <p className="text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">First Name</p>
                <p className="text-foreground">{user?.firstName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Name</p>
                <p className="text-foreground">{user?.lastName || "Not provided"}</p>
              </div>
            </div>
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
                  <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                Verified
              </div>
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