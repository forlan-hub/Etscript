import { LegalLayout } from "@/components/layout/legal-layout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="18 June 2026 · Last Updated: 18 June 2026" draft={false}>
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">
          Welcome to Etscript, a manuscript formatting and publishing preparation platform owned
          and operated by <strong>FurstoneTech Solutions Limited</strong> ("FurstoneTech", "Etscript",
          "we", "our", or "us").
        </p>
        <p className="text-muted-foreground mt-3">
          At Etscript, we are committed to protecting your privacy and ensuring that your personal
          data is processed lawfully, fairly, transparently, and securely. This Privacy Policy
          explains how we collect, use, store, disclose, and protect your personal information when
          you use our website and services available through etscript.site.
        </p>
        <p className="text-muted-foreground mt-3">
          This Privacy Policy has been developed in accordance with applicable data protection laws,
          including the Nigeria Data Protection Act (NDPA) 2023, the General Data Protection
          Regulation (GDPR) where applicable, and other relevant privacy laws.
        </p>
        <p className="text-muted-foreground mt-3">
          By accessing or using Etscript, you acknowledge that you have read and understood this
          Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Who We Are</h2>
        <p className="text-muted-foreground">
          Etscript is a digital platform that enables users to upload manuscripts, apply professional
          formatting templates, preview formatted outputs, and export publication-ready documents.
        </p>
        <div className="mt-3 rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">Data Controller</p>
          <p>FurstoneTech Solutions Limited</p>
          <p>[Insert Registered Business Address]</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
        <p className="text-muted-foreground mt-3">
          For the purposes of applicable data protection laws, FurstoneTech Solutions Limited is
          the Data Controller responsible for the processing of your personal data.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">3. Personal Data We Collect</h2>
        <p className="text-muted-foreground mb-3">
          We collect only the personal data necessary to provide and improve our services.
        </p>

        <h3 className="font-semibold text-sm text-foreground mb-2">A. Information You Provide Directly</h3>
        <p className="text-muted-foreground mb-2">
          When you create an account or use our services, we may collect:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Full name</li>
          <li>Email address</li>
          <li>Login credentials</li>
          <li>Account preferences</li>
          <li>Subscription selections</li>
          <li>Payment-related information</li>
          <li>Customer support communications</li>
        </ul>

        <h3 className="font-semibold text-sm text-foreground mb-2">B. Manuscripts and User Content</h3>
        <p className="text-muted-foreground mb-2">When you use Etscript, we may process:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>Manuscripts</li>
          <li>Books</li>
          <li>Training manuals</li>
          <li>Reports</li>
          <li>Research papers</li>
          <li>Templates</li>
          <li>Formatting preferences</li>
          <li>Generated exports</li>
        </ul>
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          You remain the sole owner of all content uploaded to the platform.
        </p>

        <h3 className="font-semibold text-sm text-foreground mb-2 mt-4">C. Authentication Information</h3>
        <p className="text-muted-foreground mb-2">
          Where you choose to sign in using a third-party authentication service such as Google,
          we may receive:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>Name</li>
          <li>Email address</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Etscript does not intentionally collect profile photographs or unnecessary profile
          information.
        </p>

        <h3 className="font-semibold text-sm text-foreground mb-2 mt-4">D. Technical Information</h3>
        <p className="text-muted-foreground mb-2">
          When you use our platform, we may automatically collect:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device information</li>
          <li>Operating system</li>
          <li>Login timestamps</li>
          <li>Security logs</li>
          <li>Usage statistics necessary for platform operation</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          This information is collected primarily for security, fraud prevention, and system
          administration purposes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Information We Do Not Collect</h2>
        <p className="text-muted-foreground mb-2">
          Consistent with the principle of data minimization, Etscript does not intentionally collect:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Date of birth</li>
          <li>Gender</li>
          <li>Nationality</li>
          <li>Residential address</li>
          <li>Government-issued identification numbers</li>
          <li>Religious beliefs</li>
          <li>Political opinions</li>
          <li>Biometric information</li>
          <li>Social media profile data</li>
          <li>Sensitive personal information unless voluntarily included within user-uploaded documents</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">5. Purposes of Processing</h2>
        <p className="text-muted-foreground mb-3">
          We process personal data for the following purposes:
        </p>

        <h3 className="font-semibold text-sm text-foreground mb-1">Service Delivery</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Create and manage user accounts</li>
          <li>Authenticate users</li>
          <li>Process manuscripts</li>
          <li>Apply formatting templates</li>
          <li>Generate exports</li>
          <li>Deliver subscription services</li>
        </ul>

        <h3 className="font-semibold text-sm text-foreground mb-1">Payment Processing</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Process payments</li>
          <li>Manage subscriptions</li>
          <li>Verify transactions</li>
          <li>Prevent fraud</li>
        </ul>

        <h3 className="font-semibold text-sm text-foreground mb-1">Customer Support</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Respond to enquiries</li>
          <li>Resolve technical issues</li>
          <li>Provide assistance</li>
        </ul>

        <h3 className="font-semibold text-sm text-foreground mb-1">Security and Compliance</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Maintain platform security</li>
          <li>Detect unauthorized access</li>
          <li>Prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3 className="font-semibold text-sm text-foreground mb-1">Business Analytics</h3>
        <p className="text-muted-foreground mb-2">
          To generate internal operational metrics such as:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
          <li>Number of registered users</li>
          <li>Number of exports</li>
          <li>Subscription growth</li>
          <li>Revenue trends</li>
          <li>Template usage statistics</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Etscript does not use personal data for behavioural advertising or profiling.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">6. Legal Basis for Processing</h2>
        <p className="text-muted-foreground mb-3">
          We process personal data on one or more of the following lawful bases:
        </p>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm text-foreground">Contractual Necessity</p>
            <p className="text-muted-foreground text-sm">Processing necessary to provide services requested by users.</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Consent</p>
            <p className="text-muted-foreground text-sm">Where users voluntarily provide consent for specific processing activities.</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Legal Obligation</p>
            <p className="text-muted-foreground text-sm">Processing required to comply with applicable laws and regulatory requirements.</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Legitimate Interests</p>
            <p className="text-muted-foreground text-sm">
              Processing necessary for platform security, fraud prevention, service improvement,
              and operational analytics, provided such interests do not override your rights and freedoms.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Automated Processing</h2>
        <p className="text-muted-foreground">
          Etscript uses automated systems to analyse document structure and apply selected formatting
          templates. This processing may influence document layout, chapter formatting, heading styles,
          readiness scores, and export outputs.
        </p>
        <p className="text-muted-foreground mt-3">
          Users retain control over formatting choices and may review and modify content before export.
          Etscript does not use automated processing to make decisions producing legal or similarly
          significant effects on users.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Artificial Intelligence and Content Processing</h2>
        <p className="text-muted-foreground">
          Etscript's manuscript formatting services are designed to operate through rule-based formatting
          systems. Unless expressly disclosed and consented to in the future:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
          <li>User manuscripts are not used to train artificial intelligence models.</li>
          <li>User manuscripts are not sold to third parties.</li>
          <li>User manuscripts are not licensed for commercial use.</li>
          <li>Etscript does not claim ownership over uploaded content.</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Any future use of AI-powered features will be communicated transparently and may require
          separate user consent where applicable.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">9. Intellectual Property Ownership</h2>
        <p className="text-muted-foreground">
          Users retain full ownership of all manuscripts, books, reports, documents, and other content
          uploaded to Etscript. By uploading content to the platform, users grant Etscript only the
          limited rights necessary to process, format, store, and generate outputs requested by the user.
        </p>
        <p className="text-muted-foreground mt-3">Etscript does not acquire:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
          <li>Ownership rights</li>
          <li>Publishing rights</li>
          <li>Commercial exploitation rights</li>
          <li>Licensing rights</li>
          <li>Derivative rights</li>
        </ul>
        <p className="text-muted-foreground mt-2">over user content.</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">10. Sharing of Personal Data</h2>
        <p className="text-muted-foreground font-medium">We do not sell personal data.</p>
        <p className="text-muted-foreground mt-2">
          We may share information with trusted service providers that assist in delivering our services:
        </p>
        <div className="mt-3 space-y-3">
          {[
            { name: "Paystack", role: "Payment Processor", desc: "For payment processing and subscription management." },
            { name: "Supabase", role: "Database and Infrastructure Provider", desc: "For secure data storage and authentication services." },
            { name: "Resend", role: "Email Service Provider", desc: "For transactional communications and account notifications." },
            { name: "Google OAuth", role: "Authentication Provider", desc: "Where users choose Google Sign-In." },
          ].map((p) => (
            <div key={p.name} className="rounded-md border border-border px-4 py-3">
              <p className="font-semibold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          We may also disclose information where required by law or lawful government request.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">11. International Data Transfers</h2>
        <p className="text-muted-foreground">
          Some service providers may process data outside Nigeria. Where personal data is processed
          outside Nigeria, Etscript relies on reputable service providers that implement contractual,
          technical, and organizational safeguards designed to protect personal data in accordance
          with applicable data protection laws.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">12. Data Retention</h2>
        <p className="text-muted-foreground mb-4">
          We retain personal data only for as long as necessary to fulfil the purposes described in
          this Privacy Policy.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 font-medium">Data Category</th>
                <th className="text-left py-2 px-3 font-medium">Retention Period</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Active Account Data", "Until account closure"],
                ["Manuscripts", "Until deleted by user"],
                ["Generated Exports", "Up to 90 days"],
                ["Deleted Content", "Removed within 30 days"],
                ["Audit Logs", "Up to 12 months"],
                ["Payment Records", "As required by applicable tax, accounting, audit, fraud prevention, and legal obligations"],
              ].map(([category, period], i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium text-foreground/80">{category}</td>
                  <td className="py-2 px-3">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Retention periods may be extended where required by law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">13. Security of Personal Data</h2>
        <p className="text-muted-foreground">
          We implement reasonable technical and organizational measures designed to protect personal
          data against unauthorized access, accidental loss, destruction, disclosure, and alteration.
          Security measures may include:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
          <li>Encryption</li>
          <li>Secure authentication</li>
          <li>Access controls</li>
          <li>Monitoring and logging</li>
          <li>Secure hosting environments</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          While no system is completely secure, we strive to protect personal data using
          industry-recognized security practices.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">14. Your Rights</h2>
        <p className="text-muted-foreground mb-2">
          Subject to applicable law, you may have the right to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete personal data</li>
          <li>Restrict processing</li>
          <li>Object to processing</li>
          <li>Withdraw consent</li>
          <li>Request data portability</li>
          <li>Lodge complaints with a competent data protection authority</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Requests may be submitted to:{" "}
          <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">15. Account Deletion</h2>
        <p className="text-muted-foreground">
          Users may request deletion of their accounts and associated data. Upon receiving a valid
          deletion request, Etscript will delete account information, manuscripts, generated exports,
          and stored preferences — except where retention is required by law, fraud prevention
          obligations, accounting requirements, or ongoing legal proceedings.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">16. Children's Privacy</h2>
        <p className="text-muted-foreground">
          Etscript is not intended for children under the age of 18. By creating an account, users
          represent that they are at least 18 years of age or otherwise legally authorized to use
          the platform under applicable law. If we become aware that a child has provided personal
          data without appropriate authorization, we will take reasonable steps to delete such
          information.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">17. Changes to This Privacy Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. Where significant changes are made,
          users may be notified through website notices, email notifications, or in-platform alerts.
          The updated version will always be available on{" "}
          <a href="https://etscript.site" className="underline text-primary">etscript.site</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">18. Contact Us</h2>
        <p className="text-muted-foreground mb-3">
          For questions, concerns, requests, or complaints relating to privacy or data protection,
          please contact:
        </p>
        <div className="rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">Privacy Office</p>
          <p>FurstoneTech Solutions Limited</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
      </section>
    </LegalLayout>
  );
}
