import { LegalLayout } from "@/components/layout/legal-layout";

export default function UserConsentNoticePage() {
  return (
    <LegalLayout title="User Consent Notice" effectiveDate="18 June 2026 · Last Updated: 18 June 2026" draft={false}>
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">
          This User Consent Notice explains how Etscript, a service operated by{" "}
          <strong>FurstoneTech Solutions Limited</strong>, obtains, manages, and records user
          consent for the collection and processing of personal data.
        </p>
        <p className="text-muted-foreground mt-3">
          By creating an account, using Etscript, or interacting with our services, you may be
          asked to provide consent for specific processing activities described in this Notice.
        </p>
        <p className="text-muted-foreground mt-3">
          Consent is one of the lawful bases upon which Etscript may process personal data,
          alongside contractual necessity, legal obligations, and legitimate interests where
          applicable.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">2. Consent During Account Registration</h2>
        <p className="text-muted-foreground mb-4">
          During account creation, users shall be required to acknowledge the following:
        </p>
        <div className="space-y-3">
          {[
            { label: "Terms of Use", desc: "I have read and agree to the Etscript Terms of Use.", href: "/legal/terms" },
            { label: "Privacy Policy", desc: "I have read and understand the Etscript Privacy Policy.", href: "/legal/privacy" },
            { label: "Age Confirmation", desc: "I confirm that I am at least 18 years old and eligible to use Etscript.", href: null },
          ].map(({ label, desc, href }) => (
            <div key={label} className="flex items-start gap-3 rounded-md border border-border px-4 py-3">
              <div className="mt-0.5 w-4 h-4 rounded border-2 border-muted-foreground/40 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {href ? <a href={href} className="underline text-primary hover:opacity-80">{label}</a> : label}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-sm font-medium">
          Users shall not be able to complete registration without accepting all three mandatory
          acknowledgements.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. Consent for Personal Data Processing</h2>
        <p className="text-muted-foreground mb-2">
          By creating an account and using Etscript, users consent to the processing of personal
          data necessary to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Create and manage accounts</li>
          <li>Authenticate users</li>
          <li>Store manuscripts and documents</li>
          <li>Apply formatting templates</li>
          <li>Generate exports</li>
          <li>Process payments</li>
          <li>Deliver customer support</li>
          <li>Maintain platform security</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          The personal data collected shall be limited to what is necessary to provide these services.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Consent for Manuscript Processing</h2>
        <p className="text-muted-foreground mb-2">
          By uploading content to Etscript, users consent to the processing of their documents
          solely for the purpose of:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Formatting manuscripts</li>
          <li>Applying selected templates</li>
          <li>Generating exports</li>
          <li>Storing user content</li>
          <li>Providing requested platform features</li>
        </ul>
        <p className="text-muted-foreground">
          Etscript does not claim ownership of uploaded content. Users retain full ownership of all
          manuscripts and documents uploaded to the platform.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Email Communication Consent</h2>
        <p className="text-muted-foreground mb-2">
          Certain communications are necessary for the operation of Etscript and may be sent
          regardless of marketing preferences:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Account verification</li>
          <li>Password reset emails</li>
          <li>Login alerts</li>
          <li>Security notifications</li>
          <li>Subscription and billing notices</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Optional Marketing Consent</h2>
        <p className="text-muted-foreground mb-3">
          Where marketing communications are introduced, Etscript shall obtain separate, explicit
          consent. Users may withdraw marketing consent at any time, and marketing consent shall
          not be required to use Etscript.
        </p>
        <div className="flex items-start gap-3 rounded-md border border-border px-4 py-3 opacity-60">
          <div className="mt-0.5 w-4 h-4 rounded border-2 border-muted-foreground/40 shrink-0" />
          <p className="text-sm text-muted-foreground">
            I would like to receive product updates, announcements, educational content, and
            promotional communications from Etscript. <em>(Optional)</em>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Cookie Consent</h2>
        <p className="text-muted-foreground">
          Etscript uses essential cookies necessary for authentication, security, session management,
          and platform functionality. Where additional categories of cookies are introduced in the
          future, users shall be provided with appropriate notice and consent options where required
          by law. Further details are available in the{" "}
          <a href="/legal/cookies" className="underline text-primary">Etscript Cookie Notice</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Consent for Payment Processing</h2>
        <p className="text-muted-foreground mb-2">
          When making payments through Etscript, users consent to the processing of
          payment-related information by authorized payment providers for the purpose of:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Processing transactions</li>
          <li>Managing subscriptions</li>
          <li>Preventing fraud</li>
          <li>Meeting legal and accounting obligations</li>
        </ul>
        <p className="text-muted-foreground">
          Etscript does not store full payment card information. Payment processing is performed
          by authorized third-party payment providers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">9. Third-Party Service Providers</h2>
        <p className="text-muted-foreground mb-3">
          Users acknowledge that Etscript relies on trusted service providers to deliver its
          services. Where necessary, personal data may be processed by such providers solely for
          service delivery purposes:
        </p>
        <div className="space-y-2">
          {[
            { name: "Supabase", role: "Data storage and authentication" },
            { name: "Paystack", role: "Payment processing" },
            { name: "Resend", role: "Email delivery" },
            { name: "Google OAuth", role: "Authentication" },
          ].map(({ name, role }) => (
            <div key={name} className="flex gap-3 text-sm">
              <span className="font-medium text-foreground w-32 shrink-0">{name}</span>
              <span className="text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">10. Withdrawal of Consent</h2>
        <p className="text-muted-foreground mb-2">
          Where processing is based on consent, users may withdraw consent at any time. Withdrawal
          of consent does not affect the lawfulness of processing carried out before the withdrawal.
          Users may withdraw consent by:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Updating account settings</li>
          <li>Contacting <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></li>
          <li>Using available unsubscribe mechanisms</li>
        </ul>
        <p className="text-muted-foreground">
          Please note that withdrawing consent for certain processing activities may affect the
          availability of some platform features.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">11. Consent Records</h2>
        <p className="text-muted-foreground mb-2">Etscript may maintain records of:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Consent provided and consent withdrawals</li>
          <li>Acceptance timestamps</li>
          <li>Policy versions accepted</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          These records are maintained to demonstrate compliance with applicable legal and
          regulatory requirements.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">12. Changes to This Notice</h2>
        <p className="text-muted-foreground">
          Etscript may update this User Consent Notice from time to time. Where material changes
          are made, users may be notified through website notices, email notifications, or
          in-platform notifications. Continued use of the platform following such updates may
          require renewed acknowledgement where applicable.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">13. Contact Information</h2>
        <div className="rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">Privacy Office — FurstoneTech Solutions Limited</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 mt-4">
        <p className="text-sm font-semibold text-foreground mb-1">Consent Commitment</p>
        <p className="text-sm text-muted-foreground">
          Etscript is committed to obtaining consent transparently, processing personal data
          responsibly, and giving users meaningful control over how their information is used.
          Consent is never bundled with unrelated purposes, and users are free to withdraw optional
          consents without losing access to core platform functionality.
        </p>
      </div>
    </LegalLayout>
  );
}
