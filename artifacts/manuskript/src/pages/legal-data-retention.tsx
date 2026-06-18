import { LegalLayout } from "@/components/layout/legal-layout";

export default function DataRetentionPage() {
  return (
    <LegalLayout title="Data Retention & Deletion Policy" effectiveDate="To be confirmed">
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Overview</h2>
        <p className="text-muted-foreground">
          Etscript retains your personal data only for as long as necessary to provide the service
          and comply with our legal obligations under the Nigeria Data Protection Act (NDPA) and
          applicable regulations.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Retention Periods</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Data Type</th>
                <th className="text-left py-2 pr-4 font-medium">Retention Period</th>
                <th className="text-left py-2 font-medium">Basis</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Account data (name, email)</td>
                <td className="py-2 pr-4">Duration of account + 30 days after deletion</td>
                <td className="py-2">Contractual necessity</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Uploaded manuscripts</td>
                <td className="py-2 pr-4">Deleted on account deletion or manual removal</td>
                <td className="py-2">User ownership</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Formatted output files</td>
                <td className="py-2 pr-4">[Placeholder — period to be confirmed]</td>
                <td className="py-2">Service delivery</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Billing/transaction records</td>
                <td className="py-2 pr-4">7 years</td>
                <td className="py-2">Legal / tax obligation</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Activity logs</td>
                <td className="py-2 pr-4">[Placeholder — period to be confirmed]</td>
                <td className="py-2">Security & fraud prevention</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. Requesting Deletion</h2>
        <p className="text-muted-foreground">
          You may delete your account and all associated data at any time from your{" "}
          <strong>Settings → Danger Zone</strong> page. Account deletion removes your manuscripts,
          formatting jobs, and personal data, subject to the retention periods above for billing
          records.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Automated Deletion</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Contact</h2>
        <p className="text-muted-foreground">
          To submit a data deletion request:{" "}
          <a href="mailto:privacy@etscript.com" className="underline text-primary">privacy@etscript.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
