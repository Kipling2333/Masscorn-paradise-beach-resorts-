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
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Rooms");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
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

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

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

      setMessage(data.message || "Image uploaded successfully!");
      setTitle("");
      setFile(null);
      fetchImages();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F4E9] text-slate-900 pt-36 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Upload Form Box */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Gallery Image</h1>

          <form onSubmit={handleUpload} className="space-y-5">
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

            {message && <p className="text-sm text-emerald-600 font-semibold mt-2">{message}</p>}
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
                  <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col">
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
    </div>
  );
}