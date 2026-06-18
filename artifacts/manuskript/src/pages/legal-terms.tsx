import { LegalLayout } from "@/components/layout/legal-layout";

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use" effectiveDate="18 June 2026 · Last Updated: 18 June 2026" draft={false}>
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          These Terms of Use ("Terms") govern access to and use of the Etscript platform available
          through etscript.site. Etscript is owned and operated by{" "}
          <strong>FurstoneTech Solutions Limited</strong> ("FurstoneTech", "Etscript", "we", "our",
          or "us").
        </p>
        <p className="text-muted-foreground mt-3">
          By creating an account, accessing, or using Etscript, you agree to be bound by these
          Terms. If you do not agree to these Terms, you must not use the platform.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Eligibility</h2>
        <p className="text-muted-foreground mb-2">To use Etscript, you must:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Be at least 18 years old, or</li>
          <li>Be legally authorized to enter into binding agreements under applicable law.</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          During registration, users shall confirm eligibility by selecting the required age
          confirmation checkbox.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. Description of Services</h2>
        <p className="text-muted-foreground mb-2">
          Etscript is a manuscript formatting platform that enables users to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Upload manuscripts</li>
          <li>Edit manuscripts</li>
          <li>Apply formatting templates</li>
          <li>Preview formatted outputs</li>
          <li>Generate publication-ready exports</li>
          <li>Manage manuscript projects</li>
        </ul>
        <p className="text-muted-foreground mb-2">Etscript is <strong>not</strong>:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>
            A publishing company — though Etscript provides an ISBN Preparation Tool that assists
            users in formatting and generating metadata required for official ISBN application
            through relevant national ISBN agencies.
          </li>
          <li>A literary agency</li>
          <li>A legal review service</li>
          <li>A plagiarism detection service</li>
          <li>A grammar correction service</li>
          <li>A copyright registration service</li>
        </ul>
        <p className="text-muted-foreground">
          Users remain responsible for the content they upload and publish.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. User Accounts</h2>
        <p className="text-muted-foreground mb-2">Users are responsible for:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Maintaining the confidentiality of login credentials</li>
          <li>Restricting access to their accounts</li>
          <li>All activities conducted through their accounts</li>
        </ul>
        <p className="text-muted-foreground">
          Users shall immediately notify Etscript of any suspected unauthorized access. Etscript
          reserves the right to suspend or terminate accounts where security concerns arise.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. User Content</h2>
        <p className="text-muted-foreground mb-2">
          Users may upload manuscripts, books, reports, training materials, and other documents
          ("User Content"). Users represent and warrant that they:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Own the content; or</li>
          <li>Have the legal right to upload and process the content.</li>
        </ul>
        <p className="text-muted-foreground mb-2">
          Users shall not upload content that infringes:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Copyrights</li>
          <li>Trademarks</li>
          <li>Patents</li>
          <li>Trade secrets</li>
          <li>Privacy rights</li>
          <li>Other intellectual property rights</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Ownership of Content</h2>
        <p className="text-muted-foreground">
          Users retain full ownership of all User Content uploaded to Etscript. Nothing in these
          Terms transfers ownership of User Content to Etscript.
        </p>
        <p className="text-muted-foreground mt-3 mb-2">
          By uploading content, users grant Etscript a limited, non-exclusive, revocable right to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>Store content</li>
          <li>Process content</li>
          <li>Format content</li>
          <li>Generate exports</li>
        </ul>
        <p className="text-muted-foreground">
          solely for the purpose of providing requested services.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Prohibited Uses</h2>
        <p className="text-muted-foreground mb-2">Users shall not:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Upload unlawful content</li>
          <li>Upload malicious software</li>
          <li>Upload content designed to disrupt the platform</li>
          <li>Attempt unauthorized access</li>
          <li>Circumvent security controls</li>
          <li>Reverse engineer the platform</li>
          <li>Use automated bots to abuse services</li>
          <li>Interfere with platform operations</li>
          <li>Use Etscript for fraudulent purposes</li>
        </ul>
        <p className="text-muted-foreground">
          Violation may result in suspension or termination of access.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Template Licensing</h2>
        <p className="text-muted-foreground">
          Formatting templates provided by Etscript remain the intellectual property of
          FurstoneTech Solutions Limited. Users receive a limited license to use templates solely
          through the Etscript platform.
        </p>
        <p className="text-muted-foreground mt-3 mb-2">Users may not:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Extract template code</li>
          <li>Reproduce templates for commercial resale</li>
          <li>Redistribute template packages</li>
          <li>Create competing template libraries using Etscript proprietary assets</li>
        </ul>
        <p className="text-muted-foreground">
          Documents generated using templates belong entirely to the user.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">9. Fees and Payments</h2>
        <p className="text-muted-foreground mb-3">
          Certain services require payment. Available pricing plans include:
        </p>
        <div className="space-y-3">
          {[
            { plan: "Free Plan", desc: "Subject to storage, export, and feature limitations." },
            { plan: "Pay-Per-Export", desc: "One-time export purchase." },
            { plan: "Premium Subscription", desc: "Recurring monthly subscription." },
          ].map(({ plan, desc }) => (
            <div key={plan} className="rounded-md border border-border px-4 py-3">
              <p className="font-semibold text-sm text-foreground">{plan}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3">
          Prices may be modified from time to time upon reasonable notice.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">10. Subscription Renewals</h2>
        <p className="text-muted-foreground">
          Premium subscriptions may renew automatically unless cancelled by the user. Users are
          responsible for managing subscription settings and ensuring valid payment methods remain
          available.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">11. Subscription Expiry</h2>
        <p className="text-muted-foreground mb-2">
          Expiration of a subscription shall not result in deletion of User Content. After expiry,
          users may:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Access their accounts</li>
          <li>View stored manuscripts</li>
          <li>Renew subscriptions</li>
          <li>Purchase one-time exports</li>
        </ul>
        <p className="text-muted-foreground mb-2">Users may not:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>Use formatting engines</li>
          <li>Generate new exports</li>
          <li>Access premium formatting features</li>
        </ul>
        <p className="text-muted-foreground">until payment requirements are satisfied.</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">12. Refunds</h2>
        <p className="text-muted-foreground">
          Due to the immediate digital nature of formatting and export services, payments may be
          non-refundable once services have been consumed. However, Etscript may consider refunds
          in cases involving:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3 mb-3">
          <li>Duplicate charges</li>
          <li>Technical failures</li>
          <li>Billing errors</li>
        </ul>
        <p className="text-muted-foreground">
          Refund decisions shall be made at Etscript's discretion and subject to applicable
          consumer protection laws.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">13. Storage Limits</h2>
        <p className="text-muted-foreground">
          Storage allocations vary by subscription plan. Users are responsible for managing their
          allocated storage. Etscript may enforce manuscript limits, storage quotas, and export
          limits in accordance with the user's selected plan.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">14. Service Availability</h2>
        <p className="text-muted-foreground">
          While Etscript strives to maintain reliable service availability, uninterrupted access
          cannot be guaranteed. The platform may occasionally experience maintenance periods,
          technical issues, network interruptions, or third-party service outages. Etscript shall
          not be liable for temporary interruptions beyond its reasonable control.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">15. Export Quality Disclaimer</h2>
        <p className="text-muted-foreground">
          Etscript applies automated formatting rules based on selected templates and user
          preferences. Users are responsible for reviewing exported documents before publication,
          printing, or distribution. Etscript does not guarantee publishing acceptance, printing
          acceptance, editorial approval, or commercial success of any formatted manuscript.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">16. Intellectual Property</h2>
        <p className="text-muted-foreground mb-2">
          All platform components — including software, branding, logos, interface designs, template
          systems, and documentation — remain the property of FurstoneTech Solutions Limited or its
          licensors. No rights are transferred except as expressly stated in these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">17. Privacy</h2>
        <p className="text-muted-foreground">
          Personal data is processed in accordance with the{" "}
          <a href="/legal/privacy" className="underline text-primary">Etscript Privacy Policy</a>.
          Users should review the Privacy Policy before using the platform.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">18. Termination</h2>
        <p className="text-muted-foreground mb-2">
          Etscript may suspend or terminate access where users:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Violate these Terms</li>
          <li>Engage in unlawful conduct</li>
          <li>Abuse platform resources</li>
          <li>Compromise platform security</li>
        </ul>
        <p className="text-muted-foreground">
          Upon termination, access to services may be restricted in accordance with applicable law
          and retention obligations.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">19. Limitation of Liability</h2>
        <p className="text-muted-foreground mb-2">
          To the maximum extent permitted by law, Etscript and FurstoneTech Solutions Limited shall
          not be liable for:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Indirect damages</li>
          <li>Consequential damages</li>
          <li>Loss of profits</li>
          <li>Loss of manuscripts caused by user actions</li>
          <li>Publishing losses</li>
          <li>Business interruptions</li>
        </ul>
        <p className="text-muted-foreground">
          arising from use of the platform. Nothing in these Terms excludes liability that cannot
          lawfully be excluded.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">20. Indemnity</h2>
        <p className="text-muted-foreground mb-2">
          Users agree to indemnify and hold harmless FurstoneTech Solutions Limited, its officers,
          employees, contractors, and affiliates from claims arising from:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>User Content</li>
          <li>Copyright infringement by users</li>
          <li>Misuse of the platform</li>
          <li>Violations of these Terms</li>
          <li>Violations of applicable law</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">21. Changes to the Terms</h2>
        <p className="text-muted-foreground">
          Etscript may update these Terms from time to time. Material changes may be communicated
          through website notices, email notifications, or in-platform alerts. Continued use of the
          platform following updates constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">22. Governing Law</h2>
        <p className="text-muted-foreground">
          These Terms shall be governed by and construed in accordance with the laws of the Federal
          Republic of Nigeria. Any disputes arising from these Terms shall be subject to the
          jurisdiction of competent courts in Nigeria, unless otherwise required by applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">23. Contact Information</h2>
        <div className="rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">FurstoneTech Solutions Limited</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 mt-4">
        <p className="text-sm font-semibold text-foreground mb-1">Important Notice</p>
        <p className="text-sm text-muted-foreground">
          Etscript is a formatting platform. Users retain ownership of their manuscripts and remain
          solely responsible for the legality, accuracy, originality, publication, and distribution
          of their content.
        </p>
      </div>
    </LegalLayout>
  );
}
