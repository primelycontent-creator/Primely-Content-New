import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom =
  process.env.EMAIL_FROM || "Primely Content <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.warn("Email skipped: RESEND_API_KEY missing");
    return { ok: false, skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("sendEmail error:", error);
    return { ok: false, error };
  }

  return { ok: true, data };
}