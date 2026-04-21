const { Resend } = require("resend");

function createEmailDeliveryError(message, status = 503, extra = {}) {
  const error = new Error(message);
  error.name = "EmailDeliveryError";
  error.status = status;
  Object.assign(error, extra);
  return error;
}

function getResendClient() {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw createEmailDeliveryError("RESEND_API_KEY is missing in server/.env", 500, {
      provider: "resend",
      providerCode: "missing_api_key",
    });
  }

  return new Resend(resendApiKey);
}

async function sendOtpEmail(email, otpCode, purpose = "LOGIN") {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>";
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

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject,
    text,
    html,
  });

  if (error) {
    throw createEmailDeliveryError(error.message || "Failed to send email with Resend", error.statusCode || 503, {
      provider: "resend",
      providerCode: error.name || "resend_error",
      providerMessage: error.message || "Failed to send email with Resend",
      fromEmail,
      recipient: email,
    });
  }

  return data;
}

module.exports = {
  sendOtpEmail,
};
