"use client";

import { CheckCircle, DollarSign, CalendarCheck } from "lucide-react";

const features = [
  {
    icon: <CheckCircle className="w-8 h-8 text-cyan-600" />,
    title: "100% Satisfaction",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore.",
  },
  {
    icon: <DollarSign className="w-8 h-8 text-cyan-600" />,
    title: "Competitive Pricing",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore.",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-cyan-600" />,
    title: "Fast Booking",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Images */}
        <div className="grid grid-cols-2 gap-2">
          <img
            src="/img/about-1.jpg"
            alt="Travel 1"
            className="rounded-2xl object-cover h-36 w-full shadow-md mt-4"
          />
          <img
            src="/img/about-1.jpg"
            alt="Travel 2"
            className="rounded-2xl object-cover h-40 w-full shadow-md"
          />
          <img
            src="/img/about-1.jpg"
            alt="Travel 3"
            className="rounded-2xl object-cover h-40 w-full shadow-md"
          />
          <img
            src="/img/about-1.jpg"
            alt="Travel 3"
            className="rounded-2xl object-cover h-36 w-full shadow-md mb-4"
          />
        </div>

        {/* Right Content */}
        <div>
          <h4 className="text-lg font-semibold text-gray-600">Why Choose Us</h4>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Why <span className="text-cyan-600">HikeSike</span> Is The Best
          </h2>

          <div className="mt-8 space-y-6">
            {features.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div>{item.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
