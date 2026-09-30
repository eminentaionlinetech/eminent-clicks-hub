import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import { AuthPanel } from "@/components/AuthPanel";
import { PaymentModal } from "@/components/PaymentModal";
import { ToolShell } from "@/components/ToolShell";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS, type Tool, formatNaira } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eminent Clicks — Naira tool locker" },
      {
        name: "description",
        content:
          "Unlock SubTrack, JobFlow, PayChaser, ReportSnap and ClaimDesk with a Kuda bank transfer. Upload your receipt and track approval.",
      },
      { property: "og:title", content: "Eminent Clicks — Naira tool locker" },
      {
        property: "og:description",
        content:
          "Unlock business tools with a bank transfer. Upload your receipt, get a tracking code, go live on approval.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Submission = {
  id: string;
  tool_id: string;
  status: string;
  tracking_code: string;
  created_at: string;
};

function Index() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [payFor, setPayFor] = useState<Tool | null>(null);
  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const taps = useRef<number[]>([]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") void navigate({ to: "/admin" });
  }, [navigate]);

  const userId = session?.user.id ?? null;

  const { data: submissions = [], refetch } = useQuery({
    queryKey: ["submissions", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Submission[]> => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, tool_id, status, tracking_code, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  function statusFor(toolId: string) {
    const rows = submissions.filter((s) => s.tool_id === toolId);
    if (rows.some((s) => s.status === "approved")) return "approved" as const;
    if (rows.some((s) => s.status === "pending")) return "pending" as const;
    return "locked" as const;
  }

  function handleDashboardTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 800), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      void navigate({ to: "/admin" });
    }
  }

  if (!ready) {
    return <div className="min-h-screen bg-ink" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-ink">
        <AuthPanel />
      </div>
    );
  }

  const email = session.user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();
  const activeCount = TOOLS.filter((t) => statusFor(t.id) === "approved").length;

  return (
    <div className="min-h-screen bg-ink font-body text-foreground antialiased">
      <header className="diagonal flex items-center justify-between px-4 pt-4 pb-3 ring-1 ring-border">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
            <span className="font-display text-sm font-bold text-primary">EC</span>
          </div>
          <div className="leading-none">
            <p className="font-display text-[15px] font-semibold tracking-tight">Eminent Clicks</p>
            <p className="mt-1 font-mono text-[10px] tracking-wide text-mute">TOOL LOCKER · NGN</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void supabase.auth.signOut()}
            className="glasscool rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-cool ring-1 ring-cool/20"
          >
            Sign out
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-steel-2 font-display text-xs font-semibold ring-1 ring-border">
            {initials}
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        <section>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2
              onClick={handleDashboardTap}
              className="cursor-default font-display text-base font-semibold text-balance select-none"
            >
              My Dashboard
            </h2>
            <span className="font-mono text-[10px] text-mute">
              {activeCount} ACTIVE / {TOOLS.length - activeCount} LOCKED
            </span>
          </div>
          <p className="mb-3 text-[12px] text-pretty text-mute">
            Signed in as {email}. Pay by transfer to unlock any tool.
          </p>

          <div className="space-y-2">
            {TOOLS.map((tool) => {
              const state = statusFor(tool.id);
              if (state === "approved") {
                return (
                  <button
                    key={tool.id}
                    onClick={() => setOpenTool(tool)}
                    className="glasscool flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-primary/40"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/20 ring-1 ring-primary/50">
                      <span className="font-display font-bold text-primary">{tool.initial}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-[15px] font-semibold">{tool.name}</p>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase text-primary">
                          Active
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-mute">{tool.tagline}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-primary">Open</span>
                  </button>
                );
              }

              const pending = state === "pending";
              return (
                <button
                  key={tool.id}
                  onClick={() => !pending && setPayFor(tool)}
                  className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-border"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-steel-2/60 font-display font-semibold text-mute ring-1 ring-border">
                    {tool.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[15px] font-medium text-foreground/80">
                        {tool.name}
                      </p>
                      {pending && (
                        <span className="rounded bg-clay/10 px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase text-clay">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-mute">{tool.tagline}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[12px] text-foreground/70">
                      {formatNaira(tool.price)}
                    </span>
                    <span className="grid size-5 place-items-center text-sm text-clay" aria-label="locked">
                      🔒
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {submissions.length > 0 && (
          <section>
            <h2 className="mb-2.5 font-display text-base font-semibold">Payment history</h2>
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="glass flex items-center gap-3 rounded-2xl p-3 ring-1 ring-border">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[12px] text-foreground">{s.tracking_code}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-mute">
                      {TOOLS.find((t) => t.id === s.tool_id)?.name ?? s.tool_id} ·{" "}
                      {new Date(s.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] tracking-wider uppercase ${
                      s.status === "approved"
                        ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                        : "bg-clay/10 text-clay ring-1 ring-clay/30"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-4 pb-8 text-center">
          <p className="font-mono text-[10px] text-mute">Eminent Clicks · Lagos, NG</p>
          <button
            onClick={() => void navigate({ to: "/admin" })}
            className="mt-3 rounded-lg px-3 py-2 font-mono text-[10px] text-mute ring-1 ring-border"
          >
            Open Admin Panel
          </button>
        </footer>
      </div>

      {payFor && userId && (
        <PaymentModal
          tool={payFor}
          userId={userId}
          userEmail={email}
          onClose={() => setPayFor(null)}
          onSubmitted={() => void refetch()}
        />
      )}
      {openTool && <ToolShell tool={openTool} onClose={() => setOpenTool(null)} />}
    </div>
  );
}
