"use client";

import { useState } from "react";

export default function AdminContentPage() {
  // Text content state
  const [sectionKey, setSectionKey] = useState("about_us");
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [contentStatus, setContentStatus] = useState("");

  // Photo upload state
  const [file, setFile] = useState<File | null>(null);
  const [imgTitle, setImgTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [uploadStatus, setUploadStatus] = useState("");

  // Save Text Content
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentStatus("Saving...");

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_key: sectionKey, title, body_html: bodyHtml }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setContentStatus("Content saved successfully!");
    } catch (err: any) {
      setContentStatus(`Error: ${err.message}`);
    }
  };

  // Handle Image Upload
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setUploadStatus("Please select a file first.");

    setUploadStatus("Uploading to Cloudinary...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", imgTitle);
    formData.append("category", category);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadStatus("Image uploaded successfully!");
      setFile(null);
      setImgTitle("");
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-slate-800">Masscorn Resort CMS</h1>

      {/* Section 1: Update Text Content */}
      <section className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Manage Website Content</h2>
        <form onSubmit={handleSaveContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Key</label>
            <select
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500"
            >
              <option value="about_us">About Us</option>
              <option value="hero_banner">Hero Banner</option>
              <option value="spa_welcome">Spa Welcome</option>
              <option value="dining_overview">Dining Overview</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Welcome to Masscorn Paradise Beach Resort"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (HTML or Text)</label>
            <textarea
              rows={5}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder="Enter details..."
              className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white px-4 py-2 rounded font-medium hover:bg-slate-800"
          >
            Save Section Content
          </button>
          {contentStatus && <p className="text-sm mt-2 text-slate-600">{contentStatus}</p>}
        </form>
      </section>

      {/* Section 2: Upload Gallery Images */}
      <section className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Upload Gallery Image</h2>
        <form onSubmit={handleUploadImage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image Title</label>
            <input
              type="text"
              value={imgTitle}
              onChange={(e) => setImgTitle(e.target.value)}
              placeholder="e.g. Ocean View Sunset"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500"
            >
              <option value="general">General</option>
              <option value="rooms">Rooms</option>
              <option value="dining">Dining</option>
              <option value="spa">Spa</option>
              <option value="beach">Beach & Events</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded font-medium hover:bg-amber-700"
          >
            Upload to Gallery
          </button>
          {uploadStatus && <p className="text-sm mt-2 text-slate-600">{uploadStatus}</p>}
        </form>
      </section>
    </div>
  );
}