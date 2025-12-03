// src/validators/hotel.validator.ts
import Joi from "joi";

export const createHotelSchema = Joi.object({
  hotelName: Joi.string().trim().min(2).max(100).required(),
  hotelImage: Joi.array().items(Joi.string().uri()).min(1),
});

export const updateHotelSchema = Joi.object({
  hotelName: Joi.string().trim().min(2).max(100),
  hotelImage: Joi.array().items(Joi.string().uri()).min(1),
}).min(1);
