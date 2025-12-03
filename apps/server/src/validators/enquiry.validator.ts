// src/validators/enquiry.validator.ts
import Joi from "joi";

export const createEnquirySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Indian mobile number",
    }),
  noOfGuests: Joi.number().min(1).required().messages({
    "number.min": "At least 1 guest required",
  }),

  checkInDate: Joi.date().iso().min("now").required(),
  checkOutDate: Joi.date().greater(Joi.ref("checkInDate")).required(),

  package: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(""),
  destination: Joi.string().optional().allow(""),

  message: Joi.string().allow("", null).max(2000).trim().default(""),
  source: Joi.string()
    .valid("website", "whatsapp", "call", "instagram", "facebook")
    .default("website"),
});
