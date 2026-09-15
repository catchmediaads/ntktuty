"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ComplaintResult = {
  complaint_id: string;
  status: string;
  created_at: string;
  category: string;
  area: string;
};

export default function TrackComplaintPage() {
  const [complaintId, setComplaintId] = useState("");
  const [result, setResult] = useState<ComplaintResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setResult(null);
    setError("");

    if (!complaintId.trim()) {
      setError("தயவுசெய்து புகார் எண்ணை உள்ளிடவும்.");
      return;
    }

    setLoading(true);

    const { data, error: trackingError } = await supabase.rpc(
      "track_complaint",
      {
        p_complaint_id: complaintId.trim(),
      }
    );

    setLoading(false);

    if (trackingError) {
      console.error("Tracking error:", trackingError);
      setError("புகார் விவரங்களைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
      return;
    }

    if (!data || data.length === 0) {
      setError("இந்த புகார் எண் கிடைக்கவில்லை. புகார் எண்ணை சரிபார்க்கவும்.");
      return;
    }

    setResult(data[0] as ComplaintResult);
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <img
              src="/ntk-logo.png"
              alt="Naam Tamilar Katchi"
              className="mx-auto mb-4 h-24 w-auto"
            />

            <h1 className="text-2xl font-bold text-slate-800">
              Track Your Complaint
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              உங்கள் புகாரின் நிலையை அறிய புகார் எண்ணை உள்ளிடவும்
            </p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label
                htmlFor="complaintId"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Complaint ID / புகார் எண்
              </label>

              <input
                id="complaintId"
                type="text"
                value={complaintId}
                onChange={(event) =>
                  setComplaintId(event.target.value.toUpperCase())
                }
                placeholder="NTK-TUTY-000001"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check Complaint Status"}
            </button>
          </form>

          {result && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                Complaint Details
              </h2>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Complaint ID:</strong>{" "}
                  {result.complaint_id}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(result.created_at).toLocaleString()}
                </p>

                <p>
                  <strong>Area:</strong> {result.area}
                </p>

                <p>
                  <strong>Category:</strong> {result.category}
                </p>

                <div className="pt-2">
                  <p className="mb-2 font-semibold">Current Status</p>

                  <span
                    className={`inline-block rounded-full px-4 py-2 font-semibold ${getStatusStyle(
                      result.status
                    )}`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              ← Back to Complaint Portal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}