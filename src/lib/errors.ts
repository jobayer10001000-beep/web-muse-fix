// Maps Firebase / Firestore / Auth SDK errors to safe, user-facing messages.
// Always log the raw error with console.error before showing the friendly one,
// so we never leak collection paths, permission internals, or stack traces.

const AUTH_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Please choose a stronger password (min 6 characters).",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

const FIRESTORE_MESSAGES: Record<string, string> = {
  "permission-denied": "You do not have permission to do that.",
  "unauthenticated": "Please sign in and try again.",
  "not-found": "That item could not be found.",
  "already-exists": "That item already exists.",
  "failed-precondition": "This action can't be completed right now.",
  "resource-exhausted": "Service is busy. Please try again in a moment.",
  "unavailable": "Service is temporarily unavailable. Please try again.",
  "deadline-exceeded": "The request took too long. Please try again.",
};

export function friendlyError(e: unknown, fallback = "Something went wrong. Please try again."): string {
  // Always log raw details for developers / Sentry
  // eslint-disable-next-line no-console
  console.error(e);

  const code = (e as { code?: string } | null)?.code;
  if (typeof code === "string") {
    if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
    if (FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code];
    if (code.startsWith("auth/")) return "Sign-in failed. Please try again.";
  }
  return fallback;
}
