import MasonaryGrid from "./MasonaryGrid";

export default function AboutGallerySection() {
  return (
    <div className=" scroll-smooth overflow-hidden">
      <div className=" w-full md:pt-10 md:pb-20 px-4 md:px-16 justify-between md:bg-fixed bg-green-50 bg-gradient-to-b">
        <MasonaryGrid />
        <div className="text-gray-500 flex flex-col gap-4">
          <p>
            Mount Inerie is the tallest volcano on the island of Flores, and it
            might just be one of the most symmetrical volcanoes in the world. At
            sunrise, it casts a perfect shadow like a natural pyramid.
          </p>
          <p>
            "I hiked Inerie recently and it was an awesome experience. There’s
            plenty of challenge, but anyone who’s a fit hiker can do it. I’d
            recommend hiring a local guide like I did, because the path to the
            top can be hard to follow, and people usually start in the dark in
            order to see sunrise on the summit.", "This guide will explain how
            to hike Inerie, and everything you need to know before you go!",
          </p>
          <p>
            "Mount Inerie is the tallest volcano on the island of Flores, and it
            might just be one of the most symmetrical volcanoes in the world. At
            sunrise, it casts a perfect shadow like a natural pyramid.", "I
            hiked Inerie recently and it was an awesome experience. There’s
            plenty of challenge, but anyone who’s a fit hiker can do it. I’d
            recommend hiring a local guide like I did, because the path to the
            top can be hard to follow, and people usually start in the dark in
            order to see sunrise on the summit.", "This guide will explain how
            to hike Inerie, and everything you need to know before you go!"
          </p>
        </div>
      </div>
    </div>
  );
}
