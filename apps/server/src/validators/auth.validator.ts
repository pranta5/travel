import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message("Phone must be 10 digits")
    .required(),

  referralCode: Joi.string(),
  walletBalance: Joi.number().default(500),
  referredBy: Joi.string().optional(),

  role: Joi.string()
    .valid("user", "admin", "manager", "employee")
    .default("user"),

  isEmailVerified: Joi.boolean().default(false),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  role: Joi.string().valid("user", "admin", "manager", "employee"),
  isEmailVerified: Joi.boolean(),
});

export const resendVerifySchema = Joi.object({
  email: Joi.string().email().required(),
});
