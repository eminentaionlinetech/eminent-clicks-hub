import { createServerFn } from "@tanstack/react-start";

type AdminSubmission = {
  id: string;
  tool_id: string;
  tool_name: string;
  amount: number;
  email: string;
  whatsapp: string;
  status: string;
  tracking_code: string;
  created_at: string;
  receipt_url: string | null;
};

function normalize(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

async function assertAdmin(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error("Could not verify admin access");
  if (!data) throw new Error("This email is not an admin account");
  return supabaseAdmin;
}

export const adminSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => ({ email: normalize(input.email) }))
  .handler(async ({ data }) => {
    if (!data.email) throw new Error("Enter an email address");
    await assertAdmin(data.email);
    return { ok: true as const, email: data.email };
  });

export const adminList = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; search?: string; status?: string }) => ({
    email: normalize(input.email),
    search: (input.search ?? "").trim(),
    status: input.status ?? "pending",
  }))
  .handler(async ({ data }) => {
    const supabaseAdmin = await assertAdmin(data.email);

    const counts = await supabaseAdmin.from("submissions").select("status");
    const all = counts.data ?? [];
    const stats = {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
    };

    let query = supabaseAdmin
      .from("submissions")
      .select(
        "id, tool_id, tool_name, amount, email, whatsapp, status, tracking_code, created_at, receipt_url",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (data.status !== "all") query = query.eq("status", data.status);
    if (data.search) {
      const s = `%${data.search}%`;
      query = query.or(
        `email.ilike.${s},whatsapp.ilike.${s},tracking_code.ilike.${s},tool_name.ilike.${s}`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const submissions: AdminSubmission[] = [];
    for (const row of rows ?? []) {
      let signed: string | null = null;
      if (row.receipt_url) {
        const { data: s } = await supabaseAdmin.storage
          .from("receipts")
          .createSignedUrl(row.receipt_url, 60 * 60);
        signed = s?.signedUrl ?? null;
      }
      submissions.push({ ...row, receipt_url: signed });
    }

    return { stats, submissions };
  });

export const adminApprove = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; id: string }) => ({
    email: normalize(input.email),
    id: String(input.id),
  }))
  .handler(async ({ data }) => {
    const supabaseAdmin = await assertAdmin(data.email);
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
