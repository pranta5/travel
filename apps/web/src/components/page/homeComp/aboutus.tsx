import React from "react";
import InfoCard from "@/components/ui/InfoCard";

const AboutUs = () => {
  return (
    <section className="relative bg-gradient-to-r from-cyan-100 to-blue-50 py-12 px-4 sm:px-6 md:px-10 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: Images */}
        <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start gap-4">
          <div>
            <img
              src="/img/about-1.jpg"
              alt="Hiking"
              className="w-32 h-64 sm:w-40 sm:h-80 object-cover border rounded-t-full rounded-bl-full shadow-lg"
            />
          </div>
          <div className="flex flex-col gap-4">
            <img
              src="/img/about-2.png"
              alt="Lake view"
              className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-r-full rounded-tl-full shadow-lg"
            />
            <img
              src="/img/about-3.png"
              alt="Kayaking"
              className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-b-full rounded-tl-full shadow-lg"
            />
          </div>
        </div>

        {/* Right: Text */}
        <div className="text-center lg:text-left lg:pr-12">
          <h3 className="text-lg sm:text-xl text-gray-700 italic mb-2">
            Who We Are
          </h3>
          <h2 className="text-2xl font-bold leading-snug mb-4 text-black">
            Crafting Memorable Travel Experiences{" "}
            <span className="text-cyan-600">Since 2022</span>
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
            eiusmod tempor incididunt ut labore dolore magna aliqua. Quis ipsum
            suspendisse ultrices gravida risus commodo viverra maecenas accumsan
            lacus vel facilisis.
          </p>

          {/* Cards */}
          <div className="flex justify-center lg:justify-start gap-4 mb-6 text-sm">
            <InfoCard icon="⭐" title="Expertise And Experience" />
            <InfoCard icon="📅" title="Time and Stress Savings" />
          </div>

          {/* Button */}
          <button className=" px-8 py-2 bg-cyan-500 text-white rounded-lg shadow-md hover:bg-cyan-600 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
