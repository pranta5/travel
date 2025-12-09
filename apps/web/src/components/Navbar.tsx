// components/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequestCallbackModal from "./ui/RequestCallbackModal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify"; // ← React-Toastify
import api from "../lib/axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userRef = useRef<HTMLDivElement | null>(null);

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow = isOpen || modalOpen ? "hidden" : "auto";
  }, [isOpen, modalOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserOpen(false);
        setIsOpen(false);
        setModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Destination", href: "/destination" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const getLinkClasses = (href: string) =>
    `relative pb-1 transition-colors duration-300 block hover:text-blue-500 ${
      pathname === href
        ? "text-blue-600 font-semibold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-blue-600 after:rounded-full"
        : "text-gray-700 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
    }`;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully! See you soon!", {
        position: "top-right",
        autoClose: 3000,
      });
      setUserOpen(false);
      setIsOpen(false);
      router.push("/");
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleCallbackSubmit = async (payload: {
    name: string;
    phone: string;
  }) => {
    try {
      // Replace with real API call
      await api.post("/callback", payload);
      console.log("Callback requested:", payload);

      toast.success("Callback request sent! We'll call you soon.");
    } catch (err) {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setModalOpen(false);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white fixed w-full top-0 z-50 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white fixed w-full top-0 left-0 right-0 h-16 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/img/logo.png"
                alt="logo"
                className="h-10 w-10 object-cover rounded"
              />
              <span className="text-lg sm:text-xl font-semibold text-gray-800">
                HikeSike
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-8 font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClasses(link.href)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* User Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserOpen(!userOpen);
                    setIsOpen(false);
                  }}
                  className="hidden lg:inline-flex items-center justify-center text-teal-500 rounded-full border p-1 w-8 h-8 hover:bg-teal-500 hover:text-white transition"
                >
                  <User className="w-4 h-4" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-600 border-b">
                          Hello,{" "}
                          <span className="font-semibold">{user.name}</span>
                        </div>
                        <Link
                          href="/dashboard/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserOpen(false)}
                        >
                          Profile
                        </Link>
                        {/* <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserOpen(false)}
                        >
                          Dashboard
                        </Link> */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Request Callback */}
              <button
                className="hidden lg:block px-4 py-2 border border-teal-500 text-teal-500 rounded-full hover:bg-teal-500 hover:text-white transition text-sm"
                onClick={() => setModalOpen(true)}
              >
                Request A Callback
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden text-gray-700"
                onClick={() => {
                  setIsOpen(!isOpen);
                  setUserOpen(false);
                }}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden bg-white shadow-md px-4 pb-4 transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-3 pb-2 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 ${getLinkClasses(link.href)}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    Hi, {user.name}!
                  </p>
                  <Link
                    href="/dashboard/profile"
                    className="block text-sm text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  {/* <Link
                    href="/dashboard"
                    className="block text-sm text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link> */}
                  <button
                    onClick={handleLogout}
                    className="block text-sm text-red-600 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block text-sm text-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block text-sm text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
              <button
                className="mt-4 w-full text-left px-3 py-2 border border-teal-500 text-teal-500 rounded-full hover:bg-teal-500 hover:text-white transition text-sm"
                onClick={() => {
                  setModalOpen(true);
                  setIsOpen(false);
                }}
              >
                Request A Callback
              </button>
            </div>
          </div>
        </div>
      </nav>

      <RequestCallbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCallbackSubmit}
      />
    </>
  );
}
