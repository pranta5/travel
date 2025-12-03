import { Document, Types } from "mongoose";

export interface ICategoryAndPrice {
  category: "standard" | "deluxe" | "super deluxe";
  price: number;
}

export interface IItinerary {
  day: string;
  description: string;
}

export interface IActivity {
  activityName: string;
  activityImage: string; // Cloudinary URL
}

export interface IPackage extends Document {
  title: string;
  slug: string;
  categoryAndPrice: ICategoryAndPrice[];
  featuredImage: string; // Cloudinary URL
  overview: string;
  destination: string[];
  hotel?: Types.ObjectId | null;
  itinerary: IItinerary[];
  activity: IActivity[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
