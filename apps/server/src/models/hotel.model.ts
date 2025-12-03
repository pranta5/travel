import { IHotels } from "@/types/hotels.types";
import { model, Schema } from "mongoose";

const hotelSchema = new Schema<IHotels>({
  hotelName: {
    type: String,
    required: true,
  },
  hotelImage: [
    {
      type: String,
      required: true,
    },
  ],
});
export default model<IHotels>("Hotel", hotelSchema);
