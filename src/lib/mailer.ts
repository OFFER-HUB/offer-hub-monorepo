const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isMailerConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim(),
  );
}

export async function sendMail(message: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, ...message }),
  });

  return res.ok;
}
