import { db } from "@/db";
import { sql } from "drizzle-orm";
import { FileText, Download, Mail, Phone, Calendar } from "lucide-react";

export default async function AdminApplicantsPage() {
  let applicants: any[] = [];
  try {
    const result = await db.execute(
      sql`SELECT * FROM job_applications ORDER BY created_at DESC`
    );
    applicants = Array.isArray(result) ? result : (result.rows || []);
  } catch (error) {
    console.error("Error fetching job applications:", error);
  }

  return (
    <div className="min-h-screen bg-ink text-ivory p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-ivory/10 pb-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-light text-ivory">Career Applicants</h1>
            <p className="text-xs text-ivory/60 mt-1 uppercase tracking-widest">Masscorn Paradise Beach Resort Portal</p>
          </div>
          <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl border border-gold/20 text-xs font-semibold">
            Total Applicants: {applicants.length}
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-20 bg-ink-deep rounded-2xl border border-ivory/10">
            <FileText size={48} className="mx-auto text-ivory/30 mb-4" />
            <h3 className="font-display text-xl text-ivory">No applications found</h3>
            <p className="text-xs text-ivory/50 mt-1">Applications submitted from the careers page will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applicants.map((app: any, idx: number) => {
              const fullName = app.full_name || app.fullName || "Applicant";
              const email = app.email || "N/A";
              const phone = app.phone || "N/A";
              const position = app.position || "General Application";
              const rawResume = app.resume_url || app.resumeUrl || app.resume || app.file;
              const dateVal = app.created_at || app.createdAt;

              let resumeHref = "#";
              if (typeof rawResume === "string") {
                if (rawResume.startsWith("http") || rawResume.startsWith("/")) {
                  resumeHref = rawResume;
                } else {
                  resumeHref = `data:application/pdf;base64,${rawResume}`;
                }
              }

              return (
                <div key={app.id || idx} className="bg-ink-deep p-6 rounded-2xl border border-ivory/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gold/30 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-display font-bold">
                        {fullName[0]}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-ivory">{fullName}</h3>
                        <p className="text-[11px] text-gold uppercase tracking-widest">{position}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-ivory/70 pt-2">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-gold" /> {email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={13} className="text-gold" /> {phone}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gold" /> {dateVal ? new Date(dateVal).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {resumeHref !== "#" ? (
                      <a 
                        href={resumeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`${fullName.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`}
                        className="px-5 py-2.5 bg-gold hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,241,89,0.2)]"
                      >
                        <Download size={14} /> Download Resume
                      </a>
                    ) : (
                      <span className="text-xs text-ivory/40 italic">No file attached</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}