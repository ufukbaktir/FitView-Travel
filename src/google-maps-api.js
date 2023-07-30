const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function loadMapsAPI() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMapsAPI`;
      script.onerror = reject;
      window.initMapsAPI = () => {
        resolve(window.google.maps);
        delete window.initMapsAPI;
      };
      document.head.appendChild(script);
    }
  });
}
