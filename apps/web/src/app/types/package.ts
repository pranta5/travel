// src/types/package.ts
export type CategoryName = "standard" | "deluxe" | "superdeluxe";

export interface ICategoryAndPrice {
  category: CategoryName;
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

export interface IPackage {
  _id: string;
  title: string;
  slug: string;
  categoryAndPrice: ICategoryAndPrice[];
  featuredImage: string;
  overview: string;
  destination: string[];
  hotel?: string | null;
  itinerary: IItinerary[];
  activity: IActivity[];
  availableDates: string[];
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** API wrapper shape */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}
