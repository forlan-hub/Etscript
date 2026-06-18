import { LegalLayout } from "@/components/layout/legal-layout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="To be confirmed">
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
        <p className="text-muted-foreground mt-2">
          This Privacy Policy describes how Etscript collects, uses, and protects your personal
          information in accordance with the Nigeria Data Protection Act (NDPA) and applicable GDPR principles.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Name and email address (account registration)</li>
          <li>Billing information (processed securely via Paystack)</li>
          <li>Manuscript files you upload (stored solely for formatting purposes)</li>
          <li>Usage data and activity logs (for service improvement)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. How We Use Your Information</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Data Sharing</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Your Rights</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
        <p className="text-muted-foreground mt-2">
          You may request access to, correction of, or deletion of your personal data at any time
          through your account Settings page or by contacting us at{" "}
          <a href="mailto:privacy@etscript.com" className="underline text-primary">privacy@etscript.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Security</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Contact</h2>
        <p className="text-muted-foreground">
          Data Controller: Etscript<br />
          Email:{" "}
          <a href="mailto:privacy@etscript.com" className="underline text-primary">privacy@etscript.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
