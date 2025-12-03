import { MapPin } from "lucide-react";

export default function SearchBox() {
  return (
    <div className="py-6 bg-white">
      <div className="flex items-center bg-white drop-shadow-md rounded-xl p-2 gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 flex-1 border-r ">
          <MapPin className="text-cyan-500" />
          <input
            type="text"
            placeholder="Where are you going?"
            className="w-full outline-none text-sm text-gray-500"
          />
        </div>
        <button className="bg-cyan-500 text-white px-6 py-2 rounded-lg">
          Search
        </button>
      </div>
    </div>
  );
}
