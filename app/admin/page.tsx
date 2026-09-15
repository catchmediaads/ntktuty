
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Complaint = {
  id: number;
  complaint_id: string;
  created_at: string;
  name: string;
  mobile: string;
  district: string;
  constituency: string;
  area: string;
  street: string;
  category: string;
  description: string;
  status: string;
};

const statusOptions = [
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

const constituencyOptions = [
  "அனைத்து தொகுதி",
  "விளாத்திகுளம்",
  "தூத்துக்குடி",
  "திருச்செந்தூர்",
  "ஸ்ரீவைகுண்டம்",
  "ஓட்டப்பிடாரம்",
  "கோவில்பட்டி",
];

export default function AdminDashboard() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [constituencyFilter, setConstituencyFilter] =
    useState("அனைத்து தொகுதி");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setComplaints((data as Complaint[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function updateStatus(
    complaintId: number,
    newStatus: string
  ) {
    const { error: updateError } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );

    setSelectedComplaint((current) =>
      current && current.id === complaintId
        ? { ...current, status: newStatus }
        : current
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const searchableText = [
      complaint.complaint_id,
      complaint.name,
      complaint.mobile,
      complaint.area,
      complaint.street,
      complaint.category,
      complaint.constituency,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    const matchesConstituency =
      constituencyFilter === "அனைத்து தொகுதி" ||
      complaint.constituency === constituencyFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesConstituency
    );
  });

  const totalComplaints = filteredComplaints.length;

  const resolvedCount = filteredComplaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const rejectedCount = filteredComplaints.filter(
    (complaint) => complaint.status === "Rejected"
  ).length;

  const inProgressCount = filteredComplaints.filter(
    (complaint) =>
      complaint.status === "Pending" ||
      complaint.status === "In Progress"
  ).length;

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-slate-800">
      <header className="bg-red-700 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Complaint Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-red-100">
              Naam Tamilar Katchi — Thoothukudi District
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-white px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] p-5">
        {/* Constituency filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          {constituencyOptions.map((constituency) => (
            <button
              key={constituency}
              onClick={() =>
                setConstituencyFilter(constituency)
              }
              className={`rounded-full border px-5 py-3 font-semibold transition ${
                constituencyFilter === constituency
                  ? "border-red-700 bg-red-700 text-white"
                  : "border-[#dfcdb6] bg-white text-slate-700 hover:bg-red-50"
              }`}
            >
              {constituency}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border-2 border-green-700 bg-white p-5 text-center shadow-sm">
            <p className="text-4xl font-bold text-green-700">
              {resolvedCount}
            </p>
            <p className="mt-2 text-lg">✅ முடித்தவை</p>
          </div>

          <div className="rounded-2xl border-2 border-red-600 bg-white p-5 text-center shadow-sm">
            <p className="text-4xl font-bold text-red-600">
              {rejectedCount}
            </p>
            <p className="mt-2 text-lg">❌ நிராகரிக்கப்பட்டவை</p>
          </div>

          <div className="rounded-2xl border-2 border-blue-700 bg-white p-5 text-center shadow-sm">
            <p className="text-4xl font-bold text-blue-700">
              {inProgressCount}
            </p>
            <p className="mt-2 text-lg">
              ⏳ நடவடிக்கையில் உள்ள
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#dfcdb6] bg-white p-5 text-center shadow-sm">
            <p className="text-4xl font-bold text-slate-900">
              {totalComplaints}
            </p>
            <p className="mt-2 text-lg">📋 மொத்த பதிவுகள்</p>
          </div>
        </div>

        {/* Search and status filter */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔎 பதிவு எண் / பெயர் / செல் மூலம் தேடுக..."
              className="rounded-xl border border-[#dfcdb6] bg-[#fffaf2] px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-[#dfcdb6] bg-[#fffaf2] px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="All">அனைத்து நிலைகள்</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="py-10 text-center text-slate-600">
            புகார்கள் ஏற்றப்படுகின்றன...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-slate-200 text-slate-700">
                <tr>
                  <th className="px-4 py-4">#</th>
                  <th className="px-4 py-4">பதிவு எண்</th>
                  <th className="px-4 py-4">பெயர்</th>
                  <th className="px-4 py-4">செல்</th>
                  <th className="px-4 py-4">தொகுதி</th>
                  <th className="px-4 py-4">வகை</th>
                  <th className="px-4 py-4">நிலை</th>
                  <th className="px-4 py-4">செயல்கள்</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint, index) => (
                  <tr
                    key={complaint.id}
                    className="border-t border-[#eadbc8] hover:bg-[#fffaf2]"
                  >
                    <td className="px-4 py-4">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {complaint.complaint_id}
                    </td>

                    <td className="px-4 py-4">
                      {complaint.name}
                    </td>

                    <td className="px-4 py-4">
                      {complaint.mobile}
                    </td>

                    <td className="px-4 py-4">
                      {complaint.constituency}
                    </td>

                    <td className="px-4 py-4">
                      {complaint.category}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={complaint.status}
                        onChange={(event) =>
                          updateStatus(
                            complaint.id,
                            event.target.value
                          )
                        }
                        className="rounded-full border border-slate-300 px-3 py-2"
                      >
                        {statusOptions.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          setSelectedComplaint(complaint)
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredComplaints.length === 0 && (
              <p className="p-8 text-center text-slate-500">
                புகார்கள் எதுவும் இல்லை.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Complaint details modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                Complaint Details
              </h2>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-3xl text-slate-500 hover:text-slate-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Complaint ID:</strong>{" "}
                {selectedComplaint.complaint_id}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  selectedComplaint.created_at
                ).toLocaleString("en-IN")}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {selectedComplaint.name}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {selectedComplaint.mobile}
              </p>

              <p>
                <strong>District:</strong>{" "}
                {selectedComplaint.district}
              </p>

              <p>
                <strong>Constituency:</strong>{" "}
                {selectedComplaint.constituency}
              </p>

              <p>
                <strong>Area:</strong>{" "}
                {selectedComplaint.area}
              </p>

              <p>
                <strong>Street:</strong>{" "}
                {selectedComplaint.street}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {selectedComplaint.category}
              </p>

              <div>
                <strong>Description:</strong>

                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-100 p-3">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedComplaint(null)}
              className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}