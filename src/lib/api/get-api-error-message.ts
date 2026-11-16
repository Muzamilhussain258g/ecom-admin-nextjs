import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError<unknown>(error)) {
    const data = error.response?.data;
    const message = typeof data === "object" && data !== null && "message" in data
      ? data.message
      : undefined;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string" && !!item.trim());
      if (messages.length) return messages.join(" ");
    }
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
