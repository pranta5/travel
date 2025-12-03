// src/config/cookies.ts

export const cookieOptions = {
  httpOnly: true, // JS cannot access cookie → prevents XSS token theft
  secure: false, // ❗ DEV = false, PROD = true
  sameSite: "lax" as const, // protects against CSRF in most cases prod = "none",
  // domain: undefined, // set this in production if using custom domain
};
