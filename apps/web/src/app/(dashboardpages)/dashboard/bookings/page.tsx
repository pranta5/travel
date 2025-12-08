"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axios";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "reschedule"
  | "complete"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type Booking = {
  _id: string;
  bookingId: string;
  bookingDate: string;
  travelDate: string;
  totalAmount: number;
  paidAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  package: {
    _id?: string;
    title: string;
    availableDates?: string[]; // ISO strings
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

/** Package API shape (we fetch only availableDates when needed) */
type PackageAPI = {
  _id: string;
  title: string;
  availableDates?: string[]; // ISO strings
};

export default function ManageBookingDesign() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    bookingId?: string;
    totalAmount?: number;
    currentPaidAmount?: number;
  }>({ open: false });

  const queryClient = useQueryClient();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // build query params string (will be captured in queryFn)
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "All" && { status: statusFilter }),
    ...(paymentFilter !== "All" && { paymentStatus: paymentFilter }),
  });

  // === Important: single canonical queryKey used everywhere ===
  const bookingsQueryKey = [
    "bookings",
    page,
    limit,
    debouncedSearch,
    statusFilter,
    paymentFilter,
  ];

  // Fetch bookings (list)
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: bookingsQueryKey,
    queryFn: async () => {
      const { data } = await api.get(`/booking?${queryParams}`);
      return data;
    },
    staleTime: 0,
    // refetchInterval: 5000,
    placeholderData: "previous",
    refetchOnWindowFocus: true,
  });

  const bookings: Booking[] = response?.data || [];
  const pagination: Pagination = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  // Formatting helpers
  const formatDate = (date?: string) =>
    date ? format(new Date(date), "dd MMM yyyy") : "-";
  const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const totalPages = pagination.pages;
  const currentPage = pagination.page;

  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    )
      range.push(i);
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  // --------- Mutations ----------

  // 1) Update Booking Status (optimistic + exact invalidation)
  const updateBookingStatus = useMutation({
    mutationFn: ({
      id,
      bookingStatus,
    }: {
      id: string;
      bookingStatus: string;
    }) => api.patch(`/booking/${id}`, { bookingStatus }),

    onMutate: async ({ id, bookingStatus }) => {
      await queryClient.cancelQueries({ queryKey: bookingsQueryKey });
      const previous = queryClient.getQueryData(bookingsQueryKey);

      queryClient.setQueryData(bookingsQueryKey, (old: any) => {
        if (!old) return old;
        if (!old.data) return old;
        return {
          ...old,
          data: old.data.map((b: Booking) =>
            b._id === id ? { ...b, bookingStatus } : b
          ),
        };
      });

      return { previous };
    },

    onError: (err, variables, context: any) => {
      toast.error("Failed to update status");
      if (context?.previous !== undefined) {
        queryClient.setQueryData(bookingsQueryKey, context.previous);
      } else {
        queryClient.invalidateQueries({
          queryKey: bookingsQueryKey,
          exact: true,
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"], exact: false });
    },

    onSuccess: (res) => {
      // If API returns updated booking, update cache directly
      const updatedBooking = res?.data;
      if (updatedBooking) {
        queryClient.setQueryData(bookingsQueryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((b: Booking) =>
              b._id === updatedBooking._id ? updatedBooking : b
            ),
          };
        });
      }
      toast.success("Booking status updated!");
    },
  });

  // 2) Update payment status (no optimistic update, refetch exact)
  const updatePaymentStatus = useMutation({
    mutationFn: ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: string;
    }) => api.patch(`/booking/${id}`, { paymentStatus }),
    onSuccess: async (res) => {
      // if res contains updated booking, update cache; otherwise refetch exact key
      const updatedBooking = res?.data;
      if (updatedBooking) {
        queryClient.setQueryData(bookingsQueryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((b: Booking) =>
              b._id === updatedBooking._id ? updatedBooking : b
            ),
          };
        });
      } else {
        await queryClient.invalidateQueries({
          queryKey: bookingsQueryKey,
          exact: true,
        });
      }
      toast.success("Payment status updated!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || "Update failed"),
  });

  // 3) update payment with amount (optimistic)
  const updatePaymentWithAmount = useMutation({
    mutationFn: ({
      id,
      paymentStatus,
      paidAmount,
    }: {
      id: string;
      paymentStatus: string;
      paidAmount?: number;
    }) => api.patch(`/booking/${id}`, { paymentStatus, paidAmount }),

    onMutate: async ({ id, paymentStatus, paidAmount }) => {
      await queryClient.cancelQueries({ queryKey: bookingsQueryKey });
      const previous = queryClient.getQueryData(bookingsQueryKey);

      queryClient.setQueryData(bookingsQueryKey, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((b: Booking) =>
            b._id === id
              ? {
                  ...b,
                  paymentStatus,
                  paidAmount:
                    paidAmount !== undefined ? paidAmount : b.paidAmount,
                }
              : b
          ),
        };
      });

      return { previous };
    },

    onError: (err, variables, context: any) => {
      toast.error("Failed to update payment");
      if (context?.previous !== undefined) {
        queryClient.setQueryData(bookingsQueryKey, context.previous);
      } else {
        queryClient.invalidateQueries({
          queryKey: bookingsQueryKey,
          exact: true,
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"], exact: false });
    },

    onSuccess: (res) => {
      const updatedBooking = res?.data;
      if (updatedBooking) {
        queryClient.setQueryData(bookingsQueryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((b: Booking) =>
              b._id === updatedBooking._id ? updatedBooking : b
            ),
          };
        });
      }
      toast.success("Payment updated successfully!");
      setPaymentModal({ open: false });
    },
  });

  // 4) update travel date (optimistic)
  const updateTravelDate = useMutation({
    mutationFn: ({ id, travelDate }: { id: string; travelDate: string }) =>
      api.patch(`/booking/${id}`, { travelDate }),
    onMutate: async ({ id, travelDate }) => {
      await queryClient.cancelQueries({ queryKey: bookingsQueryKey });
      const previous = queryClient.getQueryData(bookingsQueryKey);

      queryClient.setQueryData(bookingsQueryKey, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((b: Booking) =>
            b._id === id ? { ...b, travelDate } : b
          ),
        };
      });

      return { previous };
    },
    onError: (err, variables, context: any) => {
      toast.error("Failed to update travel date");
      if (context?.previous !== undefined) {
        queryClient.setQueryData(bookingsQueryKey, context.previous);
      } else {
        queryClient.invalidateQueries({
          queryKey: bookingsQueryKey,
          exact: true,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"], exact: false });
    },
    onSuccess: (res) => {
      const updatedBooking = res?.data;
      if (updatedBooking) {
        queryClient.setQueryData(bookingsQueryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((b: Booking) =>
              b._id === updatedBooking._id ? updatedBooking : b
            ),
          };
        });
      }
      toast.success("Travel date updated");
      setSelectedBooking(null);
    },
  });

  // ------------- Fetch package when modal opens -------------
  const packageQuery = useQuery<PackageAPI, Error>({
    queryKey: ["package", selectedBooking?.package._id],
    enabled: Boolean(selectedBooking?.package._id),
    queryFn: async () => {
      const pkgId = selectedBooking!.package._id!;
      const res = await api.get(`/packages/single/${pkgId}`);
      return res.data.data as PackageAPI;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ------------ Render ------------
  return (
    <div className="p-6 text-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bookings</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* <input
            placeholder="Search user or package..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          /> */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="reschedule">Reschedule</option>
            <option value="complete">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="All">All Payment</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={() => setPage(1)}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Loading & Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading bookings...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">
          Failed to load bookings
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Booking ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Package</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12 text-gray-400"
                      >
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <td className="px-4 py-3 font-medium">
                          #{booking.bookingId}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {booking.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {booking.package.title}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(booking.bookingDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold">
                              {formatAmount(booking.totalAmount)}
                            </div>
                            {booking.paidAmount < booking.totalAmount && (
                              <div className="text-xs text-orange-600">
                                Paid: {formatAmount(booking.paidAmount)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Booking Status */}
                        <td className="px-4 py-3">
                          <select
                            value={booking.bookingStatus}
                            onChange={(e) =>
                              updateBookingStatus.mutate({
                                id: booking._id,
                                bookingStatus: e.target.value,
                              })
                            }
                            className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${
                              booking.bookingStatus === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.bookingStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.bookingStatus === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updateBookingStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="reschedule">Reschedule</option>
                            <option value="complete">Complete</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-3">
                          <select
                            value={booking.paymentStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value as PaymentStatus;
                              if (
                                newStatus === "paid" &&
                                booking.paymentStatus !== "paid"
                              ) {
                                setPaymentModal({
                                  open: true,
                                  bookingId: booking._id,
                                  totalAmount: booking.totalAmount,
                                  currentPaidAmount: booking.paidAmount,
                                });
                              } else {
                                updatePaymentStatus.mutate({
                                  id: booking._id,
                                  paymentStatus: newStatus,
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${
                              booking.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : booking.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.paymentStatus === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updatePaymentStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>

                        {/* Travel Date */}
                        <td className="px-4 py-3">
                          {booking.package.availableDates &&
                          booking.package.availableDates.length > 0 ? (
                            <select
                              value={booking.travelDate}
                              onChange={(e) =>
                                updateTravelDate.mutate({
                                  id: booking._id,
                                  travelDate: e.target.value,
                                })
                              }
                              className="border rounded px-4 py-2 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              disabled={updateTravelDate.isPending}
                            >
                              {booking.package.availableDates.map((iso) => (
                                <option key={iso} value={iso}>
                                  {format(new Date(iso), "dd MMM yyyy")}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 italic">
                              No dates
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
              bookings
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border rounded disabled:opacity-50"
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
                    className={`px-4 py-2 rounded border ${
                      page === p ? "bg-teal-600 text-white" : ""
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded disabled:opacity-50"
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
              className="border rounded px-4 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {paymentModal.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setPaymentModal({ open: false })}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Mark as Paid</h3>
            <p className="text-gray-600 mb-4">
              Total Amount:{" "}
              <strong>
                ₹{paymentModal.totalAmount?.toLocaleString("en-IN")}
              </strong>
              {paymentModal.currentPaidAmount! > 0 && (
                <span className="block text-sm text-orange-600">
                  Already Paid: ₹
                  {paymentModal.currentPaidAmount?.toLocaleString("en-IN")}
                </span>
              )}
            </p>

            <label className="block text-sm font-medium mb-2">
              Enter Paid Amount
            </label>
            <input
              type="number"
              defaultValue={paymentModal.totalAmount}
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              id="paid-amount-input"
              min="0"
              max={paymentModal.totalAmount}
              step="1"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPaymentModal({ open: false })}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "paid-amount-input"
                  ) as HTMLInputElement;
                  const amount = Number(input.value);
                  if (isNaN(amount) || amount < 0) {
                    toast.error("Please enter a valid amount");
                    return;
                  }
                  updatePaymentWithAmount.mutate({
                    id: paymentModal.bookingId!,
                    paymentStatus: "paid",
                    paidAmount: amount,
                  });
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                disabled={updatePaymentWithAmount.isPending}
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Booking Details Modal (change travelDate here) ---------- */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Booking Details — #{selectedBooking.bookingId}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="font-medium">{selectedBooking.user.name}</div>
                  <div className="text-xs text-gray-500">
                    Mail - {selectedBooking.user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Ph - {selectedBooking.user.phone}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Package</div>
                  <div className="font-medium">
                    {selectedBooking.package.title}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Booking Date</div>
                  <div className="font-medium">
                    {formatDate(selectedBooking.bookingDate)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">
                    Current Travel Date
                  </div>
                  <div className="font-medium">
                    {formatDate(selectedBooking.travelDate)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-medium">
                    {formatAmount(selectedBooking.totalAmount)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <div className="font-medium capitalize">
                    {selectedBooking.paymentStatus}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Refetch bookings to ensure latest
                  queryClient.invalidateQueries({
                    queryKey: bookingsQueryKey,
                    exact: true,
                  });
                  setSelectedBooking(null);
                }}
                className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
