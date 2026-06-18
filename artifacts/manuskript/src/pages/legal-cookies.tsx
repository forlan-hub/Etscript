import { LegalLayout } from "@/components/layout/legal-layout";

export default function CookieNoticePage() {
  return (
    <LegalLayout title="Cookie Notice" effectiveDate="18 June 2026 · Last Updated: 18 June 2026" draft={false}>
      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">
          This Cookie Notice explains how Etscript, a service operated by{" "}
          <strong>FurstoneTech Solutions Limited</strong>, uses cookies and similar technologies
          when you visit or use etscript.site.
        </p>
        <p className="text-muted-foreground mt-3">
          Cookies help us provide a secure, reliable, and user-friendly experience. This notice
          explains what cookies are, how we use them, and the choices available to you.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">2. What Are Cookies?</h2>
        <p className="text-muted-foreground mb-3">
          Cookies are small text files stored on your device when you visit a website. Cookies
          allow websites to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Remember user preferences</li>
          <li>Maintain secure login sessions</li>
          <li>Improve website functionality</li>
          <li>Enhance user experience</li>
        </ul>
        <p className="text-muted-foreground">
          Cookies do not typically contain information that directly identifies you, although they
          may be linked to information associated with your account.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">3. How Etscript Uses Cookies</h2>
        <p className="text-muted-foreground">
          Etscript uses cookies primarily to support platform functionality, security, and user
          authentication.
        </p>
        <p className="text-muted-foreground mt-3 font-medium">
          We do not use cookies for advertising or cross-site behavioral tracking.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-3">4. Types of Cookies We Use</h2>

        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-2">A. Essential Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies are necessary for Etscript to function properly. They help us:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
              <li>Authenticate users</li>
              <li>Maintain login sessions</li>
              <li>Protect user accounts</li>
              <li>Enable secure navigation</li>
              <li>Process requests securely</li>
            </ul>
            <p className="text-muted-foreground mb-2">
              Without these cookies, some parts of Etscript may not function correctly. Examples
              include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Authentication tokens</li>
              <li>Session identifiers</li>
              <li>Security verification cookies</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-2">B. Preference Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies remember user preferences and settings. Examples may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Selected document templates</li>
              <li>Interface preferences</li>
              <li>Language preferences (if implemented)</li>
              <li>User dashboard settings</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              These cookies improve convenience and user experience.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-2">C. Security Cookies</h3>
            <p className="text-muted-foreground mb-2">
              Security cookies help protect users and the platform from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Unauthorized access</li>
              <li>Fraudulent activity</li>
              <li>Session hijacking</li>
              <li>Security threats</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              These cookies support account security and platform integrity.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">5. Cookies We Do Not Use</h2>
        <p className="text-muted-foreground mb-3">
          As part of our privacy-by-design approach, Etscript does not currently use:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li>Advertising cookies</li>
          <li>Behavioral tracking cookies</li>
          <li>Third-party marketing cookies</li>
          <li>Cross-site tracking technologies</li>
          <li>Social media advertising trackers</li>
          <li>Meta Pixel</li>
          <li>Session replay tools</li>
          <li>Heatmap tracking tools</li>
        </ul>
        <p className="text-muted-foreground">
          We do not use cookies to monitor your browsing activities on other websites.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">6. Third-Party Services</h2>
        <p className="text-muted-foreground mb-4">
          Some trusted service providers used by Etscript may place cookies or similar technologies
          necessary for their services to function:
        </p>
        <div className="space-y-3">
          {[
            { name: "Google OAuth", role: "Authentication Provider", desc: "When users choose Google Sign-In." },
            { name: "Paystack", role: "Payment Provider", desc: "For payment processing and subscription management." },
            { name: "Supabase", role: "Infrastructure and Security Provider", desc: "For secure data storage and authentication services." },
          ].map((p) => (
            <div key={p.name} className="rounded-md border border-border px-4 py-3">
              <p className="font-semibold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3">
          Such providers may use their own cookies in accordance with their respective privacy and
          cookie policies. Etscript does not control third-party cookies placed by external service
          providers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">7. Managing Cookies</h2>
        <p className="text-muted-foreground mb-3">
          Most web browsers allow users to view, delete, block, and configure cookie preferences.
          You may manage cookies through your browser settings.
        </p>
        <p className="text-muted-foreground">
          Please note that disabling essential cookies may affect the functionality of Etscript and
          prevent certain features from operating correctly.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">8. Consent</h2>
        <p className="text-muted-foreground">
          By continuing to use Etscript, you consent to the use of essential cookies necessary for
          the operation, security, and delivery of our services.
        </p>
        <p className="text-muted-foreground mt-3">
          Where additional categories of cookies are introduced in the future, Etscript will provide
          appropriate notice and, where required by applicable law, obtain user consent before
          deploying such cookies.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">9. Changes to This Cookie Notice</h2>
        <p className="text-muted-foreground">
          We may update this Cookie Notice from time to time to reflect changes in technology,
          services, legal or regulatory requirements, or new platform features. The updated version
          will always be available on{" "}
          <a href="https://etscript.site" className="underline text-primary">etscript.site</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2">10. Contact Us</h2>
        <p className="text-muted-foreground mb-3">
          If you have any questions regarding this Cookie Notice or how Etscript uses cookies,
          please contact:
        </p>
        <div className="rounded-md border border-border px-4 py-3 text-muted-foreground text-sm space-y-1">
          <p className="font-medium text-foreground">Privacy Office — FurstoneTech Solutions Limited</p>
          <p>Website: <a href="https://etscript.site" className="underline text-primary">etscript.site</a></p>
          <p>Email: <a href="mailto:privacy@etscript.site" className="underline text-primary">privacy@etscript.site</a></p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 mt-4">
        <p className="text-sm font-semibold text-foreground mb-1">Privacy Commitment</p>
        <p className="text-sm text-muted-foreground">
          Etscript uses cookies to support platform functionality, security, and user experience.
          We do not use cookies to build advertising profiles, sell user data, or track users across
          the internet. Our approach is guided by privacy-by-design principles and a commitment to
          protecting user trust.
        </p>
      </div>
    </LegalLayout>
  );
}
