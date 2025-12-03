import { Star } from "lucide-react";

interface TestimonialCardProps {
  title: string;
  text: string;
  name: string;
  location: string;
}

export default function TestimonialCard({
  title,
  text,
  name,
  location,
}: TestimonialCardProps) {
  return (
    <div className="bg-white shadow-md rounded-2xl border border-cyan-200 p-6 flex flex-col items-start transition hover:shadow-lg">
      <h3 className="text-lg text-black font-semibold mb-2">{title}</h3>
      {/* Stars */}
      <div className="flex text-yellow-500 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill="currentColor" />
        ))}
      </div>
      <p className="text-gray-600 mb-4">{text}</p>
      <span className="font-bold text-gray-800">
        {name}, {location}
      </span>
    </div>
  );
}
