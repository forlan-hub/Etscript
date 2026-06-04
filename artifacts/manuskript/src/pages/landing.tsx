import { FC } from "react";
import { Link } from "wouter";
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col selection:bg-primary/10">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Book className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">Manuskript AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden md:block">
              Pricing
            </Link>
            <div className="h-4 w-px bg-border hidden md:block" />
            <Link href="/sign-in" className="text-sm font-medium text-foreground hover:text-primary">
              Log in
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm text-primary mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              Professional formatting, instantly
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-semibold text-foreground tracking-tight leading-[1.1]">
              Turn raw manuscripts into <span className="text-primary italic">beautiful books.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A professional's quiet workspace for formatting and publishing preparation. Precise, respectful of your work, and satisfying to use.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base">Format Your Manuscript</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">View Pricing</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30 px-4 md:px-6 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Book className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-medium">Any Book Type</h3>
                <p className="text-muted-foreground leading-relaxed">
                  From novels and memoirs to complex training manuals and academic workbooks. We understand the specific typographical needs of every genre.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/><path d="M15 14c.2 0 .5-.2.7-.5s.5-.9.5-1.5c0-.8-.3-1.5-1-1.5h-2v4h2z"/><path d="M12 10h-2v4h2"/><path d="M9 10h-2v4"/></svg>
                </div>
                <h3 className="text-xl font-serif font-medium">Export Ready</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Export instantly to Amazon KDP, PDF, or eBook formats. Margins, bleed, and pagination are handled perfectly for your target publisher.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </div>
                <h3 className="text-xl font-serif font-medium">Total Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fine-tune typography, line spacing, margins, and chapter styles with a beautiful, distraction-free interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 md:px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Manuskript AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
