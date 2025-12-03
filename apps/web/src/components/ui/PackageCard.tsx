import { Phone } from "lucide-react";

interface PackageCardProps {
  title: string;
  duration: string;
  pickup: string;
  nightStay: string;
  image: string;
}

export default function PackageCard({
  title,
  duration,
  pickup,
  nightStay,
  image,
}: PackageCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img src={image} alt={title} className="w-full h-56 object-cover" />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <ul className="text-gray-600 text-sm space-y-2 mb-4">
          <li>📅 Duration: {duration}</li>
          <li>🚖 Pickup & Drop: {pickup}</li>
          <li>🏨 Night Stay: {nightStay}</li>
        </ul>
        <button className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white font-medium py-2 rounded-xl hover:bg-cyan-600 transition">
          <Phone size={18} /> Ask an expert
        </button>
      </div>
    </div>
  );
}
