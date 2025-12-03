"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type EnquiryRow = {
  name: string;
  phone: string;
  guest: string;
  inDate: string;
  outDate: string;
  enquiry: string;
  status: string;
};

const dummyData: EnquiryRow[] = [
  {
    name: "Siphabcde",
    phone: "02315615",
    guest: "01",
    inDate: "Apr 30",
    outDate: "Apr 30",
    enquiry: "Massage",
    status: "Pending",
  },
  {
    name: "John Rick",
    phone: "02315615",
    guest: "02",
    inDate: "May 23",
    outDate: "May 23",
    enquiry: "Massage",
    status: "Confirmed",
  },
  {
    name: "Siphabcde",
    phone: "02315615",
    guest: "05",
    inDate: "Apr 30",
    outDate: "Apr 30",
    enquiry: "Massage",
    status: "Cancelled",
  },
  {
    name: "John Rick",
    phone: "02315615",
    guest: "07",
    inDate: "Jul 28",
    outDate: "Jul 28",
    enquiry: "Massage",
    status: "Pending",
  },
];

export default function ManageEnquiryDesign() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [data, setData] = useState(dummyData);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EnquiryRow;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof EnquiryRow) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    const sorted = [...data].sort((a, b) => {
      const valA = a[key].toString().toLowerCase();
      const valB = b[key].toString().toLowerCase();
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setData(sorted);
    setSortConfig({ key, direction });
  };

  const sortIcon = (key: keyof EnquiryRow) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ChevronUp size={14} className="opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  // Filter Logic (frontend only)
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 text-gray-600">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-5">Enquiry</h1>

      {/* Search + Status Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Enter Phone Or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[250px] border rounded-lg px-4 py-2"
        />

        {/* Status FILTER */}
        <select
          className="border rounded-lg px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              {["name", "phone", "guest", "inDate", "outDate"].map((key) => (
                <th
                  key={key}
                  className="p-3 font-medium cursor-pointer select-none"
                >
                  <div
                    className="flex items-center gap-1"
                    onClick={() => handleSort(key as keyof EnquiryRow)}
                  >
                    {key === "inDate"
                      ? "In"
                      : key === "outDate"
                      ? "Out"
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortIcon(key as keyof EnquiryRow)}
                  </div>
                </th>
              ))}

              <th className="p-3 font-medium">enquiry</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Remarks</th>
              <th className="p-3 font-medium">Followup</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.phone}</td>
                <td className="p-3">{item.guest}</td>
                <td className="p-3">{item.inDate}</td>
                <td className="p-3">{item.outDate}</td>
                <td className="p-3">{item.enquiry}</td>

                {/* Status */}
                <td className="p-3">
                  <select className="border rounded px-2 py-1">
                    <option>{item.status}</option>
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Cancelled</option>
                  </select>
                </td>

                {/* Remarks */}
                <td className="p-3">
                  <input
                    placeholder="Write..."
                    className="border rounded px-2 py-1 w-32"
                  />
                </td>

                {/* Follow-up */}
                <td className="p-3">
                  <input type="date" className="border rounded px-2 py-1" />
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-400">
                  No enquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
