"use client";

import { useState, useEffect } from "react";

interface Room {
  id?: number;
  name: string;
  pricePerNight: string;
  capacity: string;
  description: string;
  imageUrl: string;
}

export default function FullAdminCMS() {
  const [activeTab, setActiveTab] = useState<
    "accommodations" | "experiences" | "dining" | "spa" | "events" | "gallery"
  >("accommodations");

  // Accommodations State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<Room>({
    name: "",
    pricePerNight: "",
    capacity: "",
    description: "",
    imageUrl: "",
  });

  // Dynamic Section Content State
  const [pageContent, setPageContent] = useState({
    diningTitle: "Exquisite Oceanfront Dining",
    diningDesc: "Savor local sea delicacies crafted by international culinary leaders.",
    spaTitle: "Holistic Wellness & Renewal",
    spaDesc: "Immerse yourself in therapeutic hydrotherapy and organic oil treatments.",
    eventsTitle: "Unforgettable Weddings & Private Events",
    eventsDesc: "Host your luxury celebrations against breathtaking ocean horizons.",
  });

  const [statusMsg, setStatusMsg] = useState("");

  const handleSavePageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("Saving changes...");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageContent),
      });
      if (res.ok) setStatusMsg("All page text updated successfully!");
    } catch {
      setStatusMsg("Failed to save content.");
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      if (res.ok) {
        setStatusMsg("New Room/Suite added successfully!");
        setNewRoom({ name: "", pricePerNight: "", capacity: "", description: "", imageUrl: "" });
      }
    } catch {
      setStatusMsg("Error creating room.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F4E9] text-slate-900 pt-44 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Tabs Matching Navbar */}
        <div className="flex flex-wrap border-b border-slate-300 gap-4 sm:gap-6">
          {(["accommodations", "dining", "spa", "events", "gallery"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-sm sm:text-base capitalize border-b-2 transition ${
                activeTab === tab
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div className="p-4 bg-amber-100 border border-amber-300 text-amber-900 font-medium rounded-lg">
            {statusMsg}
          </div>
        )}

        {/* 1. ACCOMMODATIONS MANAGEMENT */}
        {activeTab === "accommodations" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Manage Rooms & Suites</h2>
            
            <form onSubmit={handleAddRoom} className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold text-amber-600">Add New Accommodation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Room Title (e.g. Oceanfront Villa)"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="border p-3 rounded-lg text-sm w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Price per night ($)"
                  value={newRoom.pricePerNight}
                  onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                  className="border p-3 rounded-lg text-sm w-full"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Image URL (Unsplash or direct image link)"
                value={newRoom.imageUrl}
                onChange={(e) => setNewRoom({ ...newRoom, imageUrl: e.target.value })}
                className="border p-3 rounded-lg text-sm w-full"
                required
              />
              <textarea
                placeholder="Room description and amenities summary..."
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="border p-3 rounded-lg text-sm w-full"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Create Accommodation Entry
              </button>
            </form>
          </div>
        )}

        {/* 2. DINING / SPA / EVENTS CONTENT EDITORS */}
        {activeTab !== "accommodations" && activeTab !== "gallery" && (
          <form onSubmit={handleSavePageContent} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 capitalize">Edit {activeTab} Page</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Main Section Heading</label>
              <input
                type="text"
                value={
                  activeTab === "dining"
                    ? pageContent.diningTitle
                    : activeTab === "spa"
                    ? pageContent.spaTitle
                    : pageContent.eventsTitle
                }
                onChange={(e) =>
                  setPageContent({
                    ...pageContent,
                    [activeTab === "dining" ? "diningTitle" : activeTab === "spa" ? "spaTitle" : "eventsTitle"]:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Detailed Paragraph</label>
              <textarea
                rows={4}
                value={
                  activeTab === "dining"
                    ? pageContent.diningDesc
                    : activeTab === "spa"
                    ? pageContent.spaDesc
                    : pageContent.eventsDesc
                }
                onChange={(e) =>
                  setPageContent({
                    ...pageContent,
                    [activeTab === "dining" ? "diningDesc" : activeTab === "spa" ? "spaDesc" : "eventsDesc"]:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Update {activeTab} Page
            </button>
          </form>
        )}

      </div>
    </div>
  );
}