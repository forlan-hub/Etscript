import { LegalLayout } from "@/components/layout/legal-layout";

export default function UserConsentNoticePage() {
  return (
    <LegalLayout title="User Consent Notice" effectiveDate="To be confirmed">
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. What You Are Consenting To</h2>
        <p className="text-muted-foreground">
          When you create an Etscript account, you give your informed consent to the following:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
          <li>Collection and processing of your name and email address for account management</li>
          <li>Storage of manuscript files you upload for the purpose of formatting</li>
          <li>Processing of billing information through our payment provider (Paystack)</li>
          <li>Use of essential cookies required for authentication and session management</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. What We Do Not Do</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>We do not read, analyse, or train AI models on your manuscript content</li>
          <li>We do not sell your personal data to third parties</li>
          <li>We do not claim any intellectual property rights over your uploaded content</li>
          <li>We do not send marketing communications without your explicit opt-in</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. Basis for Processing</h2>
        <p className="text-muted-foreground">
          Your data is processed on the following legal bases under the Nigeria Data Protection Act
          (NDPA) and GDPR principles:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
          <li><strong>Contract performance</strong> — to deliver the formatting service you signed up for</li>
          <li><strong>Legal obligation</strong> — to comply with financial record-keeping requirements</li>
          <li><strong>Legitimate interests</strong> — to detect and prevent fraud and abuse</li>
          <li><strong>Consent</strong> — for any optional communications or non-essential data uses</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Age Requirement</h2>
        <p className="text-muted-foreground">
          You must be at least 18 years of age to use Etscript. By creating an account, you confirm
          that you meet this requirement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Withdrawing Consent</h2>
        <p className="text-muted-foreground">
          You may withdraw consent at any time by deleting your account from{" "}
          <strong>Settings → Danger Zone</strong>. For consent specific to marketing communications,
          you may opt out via the unsubscribe link in any email we send you.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Contact</h2>
        <p className="text-muted-foreground">
          Questions about consent or your rights:{" "}
          <a href="mailto:privacy@etscript.com" className="underline text-primary">privacy@etscript.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
