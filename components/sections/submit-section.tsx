"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SubmitSection() {
  const [formData, setFormData] = useState({
    tavernName: "",
    city: "",
    state: "OH",
    reason: "",
    submitterName: "",
    submitterEmail: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    nominationsReceived: 0,
    nominatedStopsVisited: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createClient();
      
      // Get total nominations count
      const { count: totalNominations, error: nomError } = await supabase
        .from("tavern_nominations")
        .select("*", { count: "exact", head: true });

      if (nomError) throw nomError;

      // Get count of approved/visited nominations
      const { count: approvedNominations, error: appError } = await supabase
        .from("tavern_nominations")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (appError) throw appError;

      setStats({
        nominationsReceived: totalNominations || 0,
        nominatedStopsVisited: approvedNominations || 0,
      });
    } catch (err) {
      console.error("[v0] Error fetching stats:", err);
      // Keep default 0 values on error
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("tavern_nominations")
        .insert({
          tavern_name: formData.tavernName,
          city: formData.city,
          state: formData.state,
          reason: formData.reason,
          submitter_name: formData.submitterName || null,
          submitter_email: formData.submitterEmail || null,
          status: "pending",
        });

      if (insertError) throw insertError;
      setSubmitted(true);
      // Refresh stats when nomination is submitted
      fetchStats();
    } catch (err) {
      console.error("Error submitting nomination:", err);
      setError("Failed to submit nomination. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      tavernName: "",
      city: "",
      state: "OH",
      reason: "",
      submitterName: "",
      submitterEmail: "",
    });
  };

  return (
    <section id="submit" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
              Know a Spot?
            </p>
            <h2 className="font-serif text-3xl lg:text-5xl font-black text-foreground mb-5 text-balance">
              Nominate a Tavern
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ohio is massive and we can&apos;t hit every bar on our own. If you know a local tavern 
              that deserves a spotlight — the kind of place that&apos;s been there forever, has a story, 
              and pours a cold one right — tell us about it.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We review every nomination and plan our routes based on community tips. Your local 
              gem could be our next stop.
            </p>

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { value: stats.nominationsReceived.toString(), label: "Nominations received" },
                { value: stats.nominatedStopsVisited.toString(), label: "Nominated stops visited" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="font-serif text-2xl font-black text-amber">{statsLoading ? "..." : value}</div>
                  <div className="text-xs text-muted-foreground tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-dark-wood border border-border rounded-sm p-6 lg:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-amber" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Nomination Received!
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                  Thanks for the tip. We&apos;ll check it out and if it makes the cut, you&apos;ll see it 
                  on the map.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-6 text-sm font-bold uppercase tracking-wider text-amber hover:text-amber-bright transition-colors"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Tell Us About the Stop
                </h3>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tavernName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tavern Name *
                  </label>
                  <input
                    id="tavernName"
                    type="text"
                    required
                    placeholder="e.g. Shorty's Corner Bar"
                    value={formData.tavernName}
                    onChange={(e) => setFormData((p) => ({ ...p, tavernName: e.target.value }))}
                    className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="e.g. Zanesville"
                      value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      State *
                    </label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                      className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-amber/60 transition-colors"
                    >
                      <option value="OH">Ohio</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="WV">West Virginia</option>
                      <option value="KY">Kentucky</option>
                      <option value="IN">Indiana</option>
                      <option value="MI">Michigan</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Why Should We Stop Here? *
                  </label>
                  <textarea
                    id="reason"
                    required
                    rows={4}
                    placeholder="Tell us what makes this place worth the stop..."
                    value={formData.reason}
                    onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                    className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="submitterName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Your Name <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <input
                      id="submitterName"
                      type="text"
                      placeholder="John D."
                      value={formData.submitterName}
                      onChange={(e) => setFormData((p) => ({ ...p, submitterName: e.target.value }))}
                      className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="submitterEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <input
                      id="submitterEmail"
                      type="email"
                      placeholder="john@email.com"
                      value={formData.submitterEmail}
                      onChange={(e) => setFormData((p) => ({ ...p, submitterEmail: e.target.value }))}
                      className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber text-darker-wood font-bold uppercase tracking-wider text-sm rounded-sm hover:bg-amber-bright transition-colors shadow-md shadow-amber/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Nomination
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  We review all nominations and plan routes based on community input.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
