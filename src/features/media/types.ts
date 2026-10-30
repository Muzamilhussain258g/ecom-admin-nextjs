export type MediaPurpose = "product" | "category" | "collection";

export type UploadSignatureRequest = {
  purpose: MediaPurpose;
};

export type UploadSignatureData = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
  folder?: string;
};

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  version: number;
  signature?: string;
};
