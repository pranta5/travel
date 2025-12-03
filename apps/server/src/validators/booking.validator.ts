// src/validators/booking.validator.ts
import Joi from "joi";

export const createBookingSchema = Joi.object({
  package: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid package ID",
      "any.required": "Package is required",
    }),

  totalTraveler: Joi.number().min(1).max(20).required().messages({
    "number.min": "At least 1 traveler required",
    "number.max": "Maximum 20 travelers allowed",
    "any.required": "Number of travelers is required",
  }),

  travelDate: Joi.date().min("now").required().messages({
    "date.min": "Travel date cannot be in the past",
    "any.required": "Travel date is required",
  }),
  category: Joi.string()
    .valid("standard", "deluxe", "super deluxe")
    .required()
    .messages({
      "any.required": "Please select a category (standard, deluxe, etc.)",
      "any.only": "Invalid category selected",
    }),
});

export const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .required(),
  paidAmount: Joi.when("paymentStatus", {
    is: "paid",
    then: Joi.number().positive().required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateBookingStatusSchema = Joi.object({
  bookingStatus: Joi.string()
    .valid("pending", "confirmed", "reschedule", "cancelled", "complete")
    .required(),
});
