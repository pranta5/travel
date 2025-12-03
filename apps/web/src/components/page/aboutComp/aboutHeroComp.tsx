import React from "react";

type AboutHeroProps = {
  image: string;
  title: string;
  subtitle?: string;
};

const AboutHero: React.FC<AboutHeroProps> = ({ image, title, subtitle }) => {
  const [first, ...rest] = title.split(" ");
  return (
    <div className="w-full h-64 md:h-96 relative bg-gray-800">
      <img
        src={image}
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold">
            <span className="mr-2">{first}</span>
            <span className="text-teal-300">{rest.join(" ")}</span>
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm md:text-lg text-white/90">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
