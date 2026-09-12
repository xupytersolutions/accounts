export default defineBackground(() => {
  // Minimal service worker — handles install and token expiry alarms if needed
  // No credential logic here; popup is the UI entry. Keep isolated, no window.postMessage.
  browser.runtime.onInstalled.addListener(() => {
    // no-op
  });
});
