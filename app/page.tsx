
"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Complaint = {
  name: string;
  mobile: string;
  district: string;
  constituency: string;
  area: string;
  street: string;
  category: string;
  description: string;
  fileName: string;
  complaintId: string;
  date: string;
};

const newsItems = [
  {
    id: 1,
    category: "மாவட்ட செய்தி",
    title: "தூத்துக்குடி மாவட்ட மக்கள் நலன் சார்ந்த செய்திகள்",
    description:
      "மாவட்டத்தின் முக்கிய நிகழ்வுகள், மக்கள் பிரச்சினைகள் மற்றும் சமூக நலன் சார்ந்த புதுப்பிப்புகள்.",
    date: "செப்டம்பர் 15, 2026",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    category: "மக்கள் நலம்",
    title: "மக்கள் பிரச்சினைகளைப் பதிவு செய்ய புதிய வசதி",
    description:
      "உங்கள் பகுதியில் உள்ள குடிநீர், சாலை, மின்சாரம் மற்றும் பிற பிரச்சினைகளைப் பதிவு செய்யுங்கள்.",
    date: "செப்டம்பர் 15, 2026",
    image:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    category: "சமூக செய்தி",
    title: "குருதிக்கொடை மற்றும் சமூக சேவை",
    description:
      "சமூக நலப் பணிகள் மற்றும் குருதிக்கொடை தொடர்பான அறிவிப்புகள்.",
    date: "செப்டம்பர் 14, 2026",
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=900&q=80",
  },
];

const complaintCategories = [
  "குடிநீர் பிரச்சினை",
  "சாலை பிரச்சினை",
  "மின்சாரப் பிரச்சினை",
  "கழிவுநீர் பிரச்சினை",
  "குப்பை அகற்றுதல்",
  "தெருவிளக்கு பிரச்சினை",
  "அரசு சேவை தொடர்பான பிரச்சினை",
  "மற்றவை",
];

