// src/app/dashboard/callbacks/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import "react-toastify/dist/ReactToastify.css";

type CallbackStatus =
  | "pending"
  | "called"
  | "no-answer"
  | "interested"
  | "not-interested";
type CallbackSource = "website" | "facebook" | "instagram" | "others";

type CallbackItem = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  destination?: string;
  preferredTime?: string;
  message?: string;
  status: CallbackStatus;
  remark?: string;
  calledAt?: string | null;
  source?: CallbackSource;
  createdAt: string;
  package?: { title?: string; slug?: string } | null;
};

type ApiWrappedResponse = {
  success?: boolean;
  data?: CallbackItem[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

const API_BASE = "/callback"; // using your `api` instance base path

export default function CallbacksPage() {
  const [data, setData] = useState<CallbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters & pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [sort, setSort] = useState<string>("-createdAt");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(""); // debounced
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // status modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CallbackStatus | "">("");
  const [selectedRemark, setSelectedRemark] = useState<string>("");

  // message viewer modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState<{
    name?: string;
    phone?: string;
    message?: string;
    createdAt?: string;
  } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const sourceOptions = useMemo(
    () => ["", "website", "facebook", "instagram", "others"],
    []
  );
  const statusOptions = useMemo(
    () => [
      "",
      "pending",
      "called",
      "no-answer",
      "interested",
      "not-interested",
    ],
    []
  );

  const fetchCallbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page,
        limit,
        sort,
      };
      if (status) params.status = status;
      if (source) params.source = source;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get(API_BASE, { params });
      const body: ApiWrappedResponse | CallbackItem[] = res.data;

      if (Array.isArray(body)) {
        setData(body);
        setTotal(body.length);
        setTotalPages(1);
      } else if ((body as ApiWrappedResponse).data) {
        const wrapped = body as ApiWrappedResponse;
        setData(wrapped.data || []);
        setTotal(wrapped.pagination?.total || (wrapped.data?.length ?? 0));
        setTotalPages(wrapped.pagination?.pages || (wrapped.data ? 1 : 0));
      } else {
        const maybe = (body as any).data ?? (body as any).callbacks ?? [];
        setData(Array.isArray(maybe) ? maybe : []);
        setTotal(
          (body as any).pagination?.total ||
            (Array.isArray(maybe) ? maybe.length : 0)
        );
        setTotalPages((body as any).pagination?.pages || 1);
      }
    } catch (err: any) {
      console.error("Fetch callbacks error:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(
            err.response.data?.error ||
              err.response.data?.message ||
              `Server ${err.response.status}`
          );
          toast.error(
            err.response.data?.error ||
              err.response.data?.message ||
              `Server ${err.response.status}`
          );
        } else if (err.request) {
          setError("No response from server — check API, network, or CORS.");
          toast.error("No response from server — check API, network, or CORS.");
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      } else {
        setError(err?.message || "Failed to fetch callbacks");
        toast.error(err?.message || "Failed to fetch callbacks");
      }
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, source, fromDate, toDate, searchTerm, sort]);

  // open change modal
  const openChangeModal = (item: CallbackItem) => {
    setSelectedId(item._id);
    setSelectedStatus(item.status || "pending");
    setSelectedRemark(item.remark || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedId(null);
    setSelectedStatus("");
    setSelectedRemark("");
    setModalLoading(false);
  };

  const openMessageModal = (item: CallbackItem) => {
    setMessageModalContent({
      name: item.name,
      phone: item.phone,
      message: item.message,
      createdAt: item.createdAt,
    });
    setMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setMessageModalContent(null);
  };

  // submit modal patch (do not change API)
  const submitModal = async () => {
    if (!selectedId) return;
    setModalLoading(true);
    setError(null);

    try {
      const res = await api.patch(`${API_BASE}/${selectedId}`, {
        status: selectedStatus,
        remark: selectedRemark || undefined,
      });

      const body = res.data;
      if (res.status >= 400 || (body && body.success === false)) {
        throw new Error(body?.error || body?.message || "Update failed");
      }

      // --- optimistic local update so new values show immediately ---
      // If server returned updated doc in body.data (common), use it.
      if (body?.data) {
        const updated: CallbackItem = body.data;
        setData((prev) =>
          prev.map((it) => (it._id === updated._id ? updated : it))
        );
      } else {
        // fallback: apply local changes (status, remark, calledAt)
        setData((prev) =>
          prev.map((it) =>
            it._id === selectedId
              ? {
                  ...it,
                  status: selectedStatus as CallbackStatus,
                  remark: selectedRemark || it.remark,
                  calledAt:
                    selectedStatus === "called"
                      ? new Date().toISOString()
                      : it.calledAt,
                }
              : it
          )
        );
      }
      // refresh counts by refetching pagination totals (optional)
      await fetchCallbacks();

      closeModal();
      toast.success(body?.message || "Updated successfully");
    } catch (err: any) {
      console.error("Modal update error:", err);
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to update";
        setError(msg);
        toast.error(msg);
      } else {
        setError(err?.message || "Failed to update callback");
        toast.error(err?.message || "Failed to update callback");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const resetFilters = () => {
    setPage(1);
    setLimit(20);
    setStatus("");
    setSource("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setSort("-createdAt");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-600">
      {/* React-Toastify container — recommended to place once at app root */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Callback Requests</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPage(1);
              fetchCallbacks();
            }}
            className="px-3 py-2 border rounded text-sm"
          >
            Refresh
          </button>
          <button
            onClick={resetFilters}
            className="px-3 py-2 border rounded text-sm"
          >
            Reset Filters
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="bg-white border rounded p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-2 py-1"
            >
              {statusOptions.map((s) => (
                <option key={s || "all"} value={s}>
                  {s === "" ? "All" : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Source</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-2 py-1"
            >
              {sourceOptions.map((s) => (
                <option key={s || "all"} value={s}>
                  {s === "" ? "All" : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs text-gray-600">Search</label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, email, message..."
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-xs text-gray-600">Sort</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="name">Name A→Z</option>
              <option value="-name">Name Z→A</option>
            </select>

            <label className="text-xs text-gray-600 ml-4">Per page</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing page {page} of {totalPages} — {total} total
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white border rounded overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Source / Package</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Preferred Time</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Remark</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {loading && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && !error && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No callbacks found
                </td>
              </tr>
            )}

            {!loading &&
              data.map((c, idx) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{c.name}</div>
                    {c.email && (
                      <div className="text-xs text-gray-500">{c.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">{c.phone}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-xs text-gray-600">{c.source}</div>
                    {c.package?.title && (
                      <div className="text-xs text-blue-600">
                        {c.package.title}
                      </div>
                    )}
                  </td>

                  {/* Destination */}
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm text-gray-700">
                      {c.destination || "-"}
                    </div>
                  </td>

                  {/* Preferred Time */}
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm text-gray-700">
                      {c.preferredTime || "-"}
                    </div>
                  </td>

                  {/* Message - truncated with view button */}
                  <td className="px-4 py-3 align-top max-w-[240px]">
                    <div className="truncate max-w-[240px]" title={c.message}>
                      {c.message || "-"}
                    </div>
                    {c.message && (
                      <button
                        onClick={() => openMessageModal(c)}
                        className="mt-1 text-xs text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    )}
                  </td>

                  {/* Remark */}
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm text-gray-700">
                      {c.remark || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          c.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : c.status === "called"
                            ? "bg-green-100 text-green-800"
                            : c.status === "no-answer"
                            ? "bg-gray-100 text-gray-800"
                            : c.status === "interested"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.calledAt && (
                        <div className="text-xs text-gray-500">
                          Called: {new Date(c.calledAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openChangeModal(c)}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        Change
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Pagination */}
      <footer className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
            disabled={page >= (totalPages || 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="text-sm text-gray-600">Total: {total}</div>
      </footer>

      {/* Status Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!modalLoading) closeModal();
            }}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
            <h3 className="text-lg font-semibold mb-3">
              Change Callback Status
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as CallbackStatus)
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  {statusOptions
                    .filter((s) => s) // skip empty option
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Remark (optional)</label>
                <textarea
                  value={selectedRemark}
                  onChange={(e) => setSelectedRemark(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    if (!modalLoading) closeModal();
                  }}
                  className="px-4 py-2 border rounded"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={submitModal}
                  className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-60"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModalOpen && messageModalContent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => closeMessageModal()}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Message from {messageModalContent.name}
                </h3>
                <div className="text-xs text-gray-500">
                  {messageModalContent.phone} -{" "}
                  {messageModalContent.createdAt
                    ? new Date(messageModalContent.createdAt).toLocaleString(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )
                    : "-"}
                </div>
              </div>
              <button
                onClick={() => closeMessageModal()}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <pre className="whitespace-pre-wrap text-sm">
                {messageModalContent.message}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => closeMessageModal()}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
