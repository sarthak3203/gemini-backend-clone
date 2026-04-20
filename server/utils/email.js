const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>";

function getResendClient() {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is missing in server/.env");
  }

  return new Resend(resendApiKey);
}

async function sendOtpEmail(email, otpCode, purpose = "LOGIN") {
  const resend = getResendClient();
  const subjectMap = {
    SIGNUP: "Complete your signup",
    LOGIN: "Your login code",
    PASSWORD_RESET: "Your password reset code",
  };
  const subject = subjectMap[purpose] || "Your verification code";
  const text = `Your OTP is ${otpCode}. It will expire in 3 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111">
      <h2 style="margin-bottom:8px;">Verification code</h2>
      <p>Your one-time code is:</p>
      <p style="font-size:24px; font-weight:700; letter-spacing:2px;">${otpCode}</p>
      <p>This code expires in 3 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email with Resend");
  }
}

module.exports = {
  sendOtpEmail,
};
