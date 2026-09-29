import { type Tool, formatNaira } from "@/lib/tools";

const SHELLS: Record<
  string,
  { metrics: { label: string; value: string }[]; rows: { primary: string; meta: string; tag: string }[] }
> = {
  subtrack: {
    metrics: [
      { label: "Active subs", value: "14" },
      { label: "Due in 7d", value: "3" },
      { label: "Monthly", value: "\u20a6182,400" },
    ],
    rows: [
      { primary: "DSTV Compact Plus", meta: "Renews 04 Oct", tag: "\u20a614,250" },
      { primary: "MTN Data Bundle", meta: "Renews 11 Oct", tag: "\u20a620,000" },
      { primary: "Office rent levy", meta: "Renews 01 Nov", tag: "\u20a695,000" },
    ],
  },
  jobflow: {
    metrics: [
      { label: "Open roles", value: "6" },
      { label: "In review", value: "11" },
      { label: "Offers", value: "2" },
    ],
    rows: [
      { primary: "Frontend Engineer", meta: "Stage: Interview 2", tag: "4 candidates" },
      { primary: "Ops Associate", meta: "Stage: Screening", tag: "9 candidates" },
      { primary: "Field Agent \u2014 Lagos", meta: "Stage: Offer", tag: "1 candidate" },
    ],
  },
  paychaser: {
    metrics: [
      { label: "Outstanding", value: "\u20a6412,000" },
      { label: "Overdue", value: "5" },
      { label: "Recovered", value: "\u20a6780,000" },
    ],
    rows: [
      { primary: "INV-2041 \u00b7 Bamise Ltd", meta: "18 days overdue", tag: "\u20a6120,000" },
      { primary: "INV-2044 \u00b7 Zuri Stores", meta: "6 days overdue", tag: "\u20a688,500" },
      { primary: "INV-2050 \u00b7 Hale Foods", meta: "Due tomorrow", tag: "\u20a6203,500" },
    ],
  },
  reportsnap: {
    metrics: [
      { label: "Reports", value: "23" },
      { label: "This month", value: "7" },
      { label: "Scheduled", value: "2" },
    ],
    rows: [
      { primary: "September statement", meta: "Generated 28 Sep", tag: "PDF" },
      { primary: "Q3 payout summary", meta: "Generated 20 Sep", tag: "XLSX" },
      { primary: "Weekly cash position", meta: "Every Monday", tag: "Auto" },
    ],
  },
  claimdesk: {
    metrics: [
      { label: "Open claims", value: "8" },
      { label: "Escalated", value: "2" },
      { label: "Resolved", value: "41" },
    ],
    rows: [
      { primary: "CLM-118 \u00b7 Wrong debit", meta: "Opened 26 Sep", tag: "Open" },
      { primary: "CLM-119 \u00b7 Failed transfer", meta: "Opened 27 Sep", tag: "Escalated" },
      { primary: "CLM-121 \u00b7 Duplicate charge", meta: "Opened 28 Sep", tag: "Open" },
    ],
  },
};

export function ToolShell({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const shell = SHELLS[tool.id] ?? SHELLS["subtrack"]!;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink">
      <header className="diagonal flex items-center justify-between px-4 pt-4 pb-3 ring-1 ring-border">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/20 font-display font-bold text-primary ring-1 ring-primary/50">
            {tool.initial}
          </div>
          <div className="leading-none">
            <p className="font-display text-[15px] font-semibold tracking-tight">{tool.name}</p>
            <p className="mt-1 font-mono text-[10px] tracking-wide text-mute">
              ACTIVE \u00b7 {formatNaira(tool.price)} PAID
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-2 font-mono text-[11px] text-cool ring-1 ring-border"
        >
          Close
        </button>
      </header>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {shell.metrics.map((m) => (
            <div key={m.label} className="glass rounded-2xl p-3 ring-1 ring-border">
              <p className="font-mono text-[9px] uppercase tracking-wider text-mute">{m.label}</p>
              <p className="mt-1.5 font-display text-xl leading-none font-semibold">{m.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 font-display text-base font-semibold">{tool.tagline}</p>
          <div className="space-y-2">
            {shell.rows.map((row) => (
              <div key={row.primary} className="glass flex items-center gap-3 rounded-2xl p-3 ring-1 ring-border">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{row.primary}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-mute">{row.meta}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-cool">{row.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glasscool rounded-2xl p-3.5 ring-1 ring-primary/30">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">Workspace</p>
          <p className="mt-1.5 text-[13px] text-pretty text-mute">
            {tool.name} is unlocked on this account. Records you add here stay tied to your login.
          </p>
        </div>
      </div>
    </div>
  );
}
