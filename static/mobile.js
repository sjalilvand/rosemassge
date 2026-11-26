if (window.isSecureContext && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/rose-sw.js').catch(console.warn);
}
