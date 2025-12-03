import React from "react";
type Feature = {
  icon: React.ReactNode | string;
  title: string;
  desc?: string;
};
const FeatureCard: React.FC<Feature> = ({ icon, title, desc }) => {
  return (
    <div className="flex items-start gap-4 bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-sm min-w-[220px]">
      <div className="text-2xl p-2 rounded-md bg-white border border-gray-100">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{desc}</div>
      </div>
    </div>
  );
};

export default FeatureCard;
