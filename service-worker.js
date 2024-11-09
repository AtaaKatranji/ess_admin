// self.addEventListener('push', (event) => {
//     const data = event.data.json();
//     self.registration.showNotification(data.title, {
//         body: data.message,
//         icon: '/path/to/icon.png'
//     });
// });

self.addEventListener('push', event => {
    // Check if the event contains data
    if (event.data) {
        const data = event.data.json();

        // Options for the notification
        const options = {
            body: data.message, // Message content from the push payload
            icon: '/icon.png',  // Path to the icon you want to show (update this with the path to your icon)
            badge: '/badge.png', // Path to a smaller icon badge for notifications (optional)
            data: {
                url: data.url // URL to navigate to when the notification is clicked
            }
        };

        // Show the notification
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Open the specified URL when the notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                // If there are open windows, focus on the first one
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].url === event.notification.data.url) {
                        client = clientList[i];
                        break;
                    }
                }
                return client.focus();
            } else {
                // Otherwise, open a new window
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
