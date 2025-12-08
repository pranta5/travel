"use client";

import api from "@/lib/axios";
import { useState } from "react";

export default function Contactform_comp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(
    null
  );

  //   async function handleSubmit(e: React.FormEvent) {
  //     e.preventDefault();
  //     setLoading(true);
  //     setStatus(null);

  //     try {
  //       const res = await api.post("/contact", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ name, email, subject, message }),
  //       });

  //       const data = await res.data

  //       if (data.message) {
  //         setStatus({
  //           ok: true,
  //           message: data.message || "Message sent successfully.",
  //         });
  //         setName("");
  //         setEmail("");
  //         setSubject("");
  //         setMessage("");
  //       } else {
  //         setStatus({
  //           ok: false,
  //           message: data.message || "Something went wrong.",
  //         });
  //       }
  //     } catch (err) {
  //       setStatus({ ok: false, message: "Network error" });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 bg-gradient-to-b from-sky-500 to-indigo-600 text-white">
            <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
            <p className="mb-6 opacity-90">
              Have questions or want to work together? Send us a message and
              we'll get back to you within 1-2 business days.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-sm opacity-90">
                  HikeSike
                  <br />
                  Kolkata, India
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm opacity-90">+91 98765 43210</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm opacity-90">support@hikisike.in</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-8">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md bg-sky-600 text-white px-4 py-2 font-medium shadow hover:bg-sky-700 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                <div>
                  {status && (
                    <p
                      className={`text-sm ${
                        status.ok ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {status.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
            <div className="mt-6 text-xs text-gray-500">
              <p>
                By submitting you agree to our terms and that we may store and
                process your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
