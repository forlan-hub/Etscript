import { LegalLayout } from "@/components/layout/legal-layout";

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use" effectiveDate="To be confirmed">
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
        <p className="text-muted-foreground mt-2">
          By creating an account or using Etscript, you agree to be bound by these Terms of Use.
          If you do not agree, please do not use the platform.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Description of Service</h2>
        <p className="text-muted-foreground">
          Etscript provides manuscript formatting and publishing preparation services. The platform
          formats your documents only — it does not rewrite, summarise, or alter your intellectual
          property in any way.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. User Accounts</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Intellectual Property</h2>
        <p className="text-muted-foreground">
          You retain 100% ownership of all manuscripts and documents you upload. Etscript acquires
          no ownership rights over your content. Etscript's platform, trademarks, and proprietary
          formatting engine are owned exclusively by Etscript.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Payments and Subscriptions</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Prohibited Uses</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Governing Law</h2>
        <p className="text-muted-foreground">
          These Terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">9. Contact</h2>
        <p className="text-muted-foreground">
          Email:{" "}
          <a href="mailto:legal@etscript.com" className="underline text-primary">legal@etscript.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