const constituencies = [
  "தூத்துக்குடி",
  "திருச்செந்தூர்",
  "ஸ்ரீவைகுண்டம்",
  "ஓட்டப்பிடாரம்",
  "கோவில்பட்டி",
  "விளாத்திகுளம்",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("news");
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    district: "தூத்துக்குடி",
    constituency: "",
    area: "",
    street: "",
    category: "",
    description: "",
  });

  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("JPG, PNG, WEBP அல்லது PDF கோப்புகளை மட்டும் தேர்வு செய்யவும்.");
      setFileName("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("கோப்பின் அளவு 5 MB-க்கு குறைவாக இருக்க வேண்டும்.");
      setFileName("");
      return;
    }

    setError("");
    setFileName(file.name);
  }

  function generateComplaintId() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `NTK-TUTY-${randomNumber}`;
  }

  
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  if (!/^[0-9]{10}$/.test(form.mobile)) {
    setError("சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.");
    return;
  }

  if (form.description.trim().length < 10) {
    setError("பிரச்சினையை குறைந்தது 10 எழுத்துகளில் விளக்கவும்.");
    return;
  }

  const { error: databaseError } = await supabase
    .from("complaints")
    .insert({
      name: form.name.trim(),
      mobile: form.mobile,
      district: form.district,
      constituency: form.constituency,
      area: form.area.trim(),
      street: form.street.trim(),
      category: form.category,
      description: form.description.trim(),
      attachment_name: fileName || null,
    });
   
  if (databaseError) {
    console.error("Complaint submission error:", databaseError);
    setError(
      "புகாரைப் பதிவு செய்ய முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
    );
    return;
  }

  const newComplaint: Complaint = {
    ...form,
    description: form.description.trim(),
    fileName,
    complaintId: data.complaint_id,
    date: new Date(data.created_at).toLocaleDateString("ta-IN"),
  };

  setComplaint(newComplaint);
}


  function resetComplaintForm() {
    setForm({
      name: "",
      mobile: "",
      district: "தூத்துக்குடி",
      constituency: "",
      area: "",
      street: "",
      category: "",
      description: "",
    });

    setFileName("");
    setError("");
    setComplaint(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center">
                <img
                  src="/ntk-logo.png"
                  alt="NTK Thoothukudi Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  மக்கள் குரல்
                </h1>
                <p className="text-sm text-slate-300">
                  நாம் தமிழர் கட்சி • தூத்துக்குடி மாவட்டம்
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-300">
              மக்களுக்காக • மக்கள் குரலாக
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setActiveTab("news")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === "news"
                  ? "bg-yellow-400 text-slate-950"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              📰 சமீபத்திய செய்திகள்
            </button>

            <button
              onClick={() => setActiveTab("complaints")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === "complaints"
                  ? "bg-yellow-400 text-slate-950"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              📝 மக்கள் புகார்
            </button>
            
            <Link
              href="/track"
               className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-900 hover:bg-yellow-300"
                >
                புகார் நிலையை அறிய
            </Link>

            <button
              onClick={() => setActiveTab("blood")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === "blood"
                  ? "bg-yellow-400 text-slate-950"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              🩸 குருதிக்கொடை
            </button>
          </div>
        </nav>
      </header>

      {/* Announcement */}
      <div className="bg-yellow-400 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm sm:px-6 lg:px-8">
          <span className="font-bold">முக்கிய அறிவிப்பு: </span>
          மக்கள் பிரச்சினைகளைப் பதிவு செய்யும் வசதி.
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* News Tab */}
        {activeTab === "news" && (
          <>
            <section className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-10">
                <p className="mb-3 text-sm font-semibold text-yellow-400">
                  தூத்துக்குடி மாவட்டம்
                </p>

                <h2 className="text-3xl font-black leading-tight sm:text-5xl">
                  மக்களின் குரல்
                  <br />
                  மக்களின் உரிமை
                </h2>

                <p className="mt-5 max-w-xl text-slate-300">
                  மாவட்ட செய்திகளை அறிந்து கொள்ளுங்கள். உங்கள் பகுதியில்
                  உள்ள பிரச்சினைகளைப் பதிவு செய்யுங்கள்.
                </p>

                <button
                  onClick={() => setActiveTab("complaints")}
                  className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 hover:bg-yellow-300"
                >
                  உங்கள் புகாரைப் பதிவு செய்யுங்கள் →
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <img
                  src={newsItems[0].image}
                  alt="News illustration"
                  className="h-64 w-full object-cover lg:h-full"
                />
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black sm:text-3xl">
                  சமீபத்திய செய்திகள்
                </h2>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  LATEST
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newsItems.map((news) => (
                  <article
                    key={news.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-5">
                      <span className="text-xs font-bold text-red-600">
                        {news.category}
                      </span>

                      <h3 className="mt-2 text-xl font-bold leading-snug">
                        {news.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {news.description}
                      </p>

                      <p className="mt-4 text-xs text-slate-400">
                        {news.date}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Complaint Tab */}
        {activeTab === "complaints" && (
          <section className="mx-auto max-w-3xl">
            {!complaint ? (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10"
              >
                <div className="mb-8">
                  <p className="text-sm font-bold text-red-600">
                    NTK THOOTHUKUDI
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    மக்கள் புகார் பதிவு
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    உங்கள் பகுதியில் உள்ள பிரச்சினையைத் தெளிவாகப் பதிவு
                    செய்யுங்கள். தேவையான தகவல்களை மட்டும் வழங்கவும்.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      உங்கள் பெயர் *
                    </label>

                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="உங்கள் முழுப் பெயர்"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-semibold"
                    >
                      மொபைல் எண் *
                    </label>

                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      value={form.mobile}
                      onChange={(event) =>
                        updateField(
                          "mobile",
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="10 இலக்க மொபைல் எண்"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="district"
                      className="mb-2 block text-sm font-semibold"
                    >
                      மாவட்டம் *
                    </label>

                    <input
                      id="district"
                      type="text"
                      value={form.district}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="constituency"
                      className="mb-2 block text-sm font-semibold"
                    >
                      சட்டமன்றத் தொகுதி *
                    </label>

                    <select
                      id="constituency"
                      required
                      value={form.constituency}
                      onChange={(event) =>
                        updateField("constituency", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    >
                      <option value="">தொகுதியைத் தேர்வு செய்யவும்</option>

                      {constituencies.map((constituency) => (
                        <option key={constituency} value={constituency}>
                          {constituency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="area"
                        className="mb-2 block text-sm font-semibold"
                      >
                        ஊர் / பகுதி *
                      </label>

                      <input
                        id="area"
                        type="text"
                        required
                        value={form.area}
                        onChange={(event) =>
                          updateField("area", event.target.value)
                        }
                        placeholder="ஊர் அல்லது பகுதி"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="street"
                        className="mb-2 block text-sm font-semibold"
                      >
                        தெரு / வார்டு *
                      </label>

                      <input
                        id="street"
                        type="text"
                        required
                        value={form.street}
                        onChange={(event) =>
                          updateField("street", event.target.value)
                        }
                        placeholder="தெரு அல்லது வார்டு"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold"
                    >
                      பிரச்சினை வகை *
                    </label>

                    <select
                      id="category"
                      required
                      value={form.category}
                      onChange={(event) =>
                        updateField("category", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    >
                      <option value="">பிரச்சினை வகையைத் தேர்வு செய்யவும்</option>

                      {complaintCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold"
                    >
                      பிரச்சினை விவரம் *
                    </label>

                    <textarea
                      id="description"
                      required
                      rows={5}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="உதாரணம்: எங்கள் பகுதியில் கடந்த 10 நாட்களாக குடிநீர் வரவில்லை..."
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      குறைந்தது 10 எழுத்துகள் எழுதவும்.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="attachment"
                      className="mb-2 block text-sm font-semibold"
                    >
                      புகைப்படம் / ஆவணம்
                    </label>

                    <input
                      id="attachment"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG, WEBP அல்லது PDF • அதிகபட்சம் 5 MB
                    </p>

                    {fileName && (
                      <p className="mt-2 text-sm text-green-700">
                        தேர்ந்தெடுக்கப்பட்ட கோப்பு: {fileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-yellow-50 p-4 text-xs leading-5 text-yellow-900">
                  உங்கள் தகவல்கள் சரிபார்ப்பிற்காகப் பயன்படுத்தப்படும். இந்த
                  ஆரம்பப் பதிப்பில் தரவு server-ல் சேமிக்கப்படாது.
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  புகாரைப் பதிவு செய்யவும் →
                </button>
              </form>
            ) : (
              <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✓
                </div>

                <h2 className="mt-5 text-3xl font-black text-green-700">
                  புகார் பதிவு செய்யப்பட்டது!
                </h2>

                <p className="mt-3 text-slate-600">
                  உங்கள் புகாருக்கான Complaint ID உருவாக்கப்பட்டுள்ளது.
                </p>

                <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
                  <p className="text-sm text-slate-300">உங்கள் Complaint ID</p>

                  <p className="mt-2 break-all text-2xl font-black tracking-wide text-yellow-400">
                    {complaint.complaintId}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    இந்த எண்ணை பாதுகாப்பாக வைத்துக்கொள்ளவும்.
                  </p>
                </div>

                <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-left text-sm">
                  <p>
                    <strong>பெயர்:</strong> {complaint.name}
                  </p>
                  <p>
                    <strong>பகுதி:</strong> {complaint.area},{" "}
                    {complaint.street}
                  </p>
                  <p>
                    <strong>தொகுதி:</strong> {complaint.constituency}
                  </p>
                  <p>
                    <strong>பிரச்சினை வகை:</strong> {complaint.category}
                  </p>
                  <p>
                    <strong>விவரம்:</strong> {complaint.description}
                  </p>
                  <p>
                    <strong>பதிவு தேதி:</strong> {complaint.date}
                  </p>
                </div>

                <div className="mt-6 rounded-xl bg-orange-50 p-4 text-left text-sm leading-6 text-orange-900">
                  <strong>முக்கிய குறிப்பு:</strong> இது தற்போது local demo
                  மட்டுமே. இந்தப் புகார் உண்மையான server database-ல்
                  சேமிக்கப்படவில்லை. அடுத்த கட்டத்தில் admin dashboard மற்றும்
                  database இணைக்கப்படும்.
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={resetComplaintForm}
                    className="flex-1 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 hover:bg-yellow-300"
                  >
                    புதிய புகார் பதிவு
                  </button>

                  <button
                    onClick={() => {
                      setComplaint(null);
                      setActiveTab("news");
                    }}
                    className="flex-1 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800"
                  >
                    முகப்புக்குச் செல்லவும்
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Blood Tab */}
        {activeTab === "blood" && (
          <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <h2 className="text-3xl font-black">🩸 குருதிக்கொடை</h2>

            <p className="mt-3 text-slate-600">
              குருதி தேவை மற்றும் donor பதிவு வசதிகள் அடுத்த கட்டத்தில்
              database உடன் இணைக்கப்படும்.
            </p>

            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-900">
              Blood management module விரைவில் உருவாக்கப்படும்.
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-slate-950 px-4 py-8 text-center text-sm text-slate-400">
        <p className="font-semibold text-white">மக்கள் குரல்</p>
        <p className="mt-2">நாம் தமிழர் கட்சி • தூத்துக்குடி மாவட்டம்</p>
        <p className="mt-3">
          © {new Date().getFullYear()} NTK Thoothukudi. All rights reserved.
        </p>
      </footer>
    </main>
  );
}