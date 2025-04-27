// PWA utility functions for handling offline mode and updates

/**
 * Registers a custom fetch handler to show the offline page when the user is offline
 * and tries to access a page that isn't cached.
 */
// Define the FetchEvent interface to fix TypeScript errors
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

export function registerOfflineFallback() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // We don't need to use the registration parameter
      navigator.serviceWorker.ready.then(() => {
        // Add a custom fetch handler to show the offline page
        // when the user is offline and tries to access a page that isn't cached
        window.addEventListener('fetch', ((event: Event) => {
          const fetchEvent = event as unknown as FetchEvent;
          if (!navigator.onLine) {
            // Check if the request is for an HTML page
            if (fetchEvent.request.mode === 'navigate') {
              fetchEvent.respondWith(
                fetch(fetchEvent.request).catch(() => {
                  return caches.match('/offline.html') as Promise<Response>;
                })
              );
            }
          }
        }) as EventListener, { passive: true });
      });
    });
  }
}

/**
 * Checks if the app is being used in standalone mode (installed as PWA)
 * This checks multiple properties to ensure compatibility across different browsers
 */
export function isStandalone(): boolean {
  // Check for display-mode: standalone (most browsers)
  const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for navigator.standalone (iOS Safari)
  const iosStandalone = (window.navigator as any).standalone === true;
  
  // Check for display-mode: fullscreen or minimal-ui (alternative PWA modes)
  const fullscreenMatch = window.matchMedia('(display-mode: fullscreen)').matches;
  const minimalUiMatch = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  // Check for specific PWA environment variables that might be set
  const isPWAEnv = window.matchMedia('(display-mode: window-controls-overlay)').matches;
  
  return standaloneMatch || iosStandalone || fullscreenMatch || minimalUiMatch || isPWAEnv;
}

/**
 * Captures and stores the beforeinstallprompt event for later use
 * This should be called early in the app lifecycle
 */
let deferredPrompt: any = null;

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event so it can be triggered later
    deferredPrompt = e;
    // Optionally dispatch a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('pwaInstallReady'));
    return false;
  });

  // Listen for the appinstalled event to clear the prompt
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt variable
    deferredPrompt = null;
    // Log the installation to analytics or update UI
    console.log('PWA was installed');
    // Dispatch event that components can listen for
    window.dispatchEvent(new CustomEvent('pwaInstalled'));
  });
}

/**
 * Checks if the PWA can be installed right now
 */
export function canInstallPWA(): boolean {
  return !!deferredPrompt && !isStandalone();
}

/**
 * Triggers the PWA installation prompt
 * @returns A promise that resolves to the user's choice
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed'> {
  if (!deferredPrompt) {
    throw new Error('Installation prompt not available');
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  
  // Clear the deferred prompt variable
  deferredPrompt = null;
  
  return choiceResult.outcome;
}
