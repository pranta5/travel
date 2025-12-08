"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/axios";

type EnquiryStatus =
  | "pending"
  | "followup"
  | "confirmed"
  | "solved"
  | "rejected"
  | "cancelled";

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  noOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  message: string;
  status: EnquiryStatus;
  remark?: string;
  followUpDate?: string | null;
  source: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const updateEnquiry = async ({
  id,
  ...updates
}: {
  id: string;
  status?: string;
  remark?: string;
  followUpDate?: string | null;
}) => {
  const { data } = await api.patch(`/enquiries/${id}`, updates);
  return data;
};

export default function ManageEnquiryDesign() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Add this state near the top with your other useState
  const [selectedMessage, setSelectedMessage] = useState<{
    message: string;
    name: string;
  } | null>(null);

  const queryClient = useQueryClient();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "All" && { status: statusFilter.toLowerCase() }),
  });

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["enquiries", page, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/enquiries?${queryParams}`);
      return data;
    },
    staleTime: 0,
    // refetchInterval: 5000,
    placeholderData: "previous",
    refetchOnWindowFocus: true,
  });

  const enquiries: Enquiry[] = response?.data || [];
  const pagination: Pagination = response?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  };

  const mutation = useMutation({
    mutationFn: updateEnquiry,
    onSuccess: () => {
      toast.success("Updated successfully!");
      // Refetch current page to get fresh data
      refetch();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || "Update failed"),
  });

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "MMM dd");
    } catch {
      return "-";
    }
  };

  const totalPages = pagination.pages;
  const currentPage = pagination.page;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="p-6 text-gray-600">
      <h1 className="text-2xl font-semibold mb-5">Enquiry</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search by Name, Phone, Email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="flex-1 min-w-[250px] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="followup">Follow Up</option>
          <option value="confirmed">Confirmed</option>
          <option value="solved">Solved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => setPage(1)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition"
        >
          Search
        </button>
      </div>

      {/* Loading & Error */}
      {isLoading && (
        <div className="text-center py-10">Loading enquiries...</div>
      )}
      {isError && (
        <div className="text-center py-10 text-red-500">
          Failed to load enquiries
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Guests</th>
                  <th className="p-3 font-medium">In</th>
                  <th className="p-3 font-medium">Out</th>
                  <th className="p-3 font-medium">Message</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Remark</th>
                  <th className="p-3 font-medium">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No enquiries found
                    </td>
                  </tr>
                ) : (
                  enquiries.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.phone}</td>
                      <td className="p-3">{item.noOfGuests}</td>
                      <td className="p-3">{formatDate(item.checkInDate)}</td>
                      <td className="p-3">{formatDate(item.checkOutDate)}</td>

                      {/* Message with Modal Trigger */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-gray-700 truncate max-w-[180px]"
                            title={item.message || ""}
                          >
                            {item.message ? (
                              <button
                                onClick={() =>
                                  setSelectedMessage({
                                    message: item.message,
                                    name: item.name,
                                  })
                                }
                                className="text-teal-600 hover:text-teal-800 text-sm font-medium underline"
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">
                                No message
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            mutation.mutate({
                              id: item._id,
                              status: e.target.value,
                            })
                          }
                          disabled={mutation.isPending}
                          className={`border rounded px-3 py-1.5 text-sm font-medium capitalize ${
                            item.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : item.status === "solved"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "followup"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="followup">Follow Up</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="solved">Solved</option>
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Remark */}
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Add remark..."
                          defaultValue={item.remark || ""}
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (value !== (item.remark || "")) {
                              mutation.mutate({
                                id: item._id,
                                remark: value || undefined,
                              });
                            }
                          }}
                          className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </td>

                      {/* Follow-up Date */}
                      <td className="p-3">
                        <DatePicker
                          selected={
                            item.followUpDate
                              ? new Date(item.followUpDate)
                              : null
                          }
                          onChange={(date: Date | null) => {
                            mutation.mutate({
                              id: item._id,
                              followUpDate: date ? date.toISOString() : null,
                            });
                          }}
                          dateFormat="dd MMM yyyy"
                          placeholderText="Select date"
                          className="border rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          isClearable
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
              entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={18} />
              </button>

              {getVisiblePages().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-3">
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1.5 rounded border ${
                      page === p
                        ? "bg-teal-500 text-white border-teal-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-3 py-1.5 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </>
      )}

      {/* Message Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Message from {selectedMessage.name}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message || "No message provided."}
              </p>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
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
