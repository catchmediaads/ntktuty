
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

type PetitionAuthority = {
  designation: string;
  department: string;
  reason: string;
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

function getPetitionAuthority(
  complaint: Complaint
): PetitionAuthority {
  const text = `
    ${complaint.category}
    ${complaint.description}
    ${complaint.area}
    ${complaint.street}
  `.toLowerCase();

  if (
    text.includes("காவல்") ||
    text.includes("திருட்டு") ||
    text.includes("குற்றம்") ||
    text.includes("மிரட்டல்") ||
    text.includes("வன்முறை") ||
    text.includes("police") ||
    text.includes("crime") ||
    text.includes("theft")
  ) {
    return {
      designation: "சம்பந்தப்பட்ட காவல் நிலைய ஆய்வாளர்",
      department: "காவல் துறை",
      reason:
        "புகார் காவல் துறை விசாரணை தேவைப்படக்கூடியதாக இருப்பதால்.",
    };
  }

  if (
    text.includes("பட்டா") ||
    text.includes("சிட்டா") ||
    text.includes("நிலம்") ||
    text.includes("ஆக்கிரமிப்பு") ||
    text.includes("வருவாய்") ||
    text.includes("patta") ||
    text.includes("land")
  ) {
    return {
      designation: "சம்பந்தப்பட்ட வட்டாட்சியர்",
      department: "வருவாய் துறை",
      reason:
        "புகார் நிலம் அல்லது வருவாய் நிர்வாகம் தொடர்புடையதாக இருப்பதால்.",
    };
  }

  if (
    text.includes("உணவு") ||
    text.includes("கெட்டுப்போன") ||
    text.includes("கலப்படம்") ||
    text.includes("food") ||
    text.includes("adulteration")
  ) {
    return {
      designation: "மாவட்ட உணவு பாதுகாப்பு நியமன அலுவலர்",
      department: "உணவு பாதுகாப்புத் துறை",
      reason:
        "புகார் உணவின் தரம் அல்லது உணவு பாதுகாப்பு தொடர்புடையதாக இருப்பதால்.",
    };
  }

  if (
    text.includes("வாகனம்") ||
    text.includes("ஓட்டுநர்") ||
    text.includes("உரிமம்") ||
    text.includes("போக்குவரத்து") ||
    text.includes("rto") ||
    text.includes("vehicle") ||
    text.includes("transport")
  ) {
    return {
      designation: "சம்பந்தப்பட்ட வட்டாரப் போக்குவரத்து அலுவலர்",
      department: "போக்குவரத்துத் துறை",
      reason:
        "புகார் வாகனம் அல்லது போக்குவரத்து நிர்வாகம் தொடர்புடையதாக இருப்பதால்.",
    };
  }

  if (
    text.includes("குப்பை") ||
    text.includes("சாலை") ||
    text.includes("தெருவிளக்கு") ||
    text.includes("கழிவுநீர்") ||
    text.includes("வடிகால்") ||
    text.includes("குடிநீர்") ||
    text.includes("மாநகராட்சி") ||
    text.includes("corporation")
  ) {
    return {
      designation:
        "தூத்துக்குடி மாநகராட்சி ஆணையர் / சம்பந்தப்பட்ட பொறியியல் அலுவலர்",
      department: "தூத்துக்குடி மாநகராட்சி",
      reason:
        "புகார் மாநகராட்சி அடிப்படை வசதி அல்லது பொது சுகாதாரம் தொடர்புடையதாக இருப்பதால்.",
    };
  }

  return {
    designation: "மாவட்ட ஆட்சியர்",
    department: "தூத்துக்குடி மாவட்ட ஆட்சியர் அலுவலகம்",
    reason:
      "புகாரின் துறை தெளிவாக அடையாளம் காணப்படாததால், மாவட்ட நிர்வாகத்தின் கவனத்திற்கு அனுப்பப்படுகிறது.",
  };
}

function buildPetitionText(complaint: Complaint): string {
  const authority = getPetitionAuthority(complaint);

  const date = new Date(
    complaint.created_at
  ).toLocaleDateString("ta-IN");

  return `பெறுநர்:

${authority.designation}
${authority.department}
தூத்துக்குடி மாவட்டம்.


மதிப்பிற்குரிய ஐயா / அம்மா,

பொருள்: ${complaint.category} தொடர்பாக உரிய நடவடிக்கை கோரி மனு — சமர்ப்பிப்பு.

மனுதாரர் விவரம்:

பெயர்: ${complaint.name}
கைபேசி எண்: ${complaint.mobile}
மாவட்டம்: ${complaint.district}
சட்டமன்றத் தொகுதி: ${complaint.constituency}
பகுதி: ${complaint.area}
தெரு / வார்டு: ${complaint.street}

புகார் ID: ${complaint.complaint_id}
புகார் பதிவு தேதி: ${date}

புகாரின் விவரம்:

${complaint.description}

மேற்கண்ட புகார் ${authority.department} சார்ந்ததாக இருப்பதாக முதற்கட்டமாகக் கருதப்படுகிறது.

எனவே, மேற்கண்ட புகாரைத் தங்களது அலுவலகம் பரிசீலித்து, சம்பந்தப்பட்ட அலுவலர்களுக்கு உரிய அறிவுறுத்தல் வழங்கி, தேவையான தள ஆய்வு / விசாரணை மேற்கொண்டு, சட்டப்படி உரிய நடவடிக்கை எடுக்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்.

மேலும், மேற்கொள்ளப்பட்ட நடவடிக்கை குறித்த தகவலை மனுதாரருக்கு தெரிவிக்குமாறும் கேட்டுக்கொள்கிறேன்.

நன்றி.


இப்படிக்கு,

${complaint.name}
கைபேசி எண்: ${complaint.mobile}

இடம்: ${complaint.area}
தேதி: ${date}


இணைப்பு:
1. புகார் விவரங்கள்
2. தொடர்புடைய புகைப்படம் / ஆவணம் — இருப்பின்

குறிப்பு:
இந்த மனுவின் பெறுநர் மற்றும் துறை விவரங்கள் தானியங்கி முதற்கட்ட வகைப்படுத்தலின் அடிப்படையில் உருவாக்கப்பட்டவை. அனுப்புவதற்கு முன் உரிய அதிகாரி மற்றும் jurisdiction-ஐ சரிபார்க்கவும்.`;
}

function printPetition(complaint: Complaint) {
  const petitionText = buildPetitionText(complaint);

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=900"
  );

  if (!printWindow) {
    alert(
      "Print window திறக்கப்படவில்லை. Browser popup permission-ஐ சரிபார்க்கவும்."
    );
    return;
  }

  const safeText = petitionText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  printWindow.document.write(`
    <!doctype html>
    <html lang="ta">
      <head>
        <meta charset="UTF-8" />
        <title>மனு - ${complaint.complaint_id}</title>

        <style>
          body {
            font-family: "Noto Sans Tamil", "Latha", Arial, sans-serif;
            padding: 40px;
            line-height: 1.9;
            color: #111827;
            white-space: pre-wrap;
            font-size: 16px;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>${safeText}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function AdminDashboard() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [petitionComplaint, setPetitionComplaint] =
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
      complaint.district,
      complaint.constituency,
      complaint.area,
      complaint.street,
      complaint.category,
      complaint.description,
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

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Pending" ||
      complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const rejectedComplaints = complaints.filter(
    (complaint) => complaint.status === "Rejected"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-red-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Complaint Admin Dashboard
            </h1>

            <p className="text-sm text-red-100">
              Naam Tamilar Katchi — Thoothukudi District
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
        <div className="mx-auto max-w-7xl">
          {
            
<nav className="mt-4 flex flex-wrap gap-2">
  <a
    href="/admin"
    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700"
  >
    Dashboard
  </a>

  <a
    href="/admin/news"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    📰 News Management
  </a>

  <a
    href="/admin/flash-news"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    🚨 Flash News
  </a>

  <a
    href="/admin/breaking-news"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    🔴 Breaking News
  </a>

  <a
    href="/admin/homepage"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    🏠 Homepage Editor
  </a>

  <a
    href="/admin/media"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    🖼️ Image Manager
  </a>

  <a
    href="/admin/events"
    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
  >
    📅 Events
  </a>
</nav>
          }
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Total Complaints
            </p>

            <p className="text-3xl font-bold text-slate-800">
              {totalComplaints}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Pending / In Progress
            </p>

            <p className="text-3xl font-bold text-orange-600">
              {pendingComplaints}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Resolved
            </p>

            <p className="text-3xl font-bold text-green-600">
              {resolvedComplaints}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <p className="text-3xl font-bold text-red-600">
              {rejectedComplaints}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search complaint ID, name, mobile, area..."
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            />

            <select
              value={constituencyFilter}
              onChange={(event) =>
                setConstituencyFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            >
              {constituencyOptions.map((constituency) => (
                <option
                  key={constituency}
                  value={constituency}
                >
                  {constituency}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Statuses</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-600">
            Loading complaints...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-200 text-slate-700">
                <tr>
                  <th className="px-4 py-3">
                    Complaint ID
                  </th>

                  <th className="px-4 py-3">
                    Name
                  </th>

                  <th className="px-4 py-3">
                    Mobile
                  </th>

                  <th className="px-4 py-3">
                    Constituency
                  </th>

                  <th className="px-4 py-3">
                    Area
                  </th>

                  <th className="px-4 py-3">
                    Category
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-t border-slate-200"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {complaint.complaint_id}
                    </td>

                    <td className="px-4 py-3">
                      {complaint.name}
                    </td>

                    <td className="px-4 py-3">
                      {complaint.mobile}
                    </td>

                    <td className="px-4 py-3">
                      {complaint.constituency}
                    </td>

                    <td className="px-4 py-3">
                      {complaint.area}
                    </td>

                    <td className="px-4 py-3">
                      {complaint.category}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={complaint.status}
                        onChange={(event) =>
                          updateStatus(
                            complaint.id,
                            event.target.value
                          )
                        }
                        className="rounded-md border border-slate-300 px-2 py-1"
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

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            setSelectedComplaint(complaint)
                          }
                          className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            setPetitionComplaint(complaint)
                          }
                          className="rounded-md bg-yellow-400 px-3 py-2 font-semibold text-slate-900 hover:bg-yellow-300"
                        >
                          மனுவாக மாற்று
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredComplaints.length === 0 && (
              <p className="p-6 text-center text-slate-500">
                No complaints found.
              </p>
            )}
          </div>
        )}
      </section>

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800">
                Complaint Details
              </h2>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-2xl text-slate-500 hover:text-slate-800"
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
                ).toLocaleString()}
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

      {petitionComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  மனு Preview
                </h2>

                <p className="text-sm text-slate-500">
                  {petitionComplaint.complaint_id}
                </p>
              </div>

              <button
                onClick={() => setPetitionComplaint(null)}
                className="text-2xl text-slate-500 hover:text-slate-900"
                aria-label="Close petition preview"
              >
                ×
              </button>
            </div>

            <div className="mb-5 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <strong>முக்கியம்:</strong>{" "}
              இது தானியங்கி முறையில் உருவாக்கப்பட்ட முதற்கட்ட மனு.
              அனுப்புவதற்கு முன் சம்பந்தப்பட்ட அதிகாரி மற்றும்
              jurisdiction-ஐ Admin சரிபார்க்க வேண்டும்.
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-2 font-semibold text-slate-700">
                பரிந்துரைக்கப்பட்ட பெறுநர்
              </p>

              <p className="text-lg font-bold text-red-700">
                {
                  getPetitionAuthority(
                    petitionComplaint
                  ).designation
                }
              </p>

              <p className="text-sm text-slate-600">
                {
                  getPetitionAuthority(
                    petitionComplaint
                  ).department
                }
              </p>

              <p className="mt-2 text-sm text-slate-600">
                காரணம்:{" "}
                {
                  getPetitionAuthority(
                    petitionComplaint
                  ).reason
                }
              </p>
            </div>

            <pre className="whitespace-pre-wrap rounded-xl bg-white p-5 text-sm leading-8 text-slate-800 shadow-inner ring-1 ring-slate-200">
              {buildPetitionText(petitionComplaint)}
            </pre>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  printPetition(petitionComplaint)
                }
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Print / PDF
              </button>

              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(
                      buildPetitionText(petitionComplaint)
                    )
                    .then(() => {
                      alert("மனு Copy செய்யப்பட்டது.");
                    })
                    .catch(() => {
                      alert(
                        "Copy செய்ய முடியவில்லை. மனுவை manually select செய்து copy செய்யவும்."
                      );
                    });
                }}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                மனுவை Copy செய்
              </button>

              <button
                onClick={() => setPetitionComplaint(null)}
                className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                மூடு
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}