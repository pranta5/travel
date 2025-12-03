// src/types/auth.types.ts

export interface JwtUserPayload {
  userId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}
