import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Notification {
    id: string;
    message: string;
    type: string;
    timestamp: string;
}

export default function NotificationHistoryScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem("notifications");
            if (stored) {
                const parsedNotifications = JSON.parse(stored);
                // Sort notifications by timestamp (newest first)
                const sortedNotifications = parsedNotifications.sort(
                    (a: Notification, b: Notification) => 
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setNotifications(sortedNotifications);
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "Transaction":
                return "cash-outline";
            case "Reminder":
                return "alarm-outline";
            case "Transaction Update":
                return "checkmark-circle-outline";
            default:
                return "notifications-outline";
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "Transaction":
                return "#6CC551";
            case "Reminder":
                return "#FFB74D";
            case "Transaction Update":
                return "#4CAF50";
            default:
                return "#666";
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Ionicons 
                    name={getNotificationIcon(item.type)} 
                    size={24} 
                    color={getNotificationColor(item.type)} 
                />
            </View>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationType}>{item.type}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification History</Text>
                <View style={{ width: 26 }} />
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        backgroundColor: "#97B77B",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "black",
    },
    listContainer: {
        padding: 15,
    },
    notificationCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    notificationContent: {
        flex: 1,
    },
    notificationType: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    notificationMessage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    notificationTime: {
        fontSize: 12,
        color: "#999",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 10,
    },
}); 