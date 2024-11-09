import { useEffect } from 'react';
import PushNotifications from '@pusher/push-notifications-web';

const Notifications = () => {
    useEffect(() => {
        // Ensure this code runs only on the client side
        if (typeof window !== 'undefined') {
            const beamsClient = new PushNotifications({
                instanceId: 'YOUR_INSTANCE_ID'
            });

            beamsClient.start()
                .then(() => beamsClient.addDeviceInterest('admin-notifications'))
                .then(() => {
                    console.log('Successfully registered for push notifications!');
                })
                .catch(console.error);
        }
    }, []);

    return null;
};

export default Notifications;
