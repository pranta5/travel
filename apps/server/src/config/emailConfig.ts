import nodemailer from "nodemailer";
import  env  from "./env";
let transporter = nodemailer.createTransport({
  service: "smtp",
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER, // Admin Gmail ID
    pass: env.EMAIL_PASS, // Admin Gmail Password
  },
} as nodemailer.TransportOptions);

export default transporter;
