import FeatureCard from "./FeatureCard";

export type Feature = {
  icon: React.ReactNode | string;
  title: string;
  desc?: string;
};
export type AboutFeaturesProps = {
  sideImage?: string;
  whoTitle?: string;
  whoText?: string;
  missionTitle?: string;
  missionText?: string;
  features?: Feature[];
};
export const AboutFeaturesComp: React.FC<AboutFeaturesProps> = ({
  sideImage = "/img/about-side.png",
  whoTitle = "Who We Are?",
  whoText = "We’re all about creating unforgettable experiences for our guests. Our journey began with a simple passion for exploring the beauty of the World.",
  missionTitle = "Our Mission",
  missionText = "We believe that travel is not just about visiting new places, but about immersing yourself in new cultures, connecting with nature, and making memories that last a lifetime.",
  features = [
    {
      icon: "⭐",
      title: "Expertise And Experience",
      desc: "Years of curated travel expertise.",
    },
    {
      icon: "⏱️",
      title: "Time and Stress Savings",
      desc: "We handle the logistics so you don't have to.",
    },
  ],
}) => {
  return (
    <div className="w-full mx-auto">
      <div className="bg-white shadow-lg md:py-22 md:px-40 grid grid-cols-1 md:grid-cols-12 items-center">
        <div className="md:col-span-6 pr-12">
          <h3 className="text-2xl md:text-4xl font-semibold text-gray-800">
            <span className="text-gray-900">{whoTitle.split(" ")[0]} </span>
            <span className="text-teal-400">
              {whoTitle.split(" ").slice(1).join(" ")}
            </span>
          </h3>

          <p className="mt-4 text-base tracking-wide text-gray-900">
            {whoText}
          </p>

          <h4 className="mt-8 text-xl md:text-4xl font-semibold text-gray-800">
            <span className="text-gray-900">{missionTitle.split(" ")[0]} </span>
            <span className="text-teal-400">
              {missionTitle.split(" ").slice(1).join(" ")}
            </span>
          </h4>

          <p className="mt-4 text-base tracking-wide text-gray-900">
            {missionText}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>

        <div className="md:col-span-6">
          <div className=" md:col-span-5 w-full rounded-xl overflow-hidden shadow-md">
            <img
              src={sideImage}
              alt="about side"
              className="w-full h-84 md:h-120 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
