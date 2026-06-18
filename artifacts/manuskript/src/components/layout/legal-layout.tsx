import { Link } from "wouter";
import { Book, ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
  draft?: boolean;
}

export function LegalLayout({ title, effectiveDate, children, draft = false }: LegalLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Book className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">Etscript</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 pb-6 border-b border-border">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-3xl font-serif font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2">Effective date: {effectiveDate}</p>
          </div>

          {draft && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-8 text-sm text-amber-800">
              <strong>Notice:</strong> This document is currently being finalised by our legal team. The full text will be published here shortly. If you have questions in the meantime, contact us at{" "}
              <a href="mailto:legal@etscript.com" className="underline hover:text-amber-900">legal@etscript.com</a>.
            </div>
          )}

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-6">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 md:px-6 border-t border-border text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Etscript. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
          <Link href="/legal/cookies" className="hover:text-foreground transition-colors">Cookie Notice</Link>
          <Link href="/legal/data-retention" className="hover:text-foreground transition-colors">Data Retention</Link>
          <Link href="/legal/consent" className="hover:text-foreground transition-colors">User Consent</Link>
        </div>
      </footer>
    </div>
  );
}
