import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) setCheckEmail(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary ring-1 ring-primary/40">
          EC
        </div>
        <div className="leading-none">
          <p className="font-display text-[16px] font-semibold tracking-tight">Eminent Clicks</p>
          <p className="mt-1 font-mono text-[10px] tracking-wide text-mute">TOOL LOCKER · NGN</p>
        </div>
      </div>

      {checkEmail ? (
        <div className="glasscool rounded-2xl p-4 ring-1 ring-primary/30">
          <p className="font-display text-lg font-semibold">Confirm your email</p>
          <p className="mt-2 text-[13px] text-pretty text-mute">
            We sent a confirmation link to {email}. Click it, then come back and sign in.
          </p>
        </div>
      ) : (
        <div className="diagonal rounded-3xl p-4 ring-1 ring-border">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-1 text-[13px] text-pretty text-mute">
            Unlock tools with a bank transfer, tracked end to end.
          </p>

          <div className="mt-4 space-y-2.5">
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-wider uppercase text-mute">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-xl bg-ink-2 px-3 py-3 text-[14px] ring-1 ring-border outline-none focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-wider uppercase text-mute">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-xl bg-ink-2 px-3 py-3 text-[14px] ring-1 ring-border outline-none focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            onClick={() => void submit()}
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-primary py-3.5 font-display text-sm font-semibold text-primary-foreground ring-1 ring-primary disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-3 w-full text-center font-mono text-[11px] text-cool"
          >
            {mode === "signin" ? "No account yet? Sign up" : "Already registered? Sign in"}
          </button>
        </div>
      )}
    </div>
  );
}
