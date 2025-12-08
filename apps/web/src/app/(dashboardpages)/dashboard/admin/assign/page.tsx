"use client";

import React, { useEffect, useMemo, useState } from "react";

type UserShort = { _id: string; name?: string; email?: string; role?: string };
type ApiResp = {
  success?: boolean;
  data?: any;
  error?: string;
  employeeId?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100/api";

function getToken(): string | null {
  try {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export default function AdminAssignPage() {
  const [employees, setEmployees] = useState<UserShort[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [currentDefault, setCurrentDefault] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: string; text: string } | null>(
    null
  );

  const token = useMemo(() => getToken(), []);

  // Fetch employees only
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/users?role=employee`, {
          credentials: "include",
        });

        const j: ApiResp = await res.json().catch(() => ({}));
        setEmployees(Array.isArray(j.data) ? j.data : []);
      } catch (err) {
        console.error("employee fetch error", err);
      }
    })();
  }, [token]);

  // Load current default employee
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/chat/default`, {
          credentials: "include",
        });

        const j: ApiResp = await res.json().catch(() => ({}));
        setCurrentDefault(j.employeeId ?? null);
      } catch {}
    })();
  }, [token]);

  async function setDefault(employeeId: string) {
    if (!employeeId) return;
    setStatus({ type: "info", text: "Saving..." });

    try {
      const res = await fetch(`${API_BASE}/admin/chat/default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify({ employeeId }),
      });

      const j = await res.json();
      if (res.ok && j.success) {
        setCurrentDefault(employeeId);
        setStatus({ type: "success", text: "Default employee set!" });
      } else {
        setStatus({ type: "error", text: j.error ?? "Failed to set default" });
      }
    } catch {
      setStatus({ type: "error", text: "Network/server error" });
    }

    setTimeout(() => setStatus(null), 2000);
  }

  async function removeDefault() {
    setStatus({ type: "info", text: "Removing..." });

    try {
      const res = await fetch(`${API_BASE}/admin/chat/default`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        credentials: "include",
      });

      const j = await res.json();
      if (res.ok && j.success) {
        setCurrentDefault(null);
        setStatus({ type: "success", text: "Removed successfully" });
      } else {
        setStatus({ type: "error", text: j.error ?? "Remove failed" });
      }
    } catch {
      setStatus({ type: "error", text: "Network/server error" });
    }

    setTimeout(() => setStatus(null), 2000);
  }

  const currentDefaultName =
    employees.find((e) => e._id === currentDefault)?.name ?? currentDefault;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">
        Assign Chat Support Employee
      </h1>

      <label className="block mb-2 font-medium">Choose Support Employee</label>
      <select
        className="w-full border p-2 rounded mb-4"
        value={selectedEmployeeId}
        onChange={(e) => setSelectedEmployeeId(e.target.value)}
      >
        <option value="">-- Select Employee --</option>
        {employees.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name ?? e.email ?? e._id}
          </option>
        ))}
      </select>

      <div className="flex gap-3 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={!selectedEmployeeId}
          onClick={() => setDefault(selectedEmployeeId)}
        >
          Set as Default Support
        </button>

        <button className="px-4 py-2 border rounded" onClick={removeDefault}>
          Remove Default
        </button>
      </div>

      {status && (
        <div
          className={`p-3 mb-4 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="text-sm text-gray-700">
        <div>
          Current Default Employee:{" "}
          <strong>{currentDefaultName ?? "None"}</strong>
        </div>
      </div>
    </div>
  );
}
