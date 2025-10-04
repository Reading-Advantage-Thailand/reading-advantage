import { Resend } from 'resend';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log("Preparing to send reset email to:", email, "with token:", token);
  console.log("RESEND_API_KEY", process.env.RESEND_API_KEY);
  console.log("RESEND_FROM", process.env.RESEND_FROM);
  try {
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'no-reply@reading-advantage.com',
      to: email,
      subject: "Reset your password",
      html: `...`,
    });
    console.log("Resend result:", result);
  } catch (err) {
    console.error("Resend error:", err);
    throw err;
  }
}