import firebase from 'react-native-firebase';
import {EventRegister} from 'react-native-event-listeners';

export const androidChannelId = 'SnapfoodAppNotificationChannel';
export const androidChannelDescription = 'Main Channel';

export const PUSH_NOTIFICATION_RECEIVED_EVENT = 'pushNotificationReceivedEvent';
export const PUSH_NOTIFICATION_OPENED_EVENT = 'pushNotificationOpenedEvent';
export const PUSH_NOTIFICATION_NEW_VENDOR = 'pushNotificationNewVendor';
export const PUSH_NOTIFICATION_NEW_BLOG = 'pushNotificationNewBlog';

export const setupPushNotifications = async () => {
    try {
        await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        console.log('FIREBASE TOKEN: ', fcmToken);
        // Build a channel
        const channel = new firebase.notifications.Android
            .Channel(androidChannelId, androidChannelDescription, firebase.notifications.Android.Importance.Max)
            .setDescription('Main Channel for notifications');

        // Create the channel
        firebase.notifications().android.createChannel(channel);

        firebase.notifications().onNotification((notification) => {
            notification.android.setChannelId('SnapfoodAppNotificationChannel');
            notification.android.setSmallIcon('ic_launcher_transparent');
            firebase.notifications().displayNotification(notification);
        });
        firebase.notifications().onNotificationOpened(({notification}) => {
            EventRegister.emit(PUSH_NOTIFICATION_RECEIVED_EVENT, notification);
        });
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            EventRegister.emit(PUSH_NOTIFICATION_RECEIVED_EVENT, notificationOpen.notification);
        }
        return notificationOpen;
    } catch (e) {
        console.log(e);
    }
};

