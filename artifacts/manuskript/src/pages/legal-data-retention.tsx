import { LegalLayout } from "@/components/layout/legal-layout";

export default function DataRetentionPage() {
  return (
    <LegalLayout title="Data Retention & Deletion Policy" effectiveDate="18 June 2026 · Last Updated: 18 June 2026" draft={false}>
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">
          This Data Retention and Deletion Policy explains how Etscript, a service operated by{" "}
          <strong>FurstoneTech Solutions Limited</strong>, retains, manages, archives, and deletes
          personal data and user content.
        </p>
        <p className="text-muted-foreground mt-3">
          This Policy complements the{" "}
          <a href="/legal/privacy" className="underline text-primary">Etscript Privacy Policy</a>{" "}
          and forms part of our commitment to privacy, transparency, accountability, and responsible
          data management. The purpose of this Policy is to ensure that personal data and user
          content are retained only for as long as necessary to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
          <li>Provide Etscript services</li>
          <li>Maintain platform security</li>
          <li>Fulfil contractual obligations</li>
          <li>Comply with legal, regulatory, accounting, and audit requirements</li>
          <li>Protect the rights of users and FurstoneTech Solutions Limited</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">2. Guiding Principles</h2>
        <div className="space-y-3">
          {[
            { title: "Data Minimization", desc: "We retain only the information necessary to operate the platform and fulfil legitimate business purposes." },
            { title: "Storage Limitation", desc: "Information shall not be retained indefinitely unless required by law or specifically requested by the user." },
            { title: "User Control", desc: "Users retain control over their manuscripts and may request deletion of their content and account data in accordance with this Policy." },
            { title: "Privacy by Design", desc: "Retention periods are designed to balance user convenience, platform functionality, security, and legal compliance." },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-md border border-border px-4 py-3">
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">3. Categories of Data Retained</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Account Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Name and email address</li>
              <li>Authentication credentials</li>
              <li>Account preferences</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1">User Content</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Manuscripts, books, research papers</li>
              <li>Academic projects and business documents</li>
              <li>Professional letters</li>
              <li>Custom templates created by users</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Generated Outputs</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Exported PDF and DOCX files</li>
              <li>Other generated document outputs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Transaction Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Subscription records and payment confirmations</li>
              <li>Billing history and invoice records</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Technical Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Login history and security logs</li>
              <li>Audit logs and authentication events</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-4">4. Retention Schedule</h2>
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
                ["Inactive Accounts", "Reviewed after extended inactivity — notice given before any action"],
                ["User Manuscripts", "Until deleted by user or via account deletion"],
                ["Generated Exports", "Up to 90 days, then automatically deleted"],
                ["Deleted Content", "Permanently removed within 30 days of deletion"],
                ["Audit & Security Logs", "Up to 12 months"],
                ["Payment & Financial Records", "As required by applicable tax, accounting, audit, and legal obligations"],
              ].map(([cat, period], i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium text-foreground/80">{cat}</td>
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
        <h2 className="text-lg font-serif font-semibold mb-2">5. Subscription Expiry and Content Retention</h2>
        <p className="text-muted-foreground mb-2">
          Expiration of a subscription does <strong>not</strong> result in account deletion,
          manuscript deletion, template deletion, or user profile deletion.
        </p>
        <p className="text-muted-foreground mb-2">After subscription expiry, users may continue to:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Access their accounts</li>
          <li>View manuscripts</li>
          <li>Renew subscriptions</li>
          <li>Purchase one-time export services</li>
        </ul>
        <p className="text-muted-foreground">
          Users may not use premium formatting or export features until payment requirements are
          satisfied.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Account Deletion Requests</h2>
        <p className="text-muted-foreground mb-3">
          Users may request deletion of their account through:
        </p>
        <div className="space-y-3">
          <div className="rounded-md border border-border px-4 py-3">
            <p className="font-semibold text-sm text-foreground">Settings Menu</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Navigate to <strong>Settings → Danger Zone</strong> and select "Delete My Account"
              or "Delete My Data".
            </p>
          </div>
          <div className="rounded-md border border-border px-4 py-3">
            <p className="font-semibold text-sm text-foreground">Contact Request</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Email:{" "}
              <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. What Happens When an Account Is Deleted</h2>
        <p className="text-muted-foreground mb-3">
          Upon a valid deletion request, Etscript shall take reasonable steps to remove:
        </p>
        <div className="space-y-3">
          {[
            { label: "Personal Information", items: ["Name, email address, profile settings", "Authentication data"] },
            { label: "User Content", items: ["Manuscripts, projects, research papers", "Business documents and saved drafts"] },
            { label: "Generated Outputs", items: ["Export files and generated document packages"] },
            { label: "Custom Templates", items: ["User-created formatting templates"] },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                {items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3">
          Deletion shall normally be completed within the timelines specified in this Policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Information That May Be Retained After Deletion</h2>
        <p className="text-muted-foreground mb-3">
          Certain information may be retained where necessary for:
        </p>
        <div className="space-y-2">
          {[
            { label: "Legal Compliance", desc: "Tax, accounting, and regulatory obligations." },
            { label: "Security", desc: "Fraud investigations and security incident investigations." },
            { label: "Dispute Resolution", desc: "Enforcement of legal rights, contractual claims, and litigation support." },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-3">
              <p className="font-semibold text-sm text-foreground w-40 shrink-0">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3">
          Where possible, retained information shall be limited to the minimum necessary.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">9. Backups and Recovery Systems</h2>
        <p className="text-muted-foreground">
          To ensure service reliability and business continuity, Etscript may maintain secure backup
          copies of certain information. Backup data is protected by appropriate security controls,
          is not routinely accessible to users, and is retained only for disaster recovery and
          operational continuity purposes. Where deleted information exists within backup systems,
          it shall be removed in accordance with backup rotation schedules and operational
          requirements.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">10. User Responsibility</h2>
        <p className="text-muted-foreground mb-2">
          Users are encouraged to maintain their own copies of:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Manuscripts, research projects, and books</li>
          <li>Business documents and generated exports</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          While Etscript strives to maintain reliable systems, users remain responsible for
          preserving copies of important content.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">11. International Data Storage</h2>
        <p className="text-muted-foreground">
          Certain service providers used by Etscript may store or process information outside
          Nigeria. Where international processing occurs, Etscript relies on service providers that
          implement technical, contractual, and organizational safeguards designed to protect
          personal data.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">12. Policy Enforcement</h2>
        <p className="text-muted-foreground">
          FurstoneTech Solutions Limited shall periodically review retention practices to ensure
          compliance with applicable data protection laws, security requirements, business needs,
          and platform operations. Retention periods may be updated where necessary to reflect
          legal or operational changes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">13. Changes to This Policy</h2>
        <p className="text-muted-foreground">
          We may update this Data Retention and Deletion Policy from time to time. Material changes
          may be communicated through website notices, email notifications, or in-platform alerts.
          The most current version shall always be available at{" "}
          <a href="https://etscript.site" className="underline text-primary">etscript.site</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">14. Contact Information</h2>
        <div className="rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">Privacy Office — FurstoneTech Solutions Limited</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 mt-4">
        <p className="text-sm font-semibold text-foreground mb-1">Etscript Retention Commitment</p>
        <p className="text-sm text-muted-foreground">
          Etscript is designed around the principle that users own their content. We retain
          information only for as long as necessary to provide our services, comply with legal
          obligations, maintain security, and support user access to their manuscripts. We do not
          retain content indefinitely without purpose, nor do we delete user manuscripts solely
          because a subscription has expired.
        </p>
      </div>
    </LegalLayout>
  );
}
