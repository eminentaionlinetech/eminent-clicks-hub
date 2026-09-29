import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { BANK, type Tool, formatNaira } from "@/lib/tools";
import { generateTrackingCode, uploadReceipt } from "@/lib/upload-receipt";

type Props = {
  tool: Tool;
  userId: string;
  userEmail: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export function PaymentModal({ tool, userId, userEmail, onClose, onSubmitted }: Props) {
  const [email, setEmail] = useState(userEmail);
  const [whatsapp, setWhatsapp] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  async function handleFile(picked: File | null) {
    if (!picked) return;
    setFile(picked);
    setProgress(0);
    const out = await compressImage(picked);
    setCompressed(out);
  }

  async function handleSubmit() {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    if (whatsapp.trim().length < 7) {
      toast.error("Enter your WhatsApp number");
      return;
    }
    const upload = compressed ?? file;
    if (!upload) {
      toast.error("Attach your transfer receipt");
      return;
    }

    setBusy(true);
    try {
      const path = await uploadReceipt(upload, userId, setProgress);
      const code = generateTrackingCode();
      const { error } = await supabase.from("submissions").insert({
        user_id: userId,
        tool_id: tool.id,
        tool_name: tool.name,
        amount: tool.price,
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        receipt_url: path,
        status: "pending",
        tracking_code: code,
      });
      if (error) throw new Error(error.message);
      setTrackingCode(code);
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const sizeLabel = file
    ? `${(file.size / 1024 / 1024).toFixed(1)}MB → ${compressed ? Math.round(compressed.size / 1024) : "…"}KB`
    : "JPG or PNG · auto-compressed";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/85 px-3 py-6 backdrop-blur-sm">
      <div className="diagonal mx-auto max-w-md rounded-3xl p-4 shadow-[0_18px_40px_-20px_oklch(0_0_0/0.9)] ring-1 ring-border">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
            Payment Counter
          </span>
          <button onClick={onClose} className="font-mono text-[11px] text-cool">
            Close
          </button>
        </div>

        {trackingCode ? (
          <div className="py-4 text-center">
            <p className="font-display text-xl font-semibold">Submitted for approval</p>
            <p className="mt-2 text-[13px] text-pretty text-mute">
              We received your receipt for {tool.name}. You will be unlocked once it is confirmed.
            </p>
            <div className="mt-4 rounded-xl bg-primary/10 px-3 py-3 font-mono text-sm text-primary ring-1 ring-primary/30">
              {trackingCode}
            </div>
            <p className="mt-2 font-mono text-[10px] text-mute">Status: pending</p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 font-display text-sm font-semibold text-primary-foreground"
            >
              Back to tools
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[12px] text-mute">Transfer exactly</p>
                <p className="font-display text-3xl leading-none font-semibold tracking-tight">
                  {formatNaira(tool.price)}
                </p>
              </div>
              <span className="rounded-lg bg-primary/10 px-2.5 py-1.5 font-mono text-[11px] text-primary ring-1 ring-primary/30">
                {tool.name}
              </span>
            </div>

            <div className="glasscool mb-3 rounded-2xl p-3.5 ring-1 ring-cool/25">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-display text-[13px] font-semibold text-cool">{BANK.name}</span>
                <span className="font-mono text-[10px] text-mute">NGN · Bank Transfer</span>
              </div>
              <div className="font-mono text-lg tracking-[0.12em]">{BANK.account}</div>
              <p className="mt-1 text-[12px] text-pretty text-mute">{BANK.holder}</p>
            </div>

            <div className="mb-3 space-y-2.5">
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-wider uppercase text-mute">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  className="w-full rounded-xl bg-ink-2 px-3 py-3 text-[14px] ring-1 ring-border outline-none focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-wider uppercase text-mute">
                  WhatsApp number
                </label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  inputMode="tel"
                  placeholder="+234 803 447 1926"
                  className="w-full rounded-xl bg-ink-2 px-3 py-3 font-mono text-[14px] ring-1 ring-border outline-none placeholder:text-mute focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-ink-2 p-3 ring-1 ring-border">
              <div className="flex items-center gap-3">
                <label className="grid size-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl bg-steel-2 ring-1 ring-border">
                  {compressed ? (
                    <img
                      src={URL.createObjectURL(compressed)}
                      alt="Receipt preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-mute">
                      Upload
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="truncate text-[12px] text-foreground/80">
                      {file ? file.name : "Attach transfer receipt"}
                    </span>
                    <span className="font-mono text-[11px] text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-steel-2">
                    <div className="progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-mute">{sizeLabel}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => void handleSubmit()}
              disabled={busy}
              className="w-full rounded-xl bg-primary py-3.5 font-display text-sm font-semibold text-primary-foreground ring-1 ring-primary disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit for approval"}
            </button>
            <p className="mt-2 text-center font-mono text-[10px] text-mute">
              Status on submit → pending
            </p>
          </>
        )}
      </div>
    </div>
  );
}
