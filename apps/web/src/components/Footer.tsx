import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdEmail, MdLocationOn } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white pt-12 pb-6 ">
      <div className=" max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div>
            <h4 className="flex items-center font-bold text-xl mb-3">
              <img
                src="/img/logo.png"
                alt="HikeSike Logo"
                className="w-10 h-10 mr-2 rounded"
              />
              HikeSike
            </h4>
            <p className="text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu
              rhoncus urna. Lorem ipsum dolor sit amet.
            </p>
            <h5 className="mt-4 font-semibold">Follow Us</h5>
            <div className="flex gap-4 mt-2 text-lg">
              <a href="#" className="hover:text-gray-300">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-gray-300">
                <FaXTwitter />
              </a>
              <a href="#" className="hover:text-gray-300">
                <FaLinkedinIn />
              </a>
              <a href="#" className="hover:text-gray-300">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold mb-3 text-lg">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-300">
                  › Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  › Destination
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  › About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  › Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  › Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="font-bold mb-3 text-lg">Contact Us</h5>
            <p className="flex items-center gap-2">
              <FaPhoneAlt /> 7003854933
            </p>
            <p className="flex items-center gap-2">
              <MdEmail /> care@hikesike.in
            </p>
            <p className="flex items-start gap-2">
              <MdLocationOn /> 4, Fairlie Place, BBD Bag, Kolkata-700001
            </p>
          </div>

          {/* Instagram */}
          <div>
            <h5 className="font-bold mb-3 text-lg">Instagram Post</h5>
            <div className="grid grid-cols-3 gap-2">
              {[
                "/img/blog-1.jpg",
                "/img/blog-1.jpg",
                "/img/blog-1.jpg",
                "/img/blog-1.jpg",
                "/img/blog-1.jpg",
                "/img/blog-1.jpg",
              ].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Instagram"
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-400 mt-8 pt-4 flex flex-col md:flex-row justify-between text-sm">
          <p>© 2024 All Right Reserved by HikeSike</p>
          <p>
            <a href="#" className="hover:text-gray-300">
              Terms & Conditions
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-gray-300">
              Privacy & Policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
