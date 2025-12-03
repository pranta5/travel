import { Calendar, ArrowUpRight } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  date: string;
  image: string;
  description?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Top tips for booking your Trip: what you need to know",
    date: "March 5, 2025",
    image: "/img/blog-1.jpg",
  },
  {
    id: 2,
    title: "University class starting soon while the lovely valley team",
    date: "March 5, 2025",
    image: "/img/blog-1.jpg",
  },
  {
    id: 3,
    title: "Exploring The Green Spaces Of Realar Residence",
    date: "March 5, 2025",
    image: "/img/blog-1.jpg",
  },
  {
    id: 4,
    title: "Enrich Your Mind Envision Your Future Education for success",
    date: "March 5, 2025",
    image: "/img/blog-1.jpg",
  },
];

export default function BlogSection() {
  return (
    <section className="py-16 bg-white">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-gray-600">Our Blogs</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          <span className="text-cyan-600">News & Articles</span> From
          <span className="text-gray-800"> HikeSike</span>
        </h2>
      </div>

      {/* Blog Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Large Blog */}
        <div className="relative rounded-2xl overflow-hidden shadow-md group">
          <img
            src={blogPosts[0].image}
            alt={blogPosts[0].title}
            className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
            <div className="flex items-center gap-2 text-sm mb-2">
              <Calendar className="w-4 h-4" /> {blogPosts[0].date}
            </div>
            <h3 className="text-lg font-semibold">{blogPosts[0].title}</h3>
            <button className="mt-3 w-10 h-10 flex items-center justify-center bg-cyan-500 rounded-full">
              <ArrowUpRight className="text-white" />
            </button>
          </div>
        </div>

        {/* Right Small Blogs */}
        <div className="flex flex-col gap-6">
          {blogPosts.slice(1).map((post) => (
            <div
              key={post.id}
              className="flex gap-4 items-center rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-32 h-28 object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" /> {post.date}
                </div>
                <h4 className="font-medium text-gray-800">{post.title}</h4>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-cyan-500 rounded-full mr-3">
                <ArrowUpRight className="text-white w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
