// src/utils/emailTemplates.ts
export const compileVerifyTemplate = (opts: {
  name: string;
  verifyUrl: string;
  appName: string;
  expiry: string;
}) => {
  const { name, verifyUrl, appName, expiry } = opts;

  const text = `Hi ${name},

Please verify your email for ${appName} by clicking the link below:

${verifyUrl}

This link expires in ${expiry}.

If you did not create an account, ignore this message.

Thanks,
${appName} team
`;

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.4; color:#222;">
    <h2>Hi ${name},</h2>
    <p>Thanks for signing up for <strong>${appName}</strong>.</p>
    <p>Please verify your email address by clicking the button below:</p>
    <p style="text-align:center;">
      <a href="${verifyUrl}" style="display:inline-block; padding:12px 20px; background:#2f80ed; color:white; text-decoration:none; border-radius:6px;">
        Verify email
      </a>
    </p>
    <p>If the button doesn't work, copy and paste the following link into your browser:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p style="font-size:12px; color:#666">This link expires in ${expiry}.</p>
    <hr />
    <p style="font-size:12px; color:#999">If you did not create an account, ignore this email.</p>
  </div>
  `;

  return { html, text };
};
