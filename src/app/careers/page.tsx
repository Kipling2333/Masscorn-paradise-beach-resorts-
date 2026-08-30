"use client";

import { useState } from "react";

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    department: "Hospitality & Front Office",
    position: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setStatusMessage({ type: "error", text: "File size exceeds 10MB limit." });
        return;
      }
      setResumeFile(selectedFile);
      setStatusMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    if (!resumeFile) {
      setStatusMessage({ type: "error", text: "Please upload your CV or resume (PDF/Doc)." });
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("country", formData.country);
      submitData.append("department", formData.department);
      submitData.append("position", formData.position);
      submitData.append("coverLetter", formData.coverLetter);
      submitData.append("resume", resumeFile);

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setStatusMessage({
        type: "success",
        text: "Your application and CV have been submitted successfully! Our HRM team will review your details.",
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        department: "Hospitality & Front Office",
        position: "",
        coverLetter: "",
      });
      setResumeFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage({ type: "error", text: err.message });
      } else {
        setStatusMessage({ type: "error", text: "An unexpected error occurred." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F4E9] text-slate-900 pt-36 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
            Global Careers & Opportunities
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Join Our World-Class Team
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
            We are hiring talent from all around the globe. Submit your resume and application below for our Human Resources Management (HRM) team to review.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 border-b pb-4">
            Candidate Application Form
          </h2>

          {statusMessage && (
            <div
              className={`p-4 mb-6 rounded-xl font-medium text-sm border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-rose-50 border-rose-300 text-rose-800"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Phone Number (with country code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Country of Residence <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. United Kingdom, Kenya, Canada"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                >
                  <option value="Hospitality & Front Office">Hospitality & Front Office</option>
                  <option value="Culinary & Dining">Culinary & Dining</option>
                  <option value="Spa & Wellness">Spa & Wellness</option>
                  <option value="Housekeeping & Operations">Housekeeping & Operations</option>
                  <option value="Events & Marketing">Events & Marketing</option>
                  <option value="Management & Admin">Management & Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Desired Position / Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  placeholder="e.g. Head Chef, Spa Specialist, Front Desk Manager"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-800">
                Upload CV / Resume / Portfolio (PDF or DOCX) <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition cursor-pointer"
              />
              <p className="text-xs text-slate-500">Max file size: 10MB. Accepted formats: PDF, DOC, DOCX.</p>
              {resumeFile && (
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  Selected file: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                Cover Letter / Bio Intro (Optional)
              </label>
              <textarea
                name="coverLetter"
                rows={4}
                placeholder="Tell us a bit about your experience, background, and why you'd like to join our resort..."
                value={formData.coverLetter}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-amber-700 disabled:opacity-50 transition transform active:scale-[0.99]"
            >
              {submitting ? "Sending Application & Uploading CV..." : "Submit Global Application"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}