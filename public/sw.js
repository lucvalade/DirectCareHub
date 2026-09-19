// Service Worker for DirectCare Hub - Background Sync API & Web Push SOS Alerts

// Native IndexedDB helper to read the idb-keyval database format
async function getOfflineHandovers() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('keyval-store');
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('keyval')) {
        resolve([]);
        return;
      }
      const tx = db.transaction('keyval', 'readonly');
      const store = tx.objectStore('keyval');
      const getAllRequest = store.getAll();
      const getAllKeysRequest = store.getAllKeys();

      tx.oncomplete = () => {
        const items = getAllKeysRequest.result.map((key, index) => ({
          key,
          blob: getAllRequest.result[index]
        })).filter(item => typeof item.key === 'string' && item.key.startsWith('handover_'));
        resolve(items);
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

// Function to safely delete from IndexedDB after successful upload
async function deleteOfflineHandover(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('keyval-store');
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('keyval')) {
        resolve();
        return;
      }
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').delete(key);
      tx.oncomplete = () => resolve();
    };
    request.onerror = () => resolve();
  });
}

// Intercept the Background Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-handovers') {
    event.waitUntil(
      (async () => {
        const handovers = await getOfflineHandovers();
        
        for (const item of handovers) {
          const shiftId = item.key.split('_')[1]; // Extract shiftId from "handover_{shiftId}_{timestamp}"
          
          const formData = new FormData();
          formData.append('audio', item.blob, 'handover.webm');
          formData.append('shiftId', shiftId || 'general');

          try {
            const response = await fetch('/api/handovers/sync', {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              await deleteOfflineHandover(item.key);
            }
          } catch (error) {
            console.error('Background sync failed for item, will retry later:', error);
            throw error; // Throwing keeps the sync tag registered for a future retry
          }
        }
      })()
    );
  }
});

// Listen for incoming Web Push payloads
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "🚨 SOS: Shift Coverage Needed";
  const options = {
    body: data.body || "An emergency relief shift has opened up.",
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png', // Small monochrome icon for Android status bar
    vibrate: [500, 250, 500, 250, 500], // Distinctive SOS vibration pattern
    tag: 'sos-alert', // Groups multiple SOS alerts into a single notification
    requireInteraction: true, // Forces the notification to stay on screen until dismissed
    data: { 
      url: data.url || '/dashboard' 
    },
    actions: [
      { action: 'claim', title: 'Review & Claim Shift' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user clicking the notification or the action button
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus the tab if the app is already open in the background
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(urlToOpen); // Navigate existing tab to the claim page
          return client.focus();
        }
      }
      // Otherwise, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
