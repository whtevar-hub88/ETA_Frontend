import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, ToastAndroid } from "react-native";
import * as Notifications from 'expo-notifications';

interface Notification {
    id: string;
    message: string;
    type: string;
    timestamp: string;
}

class NotificationService {
    private static instance: NotificationService;
    private morningInterval: any = null;
    private eveningInterval: any = null;

    private constructor() {
        this.setupNotifications();
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async setupNotifications() {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Notification permissions not granted');
            return;
        }

        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });
    }

    async addNotification(message: string, type: string) {
        try {
            const notification: Notification = {
                id: Date.now().toString(),
                message,
                type,
                timestamp: new Date().toISOString(),
            };

            // Save to AsyncStorage
            const stored = await AsyncStorage.getItem("notifications");
            const notifications = stored ? JSON.parse(stored) : [];
            await AsyncStorage.setItem(
                "notifications",
                JSON.stringify([notification, ...notifications])
            );

            // Show toast notification
            if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.SHORT);
            }

            // Schedule local notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: type,
                    body: message,
                },
                trigger: null, // Show immediately
            });

            return notification;
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    }

    // Send immediate transaction notification
    async sendTransactionNotification(amount: number, type: string) {
        const message = `New transaction: ${amount} for ${type}`;
        await this.addNotification(message, "Transaction");
    }

    // Send transaction update after 10 seconds
    async sendTransactionUpdateNotification(amount: number, type: string) {
        setTimeout(async () => {
            const message = `Transaction of ${amount} for ${type} has been processed`;
            await this.addNotification(message, "Transaction Update");
        }, 10 * 1000); // 10 seconds
    }

    // Send reminder notification after 5 minutes
    async sendReminderNotification(amount: number, type: string) {
        setTimeout(async () => {
            const message = `Reminder: Would you like to add this transaction of ${amount} for ${type}?`;
            await this.addNotification(message, "Reminder");
        }, 5 * 60 * 1000); // 5 minutes
    }

    async getAllNotifications(): Promise<Notification[]> {
        try {
            const stored = await AsyncStorage.getItem("notifications");
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Error getting notifications:", error);
            return [];
        }
    }

    async clearAllNotifications() {
        try {
            await AsyncStorage.setItem("notifications", JSON.stringify([]));
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    }

    async deleteNotification(id: string) {
        try {
            const stored = await AsyncStorage.getItem("notifications");
            if (stored) {
                const notifications = JSON.parse(stored);
                const updatedNotifications = notifications.filter(
                    (n: Notification) => n.id !== id
                );
                await AsyncStorage.setItem(
                    "notifications",
                    JSON.stringify(updatedNotifications)
                );
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }

    // Start sending system notifications twice a day
    startSystemNotifications() {
        if (this.morningInterval || this.eveningInterval) return; // Prevent multiple intervals

        // Schedule morning notification (9:00 AM)
        const scheduleMorningNotification = () => {
            const now = new Date();
            const morning = new Date(now);
            morning.setHours(9, 0, 0, 0);
            
            if (now > morning) {
                morning.setDate(morning.getDate() + 1);
            }
            
            const timeUntilMorning = morning.getTime() - now.getTime();
            
            this.morningInterval = setTimeout(() => {
                this.sendSystemNotification();
                scheduleMorningNotification(); // Schedule next day
            }, timeUntilMorning);
        };

        // Schedule evening notification (6:00 PM)
        const scheduleEveningNotification = () => {
            const now = new Date();
            const evening = new Date(now);
            evening.setHours(18, 0, 0, 0);
            
            if (now > evening) {
                evening.setDate(evening.getDate() + 1);
            }
            
            const timeUntilEvening = evening.getTime() - now.getTime();
            
            this.eveningInterval = setTimeout(() => {
                this.sendSystemNotification();
                scheduleEveningNotification(); // Schedule next day
            }, timeUntilEvening);
        };

        // Start both schedules
        scheduleMorningNotification();
        scheduleEveningNotification();
    }

    // Stop system notifications
    stopSystemNotifications() {
        if (this.morningInterval) {
            clearTimeout(this.morningInterval);
            this.morningInterval = null;
        }
        if (this.eveningInterval) {
            clearTimeout(this.eveningInterval);
            this.eveningInterval = null;
        }
    }

    // Send a system notification
    async sendSystemNotification() {
        const message = 'Do you want to add this transaction?';
        await this.addNotification(message, 'System');
    }
}

// Export a function to start system notifications from the app entry point
export function startSystemNotifications() {
    NotificationService.getInstance().startSystemNotifications();
}

export default NotificationService; 