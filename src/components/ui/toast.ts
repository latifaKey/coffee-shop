// Simple toast utility function
type ToastType = "success" | "error" | "info" | "warning";

export function toast(message: string, type: ToastType = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
  }
}
