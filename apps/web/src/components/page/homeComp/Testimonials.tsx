import TestimonialCard from "@/components/ui/TestimonialCard";

const testimonials = [
  {
    title: "Best Price Assured",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
  {
    title: "Smooth Servicers",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
  {
    title: "Clean and Comfortable",
    text: "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development to fill empty spaces.",
    name: "Parul",
    location: "Kolkata",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-10">
        <h4 className="text-lg text-gray-500 italic">Testimonials</h4>
        <h2 className="text-3xl text-black font-bold">
          What <span className="text-cyan-600">Client</span> Say About Us
        </h2>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3 px-4">
        {testimonials.map((item, index) => (
          <TestimonialCard
            key={index}
            title={item.title}
            text={item.text}
            name={item.name}
            location={item.location}
          />
        ))}
      </div>
    </section>
  );
}
