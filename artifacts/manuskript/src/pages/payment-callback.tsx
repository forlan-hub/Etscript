import { useMemo } from "react";
import { useLocation } from "wouter";
import { useVerifyPayment } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Clock, Book } from "lucide-react";

function Outcome({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      {icon}
      <div>
        <h1 className="text-xl font-serif font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <Button className="mt-2" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export default function PaymentCallbackPage() {
  const [, setLocation] = useLocation();
  const reference = useMemo(
    () => new URLSearchParams(window.location.search).get("reference") ?? "",
    [],
  );

  const { data, isLoading, isError } = useVerifyPayment(
    { reference },
    { query: { enabled: !!reference, retry: 2 } as any },
  );

  const renderInner = () => {
    if (!reference) {
      return (
        <Outcome
          icon={<XCircle className="w-14 h-14 text-destructive" />}
          title="Missing payment reference"
          message="We couldn't find a payment to verify."
          actionLabel="Back to pricing"
          onAction={() => setLocation("/pricing")}
        />
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div>
            <h1 className="text-xl font-serif font-semibold">Verifying your payment…</h1>
            <p className="text-sm text-muted-foreground mt-1">This only takes a moment.</p>
          </div>
        </div>
      );
    }

    if (isError || !data) {
      return (
        <Outcome
          icon={<XCircle className="w-14 h-14 text-destructive" />}
          title="Verification failed"
          message="We couldn't confirm your payment. If you were charged, it will reflect shortly."
          actionLabel="Go to dashboard"
          onAction={() => setLocation("/dashboard")}
        />
      );
    }

    if (data.status === "success") {
      const isPremium = data.type === "premium_subscription";
      const jobId = data.jobId ?? null;
      return (
        <Outcome
          icon={<CheckCircle2 className="w-14 h-14 text-green-600" />}
          title={isPremium ? "Premium activated" : "Export unlocked"}
          message={
            isPremium
              ? "You now have unlimited clean exports. Thank you for subscribing!"
              : "This book's clean, watermark-free export is now unlocked."
          }
          actionLabel={jobId ? "Back to your book" : "Go to dashboard"}
          onAction={() => setLocation(jobId ? `/preview/${jobId}` : "/dashboard")}
        />
      );
    }

    if (data.status === "pending") {
      return (
        <Outcome
          icon={<Clock className="w-14 h-14 text-yellow-500" />}
          title="Payment processing"
          message="Your payment is still being confirmed. Please check again in a moment."
          actionLabel="Check again"
          onAction={() => window.location.reload()}
        />
      );
    }

    return (
      <Outcome
        icon={<XCircle className="w-14 h-14 text-destructive" />}
        title="Payment failed"
        message="Your payment didn't go through. You can try again from the pricing page."
        actionLabel="Back to pricing"
        onAction={() => setLocation("/pricing")}
      />
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center">
          <div className="flex items-center gap-2 text-primary">
            <Book className="w-5 h-5" />
            <span className="font-serif font-bold text-xl tracking-tight">Etscript</span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">{renderInner()}</CardContent>
        </Card>
      </main>
    </div>
  );
}
