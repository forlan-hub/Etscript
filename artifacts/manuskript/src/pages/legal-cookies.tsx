import { LegalLayout } from "@/components/layout/legal-layout";

export default function CookieNoticePage() {
  return (
    <LegalLayout title="Cookie Notice" effectiveDate="To be confirmed">
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. What Are Cookies?</h2>
        <p className="text-muted-foreground">
          Cookies are small text files placed on your device when you visit a website. They help
          the site remember your preferences and improve your experience.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. Cookies We Use</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                <th className="text-left py-2 pr-4 font-medium">Purpose</th>
                <th className="text-left py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">sb-auth-token</td>
                <td className="py-2 pr-4">Authentication session (Supabase)</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">sidebar_state</td>
                <td className="py-2 pr-4">Remember sidebar open/closed preference</td>
                <td className="py-2">7 days</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">[additional cookies]</td>
                <td className="py-2 pr-4">[Placeholder — full list coming soon.]</td>
                <td className="py-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. Third-Party Cookies</h2>
        <p className="text-muted-foreground">[Placeholder — full text coming soon.]</p>
        <p className="text-muted-foreground mt-2">
          Etscript uses Supabase for authentication and Paystack for payment processing. These
          services may set their own cookies subject to their respective privacy policies.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">4. Managing Cookies</h2>
        <p className="text-muted-foreground">
          You can control and delete cookies through your browser settings. Please note that
          disabling essential cookies (such as authentication cookies) will prevent you from
          logging into Etscript.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Contact</h2>
        <p className="text-muted-foreground">
          Questions about our cookie use?{" "}
          <a href="mailto:privacy@etscript.com" className="underline text-primary">privacy@etscript.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
