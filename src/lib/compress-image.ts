const TARGET_BYTES = 180 * 1024;

/**
 * Downscales and re-encodes an image until it fits under ~180KB.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const maxEdge = 1400;
  if (Math.max(width, height) > maxEdge) {
    const scale = maxEdge / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  let quality = 0.82;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(bitmap, 0, 0, width, height);

    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );

    if (!blob) break;
    if (blob.size <= TARGET_BYTES) break;

    if (quality > 0.45) {
      quality -= 0.12;
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }
  }

  bitmap.close?.();
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
