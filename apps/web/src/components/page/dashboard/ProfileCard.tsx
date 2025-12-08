// src/components/ProfileCard.tsx
"use client";

import React, { useState } from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isEmailVerified?: boolean;
  referralCode?: string;
  referredBy?: Record<string, any>;
  walletBalance?: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  user: User;
  onEdit?: () => void;
};

export default function ProfileCard({ user, onEdit }: Props) {
  const [wallet, setWallet] = useState<number>(user.walletBalance ?? 0);
  const [copyStatus, setCopyStatus] = useState<string>("");

  const copyReferral = async () => {
    if (!user.referralCode) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Copy failed");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const formattedDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "—";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Avatar + name */}
          <div className="flex items-center gap-4 md:col-span-1">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-500">{user.email}</span>
                {user.isEmailVerified ? (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Unverified
                  </span>
                )}
              </div>

              {/* <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit?.()}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md text-sm hover:bg-slate-200"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-teal-500 text-white rounded-md text-sm hover:bg-teal-600"
                >
                  Settings
                </button>
              </div> */}
            </div>
          </div>

          {/* Middle: Details */}
          <div className="md:col-span-1 bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-800">Phone</span>
                <span>{user.phone ?? "—"}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-800">Role</span>
                <span className="capitalize">{user.role ?? "user"}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-800">Joined</span>
                <span>{formattedDate(user.createdAt)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-800">Updated</span>
                <span>{formattedDate(user.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Right: Referral + Wallet */}
          {/* <div className="md:col-span-1 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Referral Code</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {user.referralCode ?? "—"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={copyReferral}
                  className="px-3 py-1 text-sm bg-slate-100 rounded-md hover:bg-slate-200"
                >
                  Copy
                </button>
                {copyStatus && (
                  <span className="text-xs text-teal-600">{copyStatus}</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ₹{wallet.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50">
                  View Transactions
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="font-medium text-gray-800">Referred By</div>
              <div className="mt-1">
                {user.referredBy && Object.keys(user.referredBy).length > 0 ? (
                  <div className="text-sm">
                    {JSON.stringify(user.referredBy)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No referrer</div>
                )}
              </div>
            </div>
          </div> */}
        </div>

        {/* Optional: a bottom info row */}
        {/* <div className="border-t px-6 py-4 text-sm text-gray-500">
          <span>Account ID: </span>
          <span className="font-mono text-xs text-gray-700">{user._id}</span>
        </div> */}
      </div>
    </div>
  );
}
