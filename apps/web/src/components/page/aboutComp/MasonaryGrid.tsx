const images = [
  "/img/about/about-masonary-1.jpg",
  "/img/about/about-masonary-2.jpg",
  "/img/about/about-masonary-6.jpg",
  "/img/about/about-masonary-3.jpg",
  "/img/about/about-masonary-4.jpg",
];

const MasonaryGrid: React.FC = () => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 py-10 md:py-20 gap-4 ">
      {images.map((src, index) => (
        <div key={index} className="mb-4 break-inside-avoid">
          <img src={src} className="w-full object-cover rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default MasonaryGrid;
