// "use client";
// import PolicySection from "@/components/page/packageComp/PolicySection";
// import Reviews from "@/components/page/packageComp/Reviews";
// import ReviewSummary from "@/components/page/packageComp/ReviewSummary";
// import TourPackage from "@/components/page/packageComp/TourPackage";
// import React from "react";

// const PackagePage = () => {
//   return (
//     <div className="mt-16 bg-white">
//       <TourPackage
//         title="Darjeeling Tour Package"
//         id=""
//         duration="3N/4D"
//         locations={[
//           { name: "Sittong", days: 1 },
//           { name: "Dawaipani", days: 1 },
//           { name: "Lepchajagat", days: 1 },
//         ]}
//         price={3999}
//         discountPrice={2999}
//         rating={4.4}
//         reviews={76}
//         images={[
//           {
//             src: "/img/hero-bg.jpg",
//             label: "Destination",
//             alt: "Darjeeling",
//           },
//           { src: "/img/hero-bg.jpg", label: "Stays" },
//           { src: "/img/hero-bg.jpg", label: "Sightseeing" },
//         ]}
//         itinerary={[
//           {
//             day: "Day 1",
//             title: "NJP to Sittong via Scenic Spots",
//             description: "Begin your journey...",
//           },
//           {
//             day: "Day 2",
//             title: "Sittong to Dawaipani",
//             description: "Explore heritage villages...",
//           },
//           {
//             day: "Day 3",
//             title: "Dawaipani to njp",
//             description: "Return to NJP with memories...",
//           },
//         ]}
//         overview={[
//           {
//             view: "This Darjeeling package covers hilltop views, tea gardens, local culture, comfortable stays and guided transfers. Great for families and couples.",
//           },
//           {
//             highlighted: [
//               "Tea Garden Visit",
//               "Heritage Villages",
//               "Local Cuisine Tasting",
//             ],
//           },
//         ]}
//         activities={[
//           {
//             title: "Toy Train Ride",
//             image: "/img/card-demo.png",
//           },
//           {
//             title: "Tea Garden Visit",
//             image: "/img/card-demo.png",
//           },
//           {
//             title: "Tea Garden Visit",
//             image: "/img/card-demo.png",
//           },
//         ]}
//         costItems={[
//           { include: ["food", "travel"] },
//           { exclude: ["parking", "outside food"] },
//         ]}
//         faqs={[
//           {
//             q: "What is the best time to visit?",
//             a: "Best months: March to May and September to November.",
//           },
//           {
//             q: "Are meals included?",
//             a: "Breakfast is included, other meals optional.",
//           },
//         ]}
//         packages={[
//           {
//             type: "Standard",
//             price: 3999,
//             discountPrice: 2999,
//             features: ["Budget stay", "Shared transport", "Breakfast only"],
//           },
//           {
//             type: "Deluxe",
//             price: 5999,
//             discountPrice: 4999,
//             features: [
//               "3-star stay",
//               "Private transport",
//               "Breakfast & Dinner",
//             ],
//           },
//           {
//             type: "superdeluxe",
//             price: 8999,
//             discountPrice: 7999,
//             features: ["4-star stay", "Luxury transport", "All meals included"],
//           },
//         ]}
//         askExpertProps={{
//           onSubmit: (d: any) => console.log("enquiry:", d),
//         }}
//       />
//       <ReviewSummary />
//       <Reviews />
//       <PolicySection />
//     </div>
//   );
// };

// export default PackagePage;
