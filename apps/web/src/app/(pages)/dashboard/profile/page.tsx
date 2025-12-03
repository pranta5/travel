// app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ProfileCard, { User } from "@/components/page/dashboard/ProfileCard";
import { toast } from "react-toastify";

export default function ProfilePageRoute() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get("/auth/me"); // baseURL from env + path
        // expected response: { user: { ... } }
        const data = res.data;
        if (!mounted) return;
        if (data?.user) {
          setUser(data.user as User);
        } else {
          // fallback: maybe API directly returns the user object
          setUser(data as User);
        }
      } catch (err: any) {
        // axios interceptor handles some things (toast / redirect),
        // but we still handle local errors here
        if (err?.response?.status === 401) {
          // interceptor might already redirect client-side, but ensure redirect here
          router.push("/login");
        } else {
          toast.error(err?.response?.data?.message || "Failed to load profile");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-gray-600">No profile found. Please login.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <ProfileCard user={user} />;
}
