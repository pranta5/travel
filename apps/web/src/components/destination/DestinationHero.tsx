// components/destination/DestinationHero.tsx

interface Destination {
  key: string;
  name: string;
  Icon: any;
  color: string;
}

export default function DestinationHero({
  destination,
}: {
  destination: Destination;
}) {
  const { name, Icon } = destination;

  return (
    <section className="relative h-96 bg-gradient-to-br from-cyan-600 to-teal-700 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40" />

      <div className="relative h-full flex items-center justify-center text-center">
        <div className="text-center text-white px-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur rounded-full mb-6">
            <Icon className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Explore {name}
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Discover handpicked tour packages to {name} with best prices &
            amazing experiences
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
