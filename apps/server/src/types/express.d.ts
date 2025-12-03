// src/types/express.d.ts
import { JwtUserPayload } from "./auth.types";
import "cookie-parser";
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
