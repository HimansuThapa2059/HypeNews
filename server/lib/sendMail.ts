import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"]!);

interface sendMailProps {
  to: string;
  subject: string;
  text: string;
}

export async function sendMail({ to, subject, text }: sendMailProps) {
  const { data, error } = await resend.emails.send({
    from: process.env["RESEND_EMAIL"]!,
    to,
    subject,
    text,
  });

  if (error) {
    return { success: false, err: error };
  }

  return { success: true, data };
}
