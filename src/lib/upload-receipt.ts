import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string;
const PUBLISHABLE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;

/**
 * Uploads a receipt to the private `receipts` bucket with live progress.
 * Returns the storage path of the stored object.
 */
export async function uploadReceipt(
  file: File,
  userId: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Your session expired. Please sign in again.");

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const url = `${SUPABASE_URL}/storage/v1/object/receipts/${path}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", PUBLISHABLE_KEY);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("content-type", file.type || "image/jpeg");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error("Receipt upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading receipt."));
    xhr.send(file);
  });

  return path;
}

export function generateTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `EC-NGN-${block()}-${block()}`;
}
