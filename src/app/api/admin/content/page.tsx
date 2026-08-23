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

      setMessage("Image uploaded successfully!");
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
    <div className="min-h-screen bg-slate-100 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Upload Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Gallery Image</h1>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border border-slate-300 p-2 rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ocean View Sunset"
                className="w-full border border-slate-300 p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg bg-white"
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
              className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition"
            >
              {uploading ? "Uploading..." : "Upload to Gallery"}
            </button>

            {message && <p className="text-sm text-emerald-600 font-medium mt-2">{message}</p>}
          </form>
        </div>

        {/* Live Gallery Items Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Uploaded Gallery Items ({images.length})
            </h2>
            <button 
              onClick={fetchImages}
              type="button"
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Refresh List
            </button>
          </div>

          {images.length === 0 ? (
            <p className="text-slate-500 text-sm">No uploaded images found in database.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((item) => {
                const src = item.imageUrl || item.image_url;
                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-sm flex flex-col">
                    {src ? (
                      <img
                        src={src}
                        alt={item.title || "Gallery Item"}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        Missing Image URL
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item.title || "Untitled Image"}
                      </p>
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-2">
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