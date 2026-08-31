import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Users, Mail, Phone, Calendar, Shield } from "lucide-react";

export default async function AdminUsersPage() {
  let siteUsers: any[] = [];
  try {
    const result = await db.execute(
      sql`SELECT * FROM users ORDER BY created_at DESC`
    );
    siteUsers = Array.isArray(result) ? result : (result.rows || []);
  } catch (error) {
    console.error("Error fetching website users:", error);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-light text-white flex items-center gap-3">
              <Users className="text-amber-400" /> Website Users
            </h1>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Registered Portal Accounts</p>
          </div>
          <div className="bg-amber-400/10 text-amber-400 px-4 py-2 rounded-xl border border-amber-400/20 text-xs font-semibold">
            Total Users: {siteUsers.length}
          </div>
        </div>

        {siteUsers.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900 rounded-2xl border border-neutral-800">
            <Users size={48} className="mx-auto text-neutral-600 mb-4" />
            <h3 className="text-xl text-white">No registered users found</h3>
            <p className="text-xs text-neutral-500 mt-1">Users who sign up or sign in on your website will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {siteUsers.map((user: any, idx: number) => {
              const name = user.name || user.full_name || "User";
              const email = user.email || "N/A";
              const phone = user.phone || "N/A";
              const dateVal = user.created_at || user.createdAt;
              const role = user.role || user.status || "Member";

              return (
                <div key={user.id || idx} className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400/30 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                        {name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">{name}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-neutral-800 text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider mt-0.5">
                          <Shield size={10} /> {role}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 pt-1">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-amber-400" /> {email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={13} className="text-amber-400" /> {phone}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-amber-400" /> {dateVal ? new Date(dateVal).toLocaleDateString() : "Recent"}</span>
                    </div>
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