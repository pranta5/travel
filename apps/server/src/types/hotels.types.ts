import { Document } from "mongoose";

export interface IHotels extends Document {
  hotelName: string;
  hotelImage: string[];
}
