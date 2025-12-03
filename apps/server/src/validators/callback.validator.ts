// src/validators/callback.validator.ts
import Joi from "joi";

export const requestCallbackSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid Indian mobile number",
    }),
  preferredTime: Joi.string().optional().allow(""),
  message: Joi.string().max(300).optional().allow(""),
  destination: Joi.string().optional().allow(""),
  source: Joi.string()
    .valid("website", "popup", "package-page", "footer")
    .default("website"),
});
