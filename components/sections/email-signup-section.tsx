"use client";

import { useState } from "react";
import { Mail, Beer } from "lucide-react";

export default function EmailSignupSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // ---------------------------------------------------------
      // REPLACE THIS BLOCK with your actual email service.
      //
      // Option A — Mailchimp:
      //   POST to your Mailchimp subscribe URL with { email_address: email, status: "subscribed" }
      //
      // Option B — ConvertKit:
      //   POST to https://api.convertkit.com/v3/forms/{FORM_ID}/subscribe
      //   with { api_key: "YOUR_KEY", email }
      //
      // Option C — Beehiiv:
      //   POST to https://api.beehiiv.com/v2/publications/{PUB_ID}/subscriptions
      //   with Authorization header and { email }
      //
      // For now this simulates a successful signup after 1 second:
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // ---------------------------------------------------------

      setStatus("success");
      setMessage("You're in! Cold drinks and hot reviews headed your way.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Give it another shot.");
    }
  };

  return (
    <section id="newsletter" className="bg-darker-wood border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center">
              <Beer className="w-7 h-7 text-amber" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg mb-8 leading-relaxed">
            New tavern reviews, tour updates, recipes, and Dude Network news — straight to your inbox. No spam. Just cold ones.
          </p>

          {/* Form */}
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-green-400 font-semibold text-lg">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === "loading"}
                className="flex-1 sm:max-w-xs px-4 py-3 rounded-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber transition-colors text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="px-6 py-3 bg-amber text-darker-wood font-bold tracking-wider uppercase text-sm rounded-sm hover:bg-amber-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === "loading" ? "Signing up..." : "Sign Me Up"}
              </button>
            </form>
          )}

          {/* Error message */}
          {status === "error" && (
            <p className="mt-3 text-red-400 text-sm">{message}</p>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime. We&apos;re dudes, not bots.
          </p>
        </div>
      </div>
    </section>
  );
}
