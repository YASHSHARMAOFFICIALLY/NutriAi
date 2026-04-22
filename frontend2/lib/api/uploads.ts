import { apiFetch } from "./client";
import type { ConfirmUploadResponse, PresignUploadResponse } from "./types";

export function presignUpload(input: {
  contentType: string;
  size?: number;
}): Promise<PresignUploadResponse> {
  return apiFetch<PresignUploadResponse>("/uploads/presign", {
    method: "POST",
    body: input,
  });
}

export function confirmUpload(assetId: string): Promise<ConfirmUploadResponse> {
  return apiFetch<ConfirmUploadResponse>("/uploads/confirm", {
    method: "POST",
    body: { assetId },
  });
}

export async function uploadFoodImage(file: File): Promise<ConfirmUploadResponse> {
  const presigned = await presignUpload({
    contentType: file.type,
    size: file.size,
  });

  const res = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: presigned.requiredHeaders,
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }

  return confirmUpload(presigned.assetId);
}
