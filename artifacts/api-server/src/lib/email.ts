import { ReplitConnectors } from "@replit/connectors-sdk";

const FROM_ADDRESS = "Etscript <receipts@etscript.site>";

interface SendReceiptOpts {
  to: string;
  type: "payg_export" | "premium_subscription" | "renewal";
  amountKobo: number;
  manuscriptTitle?: string | null;
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function buildReceiptHtml(opts: SendReceiptOpts): string {
  const { type, amountKobo, manuscriptTitle } = opts;
  const amount = formatNaira(amountKobo);

  const heading =
    type === "payg_export"
      ? "Clean Export Unlocked"
      : type === "premium_subscription"
        ? "Premium Plan Activated"
        : "Premium Plan Renewed";

  const detail =
    type === "payg_export"
      ? `Your payment of <strong>${amount}</strong> unlocks a clean, watermark-free PDF and DOCX for <em>${manuscriptTitle ?? "your manuscript"}</em>. You can download your files any time from the preview page.`
      : type === "premium_subscription"
        ? `Your payment of <strong>${amount}</strong> activates your Etscript Premium plan. You now have unlimited clean exports for all your manuscripts every month.`
        : `Your Premium plan has been renewed for <strong>${amount}</strong>. Unlimited clean exports continue for another month.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Etscript Receipt</title>
</head>
<body style="margin:0;padding:0;background:#f5f4ef;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ef;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">Etscript</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#1a1a2e;">${heading}</h1>
              <p style="margin:0 0 28px;font-size:13px;color:#888;">Payment receipt</p>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#333;">${detail}</p>

              <!-- Amount box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ef;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:13px;color:#888;">Amount paid</span>
                    <span style="float:right;font-size:18px;font-weight:bold;color:#1a1a2e;">${amount}</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.7;color:#555;">
                If you have any questions about this charge, reply to this email or contact us at
                <a href="mailto:support@etscript.site" style="color:#1a1a2e;">support@etscript.site</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f0ede6;text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaa;">
                &copy; ${new Date().getFullYear()} Etscript &mdash; Manuscript formatting for African authors
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReceiptSubject(type: SendReceiptOpts["type"]): string {
  switch (type) {
    case "payg_export":
      return "Your Etscript receipt — clean export unlocked";
    case "premium_subscription":
      return "Welcome to Etscript Premium — you're all set";
    case "renewal":
      return "Etscript Premium renewed — receipt enclosed";
  }
}

export async function sendReceipt(opts: SendReceiptOpts): Promise<void> {
  const connectors = new ReplitConnectors();
  const subject = buildReceiptSubject(opts.type);
  const html = buildReceiptHtml(opts);

  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [opts.to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
}
