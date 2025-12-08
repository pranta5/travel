// types/booking.types.ts
export interface CategoryPrice {
  category: string;
  price: number;
}

export interface Activity {
  activityName: string;
  activityImage: string;
}

export interface Package {
  _id: string;
  title: string;
  slug: string;
  categoryAndPrice: CategoryPrice[];
  featuredImage: string;
  overview: string;
  destination: string[];
  hotel: any | null;
  activity: Activity[];
  isActive: boolean;
}

export interface Booking {
  _id: string;
  user: string;
  package: Package;
  totalTraveler: number;
  totalAmount: number;
  paidAmount: number;
  walletUsedAmount: number;
  paymentStatus: "pending" | "success" | "failed";
  bookingStatus: "pending" | "confirmed" | "cancelled";
  travelDate: string; // ISO string
  bookingDate: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface BookingApiResponse {
  success: boolean;
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
