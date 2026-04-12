export function logError(message: string, error?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${message}`, error);
  }
  // Em produção, podes integrar com Sentry, LogRocket, etc.
}
