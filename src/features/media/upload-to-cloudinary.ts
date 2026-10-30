import { mediaApi } from "@/features/media/api/media.api";
import type {
  CloudinaryUploadResult,
  MediaPurpose,
  UploadSignatureData,
} from "@/features/media/types";

async function postToCloudinary(
  file: File,
  signature: UploadSignatureData
): Promise<CloudinaryUploadResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signature.apiKey);
  body.append("timestamp", String(signature.timestamp));
  body.append("signature", signature.signature);
  if (signature.folder) {
    body.append("folder", signature.folder);
  }

  const response = await fetch(signature.uploadUrl, {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as CloudinaryUploadResult & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? "Cloudinary upload failed. Please try again."
    );
  }

  if (!payload.public_id) {
    throw new Error("Cloudinary response did not include a public_id.");
  }

  return payload;
}

export async function uploadProductImage(
  file: File,
  purpose: MediaPurpose = "product"
): Promise<CloudinaryUploadResult> {
  const signature = await mediaApi.createUploadSignature({ purpose });
  return postToCloudinary(file, signature);
}
