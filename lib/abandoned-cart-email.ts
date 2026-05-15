// Shared abandoned-cart recovery email helper for GrantCrafter.
// Used by checkout-embedded route (to schedule via Resend scheduledAt at order creation).

export function getRecoveryEmailSubject(businessName: string): string {
  return `Your grant report for ${businessName} is one step away`;
}

export function buildRecoveryEmail(businessName: string, appUrl: string = "https://www.grantcrafter.com"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your grant report is one step away — GrantCrafter</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111827;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:24px 16px;">
<table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">

  <!-- Header -->
  <tr><td style="background:#15803d;border-radius:10px 10px 0 0;padding:28px 32px 24px;">
    <div style="font-size:11px;font-weight:700;color:#86efac;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">GrantCrafter</div>
    <div style="font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">Your grant report is one step away</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 10px;">Hey ${businessName},</p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
      You started a grant research report for <strong>${businessName}</strong> but didn't complete your order. GrantCrafter scans federal, state, local, and private grant programs to find real funding matches for your business — including deadlines, award amounts, and application tips.
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
      Your personalized $19.99 report is ready to generate. Come back and complete your order — it only takes a minute.
    </p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${appUrl}/get-report" style="display:inline-block;background:#15803d;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Get My Grant Report →</a>
    </div>
    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
      Questions? Reply to this email or reach us at <a href="mailto:support@grantcrafter.com" style="color:#15803d;text-decoration:none;">support@grantcrafter.com</a>.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8f9fa;border-radius:0 0 10px 10px;border-top:1px solid #e5e7eb;padding:18px 32px;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      GrantCrafter &middot; <a href="${appUrl}" style="color:#15803d;text-decoration:none;">grantcrafter.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}
