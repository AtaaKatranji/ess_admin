"use client";
import { useEffect } from 'react';


const Notifications = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                    return registration.pushManager.getSubscription();
                })
                .then(async subscription => {
                    if (!subscription) {
                        const publicKey = process.env.NEXT_PUBLICK_VAPID_KEY;
                        const convertedVapidKey = urlBase64ToUint8Array(publicKey);
                        const newSubscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });

                        // Send the subscription to your server to save it
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Noti/save-subscription`, {
                            method: 'POST',
                            body: JSON.stringify(newSubscription),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    }
                })
                .catch(console.error);
        }
    }, []);

    // Utility function to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
    }

    return null;
};

export default Notifications;
