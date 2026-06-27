import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Book, Loader2, Zap, Crown, Infinity } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import { useCreateCheckout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type PaymentType =
  | "payg_export"
  | "premium_subscription"
  | "premium_quarterly"
  | "premium_annual"
  | "lifetime_access";

interface PlanDef {
  key: string;
  paymentType?: PaymentType;
  name: string;
  price: string;
  originalPrice?: string;
  period?: string;
  savings?: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
  icon?: React.ReactNode;
  ctaVariant?: "default" | "outline" | "secondary";
}

const PLANS: PlanDef[] = [
  {
    key: "free",
    name: "Free",
    price: "₦0",
    description: "Get started with Etscript at no cost",
    features: [
      "Up to 3 manuscripts",
      "50 MB storage",
      "DOCX & TXT upload",
      "Formatting preview",
      "Watermarked PDF export",
    ],
    cta: "Get Started",
    featured: false,
    ctaVariant: "outline",
  },
  {
    key: "payg",
    paymentType: "payg_export",
    name: "Pay-As-You-Go",
    price: "₦2,500",
    period: "/ book",
    description: "Unlock clean exports one book at a time",
    features: [
      "Up to 10 manuscripts",
      "200 MB storage",
      "Clean PDF + DOCX (per book)",
      "All book types & themes",
      "Priority formatting",
    ],
    cta: "Format a Book",
    featured: false,
    icon: <Zap className="h-4 w-4" />,
    ctaVariant: "outline",
  },
  {
    key: "monthly",
    paymentType: "premium_subscription",
    name: "Premium Monthly",
    price: "₦5,000",
    period: "/ month",
    description: "Unlimited clean exports every month",
    features: [
      "Unlimited manuscripts",
      "2 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
    ],
    cta: "Subscribe Monthly",
    featured: false,
    ctaVariant: "outline",
  },
  {
    key: "quarterly",
    paymentType: "premium_quarterly",
    name: "Premium Quarterly",
    price: "₦12,000",
    originalPrice: "₦15,000",
    period: "/ 3 months",
    savings: "Save 20%",
    description: "3 months of unlimited exports — best value",
    features: [
      "Unlimited manuscripts",
      "2 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
      "20% savings vs monthly",
    ],
    cta: "Subscribe Quarterly",
    featured: true,
    badge: "Most Popular",
    icon: <Crown className="h-4 w-4" />,
    ctaVariant: "default",
  },
  {
    key: "annual",
    paymentType: "premium_annual",
    name: "Premium Annual",
    price: "₦36,000",
    originalPrice: "₦60,000",
    period: "/ year",
    savings: "Save 40%",
    description: "12 months of unlimited exports",
    features: [
      "Unlimited manuscripts",
      "5 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
      "40% savings vs monthly",
      "Early access to new features",
    ],
    cta: "Subscribe Annually",
    featured: false,
    ctaVariant: "outline",
  },
  {
    key: "lifetime",
    paymentType: "lifetime_access",
    name: "Founder's Lifetime",
    price: "₦100,000",
    period: "once",
    description: "One payment. Access forever.",
    features: [
      "Unlimited manuscripts",
      "10 GB storage",
      "Unlimited clean exports — forever",
      "All themes & book types",
      "Custom templates",
      "Founder badge",
      "Priority support — lifetime",
      "All future features included",
    ],
    cta: "Get Lifetime Access",
    featured: false,
    badge: "Founder",
    icon: <Infinity className="h-4 w-4" />,
    ctaVariant: "outline",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const checkout = useCreateCheckout();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function handleCta(plan: PlanDef) {
    if (!plan.paymentType || plan.key === "free") {
      setLocation(user ? "/dashboard" : "/sign-in");
      return;
    }
    if (plan.key === "payg") {
      // PAYG is purchased per-book on the preview screen
      setLocation(user ? "/dashboard" : "/sign-in");
      return;
    }
    if (!user) {
      setLocation("/sign-in");
      return;
    }
    setLoadingKey(plan.key);
    try {
      const res = await checkout.mutateAsync({ data: { type: plan.paymentType } });
      window.location.href = res.authorizationUrl;
    } catch {
      toast({
        title: "Could not start checkout",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setLoadingKey(null);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Book className="w-5 h-5" />
            <span className="font-serif font-bold text-xl tracking-tight">Etscript</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard"><Button size="sm">Dashboard</Button></Link>
            ) : (
              <Link href="/sign-in"><Button size="sm">Sign In</Button></Link>
            )}
          </div>
        </div>
      </header>

      <main className="py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Professional manuscript formatting for Nigerian authors. Pay only for what you need.
            </p>
          </div>

          {/* Top row: Free + PAYG */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            {PLANS.slice(0, 2).map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                loading={loadingKey === plan.key}
                onCta={() => handleCta(plan)}
              />
            ))}
          </div>

          {/* Premium row: Monthly + Quarterly + Annual */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Premium Plans — Unlimited Everything
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.slice(2, 5).map((plan) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  loading={loadingKey === plan.key}
                  onCta={() => handleCta(plan)}
                />
              ))}
            </div>
          </div>

          {/* Lifetime — full-width hero card */}
          <div className="max-w-2xl mx-auto">
            <LifetimeCard
              plan={PLANS[5]}
              loading={loadingKey === "lifetime"}
              onCta={() => handleCta(PLANS[5])}
            />
          </div>

          {/* FAQ / notes */}
          <div className="mt-16 max-w-2xl mx-auto text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              All prices in Nigerian Naira (₦). Payments processed securely via Paystack.
            </p>
            <p className="text-sm text-muted-foreground">
              Quarterly and Annual plans are one-time charges — not recurring subscriptions.
            </p>
            <p className="text-sm text-muted-foreground">
              Questions? Email <a href="mailto:support@etscript.site" className="underline underline-offset-2">support@etscript.site</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  loading,
  onCta,
}: {
  plan: PlanDef;
  loading: boolean;
  onCta: () => void;
}) {
  return (
    <Card
      className={`relative flex flex-col ${
        plan.featured
          ? "border-primary ring-1 ring-primary shadow-lg"
          : "border-border"
      }`}
    >
      {plan.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Badge className="text-xs px-3 py-0.5 shadow-sm">
            {plan.badge}
          </Badge>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-serif">{plan.name}</CardTitle>
          {plan.savings && (
            <Badge variant="secondary" className="text-xs shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {plan.savings}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="mb-5">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
            {plan.period && (
              <span className="text-muted-foreground text-sm pb-0.5">{plan.period}</span>
            )}
          </div>
          {plan.originalPrice && (
            <p className="text-xs text-muted-foreground line-through mt-0.5">
              was {plan.originalPrice}
            </p>
          )}
        </div>
        <ul className="space-y-2.5">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full gap-2"
          variant={plan.ctaVariant ?? "outline"}
          onClick={onCta}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : plan.icon ? (
            plan.icon
          ) : null}
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LifetimeCard({
  plan,
  loading,
  onCta,
}: {
  plan: PlanDef;
  loading: boolean;
  onCta: () => void;
}) {
  return (
    <Card className="relative overflow-hidden border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs px-3">
            {plan.badge}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-amber-900 dark:text-amber-100">
          {plan.name}
        </CardTitle>
        <p className="text-sm text-amber-700/80 dark:text-amber-300/80">{plan.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="shrink-0">
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100">{plan.price}</div>
            <div className="text-sm text-amber-700/70 dark:text-amber-300/70">{plan.period}</div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-sm text-amber-800 dark:text-amber-200">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white border-0"
          onClick={onCta}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Infinity className="h-4 w-4" />}
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
