import express from "express";
import morganMiddleware from "./middlewares/morgan";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.routes";
import packageRoutes from "./routes/package.routes";
import hotelRoutes from "./routes/hotel.routes";
import bookingRoutes from "./routes/booking.routes";
import enquiryRoutes from "./routes/enquiry.routes";
import callbackRoutes from "./routes/callback.routes";
import paymentRoutes from "./routes/payment.route";
import dashboardRoutes from "./routes/dashboard.routes";

import cors from "cors";
const app = express();
import dotenv from "dotenv";
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://hikesike.in"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morganMiddleware);

//route
app.use("/api/auth", authRoute);
app.use("/api/packages", packageRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/callback", callbackRoutes);
app.use("/api", paymentRoutes);
app.use("/api", dashboardRoutes);

export default app;
