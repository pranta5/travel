// components/NotFound.tsx

import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-blue-600 tracking-wider">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 mt-6">
          Page Not Found
        </p>
        <p className="text-gray-600 mt-4 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. Let's get you
          back on track!
        </p>

        <Link href="/">
          <button className="mt-10 px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition shadow-lg">
            ← Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
