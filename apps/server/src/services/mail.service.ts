// src/services/mail.service.ts
import transporter from "../config/emailConfig"; // your provided transporter file
import logger from "../logger";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { compileVerifyTemplate } from "../utils/emailTemplates";
import env from "../config/env";

const EMAIL_TOKEN_SECRET = env.EMAIL_TOKEN_SECRET as string;
const EMAIL_TOKEN_EXPIRES: SignOptions["expiresIn"] =
  (env.EMAIL_TOKEN_EXPIRES ?? "1d") as unknown as SignOptions["expiresIn"];
const APP_BASE_URL = env.APP_BASE_URL || "http://localhost:3000";

if (!EMAIL_TOKEN_SECRET) {
  logger.warn(
    "[MailService] EMAIL_TOKEN_SECRET not set — email tokens will fail"
  );
}

export const generateEmailToken = (payload: {
  userId: string;
  email?: string;
}): string => {
  // ensure payload is treated as a valid JwtPayload/object
  const jwtPayload = payload as JwtPayload;

  const options: SignOptions = {
    expiresIn: EMAIL_TOKEN_EXPIRES,
  };

  // call the overload that returns a string
  return jwt.sign(jwtPayload, EMAIL_TOKEN_SECRET, options);
};
export const verifyEmailToken = (token: string) => {
  return jwt.verify(token, EMAIL_TOKEN_SECRET) as {
    userId: string;
    email?: string;
    iat?: number;
    exp?: number;
  };
};

export default class MailService {
  static async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ) {
    try {
      const info = await transporter.sendMail({
        from: `"${env.FROM_NAME || "hikesike"}" <${env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      });
      logger.debug("[MailService] Email sent: %o", {
        to,
        subject,
        messageId: info.messageId,
      });
      return info;
    } catch (err: any) {
      logger.error("[MailService] sendMail error: %o", err);
      throw err;
    }
  }

  /**
   * Send verification email to a new user.
   */
  static async sendVerificationEmail(user: {
    _id: string;
    email: string;
    name?: string;
  }) {
    const token = generateEmailToken({ userId: user._id, email: user.email });
    const verifyUrl = `${APP_BASE_URL}/verify-email?token=${encodeURIComponent(
      token
    )}`;

    const { html, text } = compileVerifyTemplate({
      name: user.name || "User",
      verifyUrl,
      appName: process.env.APP_NAME || "hikesike",
      expiry: String(EMAIL_TOKEN_EXPIRES),
    });

    const subject = `${process.env.APP_NAME || "hikesike"} — Verify your email`;

    return this.sendMail(user.email, subject, html, text);
  }
}
