
export interface ApiResponse<T> {
  data: T;
  message: string;
  method: string;
  path: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
}
