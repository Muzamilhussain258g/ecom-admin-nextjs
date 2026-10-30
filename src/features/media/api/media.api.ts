import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  UploadSignatureData,
  UploadSignatureRequest,
} from "@/features/media/types";

export const mediaApi = {
  createUploadSignature: async (
    payload: UploadSignatureRequest
  ): Promise<UploadSignatureData> => {
    const response = (await apiClient.post(
      API_ENDPOINTS.media.uploadSignature,
      payload
    )) as ApiResponse<UploadSignatureData>;

    return response.data;
  },
};
