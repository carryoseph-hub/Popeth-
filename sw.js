// Minimal service worker — its only job is to satisfy the browser's
// "installable web app" requirement so people can add Stockline to their
// home screen. It intentionally does NOT cache anything, so the app
// always loads the latest deployed version instead of a stale one.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: let every request go straight to the network as normal.
});
