import React from "react";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-2 bg-white shadow-md rounded-xl px-2 py-2 hover:shadow-lg transition">
      <div className="text-lg">{icon}</div>
      <p className=" text-gray-800">{title}</p>
    </div>
  );
};

export default InfoCard;
