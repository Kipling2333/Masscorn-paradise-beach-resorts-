"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  id: number | string;
  imageUrl?: string | null;
  image_url?: string | null;
  title?: string | null;
  category?: string | null;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"homepage" | "gallery">("homepage");

  // --- Homepage Editing State ---
  const [savingHome, setSavingHome] = useState(false);
  const [homeMessage, setHomeMessage] = useState("");
  const [homeContent, setHomeContent] = useState({
    heroTitle: "Masscorn Paradise Beach Resort",
    heroSubtitle: "A Sanctuary of Coastal Elegance and Unmatched Luxury",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
    aboutTitle: "Welcome to Paradise",
    aboutDescription:
      "Nestled along untouched shorelines, Masscorn Paradise Resort blends natural beauty with world-class hospitality.",
  });

  // --- Gallery State ---
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Rooms");
  const [uploading, setUploading] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSaveHomepage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingHome(true);
    setHomeMessage("");

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeContent),
      });

      if (!res.ok) throw new Error("Failed to update homepage content.");
      setHomeMessage("Homepage content saved successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setHomeMessage(err.message);
      } else {
        setHomeMessage("Save failed.");
      }
    } finally {
      setSavingHome(false);
    }
  };

  const handleUploadGallery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setGalleryMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setGalleryMessage(data.message || "Image uploaded successfully!");
      setTitle("");
      setFile(null);
      fetchImages();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGalleryMessage(err.message);
      } else {
        setGalleryMessage("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F4E9] text-slate-900 pt-36 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-300 gap-8">
          <button
            onClick={() => setActiveTab("homepage")}
            className={`pb-3 font-semibold text-lg border-b-2 transition ${
              activeTab === "homepage"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Homepage Content
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`pb-3 font-semibold text-lg border-b-2 transition ${
              activeTab === "gallery"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Gallery Manager
          </button>
        </div>

        {/* TAB 1: HOMEPAGE CONTENT MANAGER */}
        {activeTab === "homepage" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Homepage Sections</h1>

            <form onSubmit={handleSaveHomepage} className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-amber-600 mb-4 uppercase tracking-wider">Hero Section</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Main Headline Title</label>
                    <input
                      type="text"
                      value={homeContent.heroTitle}
                      onChange={(e) => setHomeContent({ ...homeContent, heroTitle: e.target.value })}
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subtitle Tagline</label>
                    <input
                      type="text"
                      value={homeContent.heroSubtitle}
                      onChange={(e) => setHomeContent({ ...homeContent, heroSubtitle: e.target.value })}
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Background Image URL</label>
                    <input
                      type="text"
                      value={homeContent.heroImage}
                      onChange={(e) => setHomeContent({ ...homeContent, heroImage: e.target.value })}
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm bg-slate-50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-amber-600 mb-4 uppercase tracking-wider">About Section</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Section Heading</label>
                    <input
                      type="text"
                      value={homeContent.aboutTitle}
                      onChange={(e) => setHomeContent({ ...homeContent, aboutTitle: e.target.value })}
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Paragraph</label>
                    <textarea
                      rows={4}
                      value={homeContent.aboutDescription}
                      onChange={(e) => setHomeContent({ ...homeContent, aboutDescription: e.target.value })}
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingHome}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
              >
                {savingHome ? "Saving Changes..." : "Save Homepage Changes"}
              </button>

              {homeMessage && <p className="text-sm text-emerald-600 font-semibold mt-2">{homeMessage}</p>}
            </form>
          </div>
        )}

        {/* TAB 2: GALLERY MANAGER */}
        {activeTab === "gallery" && (
          <div className="space-y-12">
            {/* Upload Form Box */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Gallery Image</h1>

              <form onSubmit={handleUploadGallery} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Image Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ocean View Sunset"
                    className="w-full border border-slate-300 p-3 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 text-sm"
                  >
                    <option value="Rooms">Rooms</option>
                    <option value="Dining">Dining</option>
                    <option value="Experiences">Experiences</option>
                    <option value="Spa">Spa & Wellness</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {uploading ? "Uploading..." : "Upload to Gallery"}
                </button>

                {galleryMessage && (
                  <p className="text-sm text-emerald-600 font-semibold mt-2">{galleryMessage}</p>
                )}
              </form>
            </div>

            {/* Gallery Grid Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800">
                  Current Gallery Images ({images.length})
                </h2>
                <button
                  onClick={fetchImages}
                  type="button"
                  className="text-xs text-amber-600 font-bold hover:underline uppercase tracking-wider"
                >
                  Refresh List
                </button>
              </div>

              {images.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No uploaded images found in database.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {images.map((item) => {
                    const src = item.imageUrl || item.image_url;
                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col"
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={item.title || "Gallery Item"}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            No Image Source
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {item.title || "Untitled Image"}
                          </p>
                          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-2 block">
                            {item.category || "General"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}