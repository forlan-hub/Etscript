import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Book } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "₦0",
      description: "For authors starting out",
      features: [
        "1 Manuscript upload",
        "Classic theme only",
        "Watermarked PDF export",
        "Basic readiness check"
      ],
      cta: user ? "Current Plan" : "Get Started",
      primary: false
    },
    {
      name: "Pay-As-You-Go",
      price: "₦2,500",
      period: "/ export",
      description: "Perfect for single book projects",
      features: [
        "All premium themes",
        "Custom typography & layouts",
        "Print-ready PDF & DOCX",
        "Full readiness report",
        "No watermarks"
      ],
      cta: "Format a Book",
      primary: true
    },
    {
      name: "Premium",
      price: "₦5,000",
      period: "/ month",
      description: "For prolific authors & consultants",
      features: [
        "Unlimited exports",
        "All premium features",
        "Priority processing",
        "Save custom templates",
        "Email support"
      ],
      cta: "Subscribe Now",
      primary: false
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
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

      <main className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground">Professional formatting shouldn't cost a fortune. Pay only for what you need.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative flex flex-col ${plan.primary ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
                {plan.primary && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground h-10">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.primary ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
