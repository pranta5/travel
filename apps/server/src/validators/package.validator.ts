import Joi from "joi";
import mongoose from "mongoose";

const categoryItem = Joi.object({
  category: Joi.string().valid("standard", "deluxe", "superdeluxe").required(),
  price: Joi.number().min(0).required(),
});

const itineraryItem = Joi.object({
  day: Joi.string().required(),
  description: Joi.string().min(10).required(),
});

const activityItem = Joi.object({
  activityName: Joi.string().min(3).required(),
  activityImage: Joi.string().uri(),
});

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "Valid ObjectId");

export const createPackageSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),

  categoryAndPrice: Joi.array().items(categoryItem).min(1).required(),
  featuredImage: Joi.string().uri(),
  overview: Joi.string().min(5).max(2000).required(),
  destination: Joi.array().items(Joi.string().min(1)).min(1).required(),
  hotel: objectId.allow(null).optional(),
  itinerary: Joi.array().items(itineraryItem).min(1).required(),
  availableDates: Joi.array()
    .items(Joi.date().iso().greater("now").required())
    .min(1)
    .required(),
  activity: Joi.array().items(activityItem).min(0).optional(),
  isActive: Joi.boolean().default(true),
});

export const updatePackageSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  categoryAndPrice: Joi.array().items(categoryItem),
  featuredImage: Joi.string().uri(),
  overview: Joi.string().min(5).max(2000),
  destination: Joi.array().items(Joi.string().min(1)),
  hotel: objectId.allow(null),
  itinerary: Joi.array().items(itineraryItem),
  activity: Joi.array().items(activityItem),
  availableDates: Joi.array().items(Joi.date().iso().greater("now")).min(1),
  isActive: Joi.boolean(),
}).min(1); // at least one field to update
