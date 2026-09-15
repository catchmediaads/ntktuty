
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: string;
  title_ta: string | null;
  title_en: string | null;
  content_ta: string | null;
  content_en: string | null;
  image_url: string | null;
  category: string | null;
  status: "Draft" | "Published";
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
};

const emptyForm = {
  title_ta: "",
  title_en: "",
  content_ta: "",
  content_en: "",
  image_url: "",
  category: "பொதுச் செய்தி",
  status: "Draft" as "Draft" | "Published",
  is_featured: false,
};

export default function NewsManagementPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setNews(data || []);
    }

    setLoading(false);
  }

  function updateField(field: string, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editNews(item: NewsItem) {
    setEditingId(item.id);

    setForm({
      title_ta: item.title_ta || "",
      title_en: item.title_en || "",
      content_ta: item.content_ta || "",
      content_en: item.content_en || "",
      image_url: item.image_url || "",
      category: item.category || "பொதுச் செய்தி",
      status: item.status,
      is_featured: item.is_featured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveNews(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      title_ta: form.title_ta || null,
      title_en: form.title_en || null,
      content_ta: form.content_ta || null,
      content_en: form.content_en || null,
      image_url: form.image_url || null,
      category: form.category || null,
      status: form.status,
      is_featured: form.is_featured,
      published_at:
        form.status === "Published" ? new Date().toISOString() : null,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("news")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("news").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(editingId ? "செய்தி புதுப்பிக்கப்பட்டது!" : "புதிய செய்தி சேர்க்கப்பட்டது!");
      resetForm();
      await loadNews();
    }

    setSaving(false);
  }

  async function deleteNews(id: string) {
    const confirmed = window.confirm(
      "இந்த செய்தியை நிரந்தரமாக நீக்க வேண்டுமா?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setMessage("செய்தி நீக்கப்பட்டது!");
      await loadNews();
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              📰 News Management
            </h1>
            <p className="mt-1 text-slate-600">
              செய்திகளை சேர்க்கவும், மாற்றவும், நீக்கவும்
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-lg bg-slate-900 px-4 py-2 text-center font-semibold text-white hover:bg-slate-700"
          >
            ← Admin Dashboard
          </a>
        </div>

        {message && (
          <div className="rounded-lg bg-green-100 p-3 font-medium text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-3 font-medium text-red-800">
            {error}
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            {editingId ? "✏️ செய்தியை மாற்றவும்" : "➕ புதிய செய்தி சேர்க்கவும்"}
          </h2>

          <form onSubmit={saveNews} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  தமிழ் தலைப்பு
                </label>
                <input
                  required
                  value={form.title_ta}
                  onChange={(e) => updateField("title_ta", e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="செய்தியின் தமிழ் தலைப்பு"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  English Title
                </label>
                <input
                  value={form.title_en}
                  onChange={(e) => updateField("title_en", e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="English news title"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  தமிழ் செய்தி விவரம்
                </label>
                <textarea
                  rows={6}
                  value={form.content_ta}
                  onChange={(e) => updateField("content_ta", e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="செய்தியின் முழு விவரம்"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  English Content
                </label>
                <textarea
                  rows={6}
                  value={form.content_en}
                  onChange={(e) => updateField("content_en", e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Full English news content"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full rounded-lg border p-3"
                >
                  <option>பொதுச் செய்தி</option>
                  <option>கட்சி நிகழ்வு</option>
                  <option>மக்கள் பிரச்சினை</option>
                  <option>அறிவிப்பு</option>
                  <option>Press Release</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as "Draft" | "Published")
                  }
                  className="w-full rounded-lg border p-3"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Image URL
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
                className="h-5 w-5"
              />
              ⭐ Featured News
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update News"
                  : "Save News"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-slate-300 px-5 py-3 font-bold text-slate-900 hover:bg-slate-400"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              📋 News List
            </h2>

            <button
              onClick={loadNews}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-600">Loading news...</p>
          ) : news.length === 0 ? (
            <p className="text-slate-600">இதுவரை செய்திகள் இல்லை.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-left">
                    <th className="border p-3">Title</th>
                    <th className="border p-3">Category</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Featured</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border p-3">
                        <div className="font-bold text-slate-900">
                          {item.title_ta || item.title_en || "Untitled"}
                        </div>
                        {item.title_en && (
                          <div className="text-sm text-slate-500">
                            {item.title_en}
                          </div>
                        )}
                      </td>

                      <td className="border p-3">
                        {item.category || "-"}
                      </td>

                      <td className="border p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            item.status === "Published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="border p-3">
                        {item.is_featured ? "⭐ Yes" : "No"}
                      </td>

                      <td className="border p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editNews(item)}
                            className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteNews(item.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}