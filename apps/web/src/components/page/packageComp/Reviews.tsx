"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Reviews.module.css";
import TestimonialCard from "@/components/ui/TestimonialCard";

type Review = {
  title: string;
  text: string;
  name: string;
  location: string;
};

const reviews: Review[] = [
  {
    title: "Best Price Assured",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
  {
    title: "Smooth Servicers",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
  {
    title: "Clean and Comfortable",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
];

export default function Reviews() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl text-gray-600 md:text-3xl font-bold text-center mb-10">
        What Our Customers Say
      </h2>

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3 px-4">
        {reviews.map((item, index) => (
          <TestimonialCard
            key={index}
            title={item.title}
            text={item.text}
            name={item.name}
            location={item.location}
          />
        ))}
      </div>
    </section>
  );
}
