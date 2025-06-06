export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('Service Worker Registered!', reg))
        .catch((err) => console.error('Service Worker Registration Failed:', err));
    });
  }
}
