import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Modal,
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

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem("notifications");
            if (stored) {
                setNotifications(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    const saveNotifications = async (updatedNotifications: Notification[]) => {
        try {
            await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            setNotifications(updatedNotifications);
        } catch (error) {
            console.error("Error saving notifications:", error);
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            "Clear All Notifications",
            "Are you sure you want to clear all notifications?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => saveNotifications([])
                }
            ]
        );
    };

    const handleDelete = (notification: Notification) => {
        setSelectedNotification(notification);
        setDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        if (selectedNotification) {
            const updatedNotifications = notifications.filter(
                n => n.id !== selectedNotification.id
            );
            saveNotifications(updatedNotifications);
            setDeleteModalVisible(false);
            setSelectedNotification(null);
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <View style={styles.notificationCard}>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationType}>{item.type}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
            >
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleClearAll}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.historyButton}
                onPress={() => router.push("/notification-history")}
            >
                <Ionicons name="time-outline" size={24} color="#6CC551" />
                <Text style={styles.historyButtonText}>View Notification History</Text>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />

            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Notification</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to delete this notification?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconDeleteButton}
                                onPress={confirmDelete}
                            >
                                <Ionicons name="trash-outline" size={26} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    clearAllText: {
        color: "#FF6B6B",
        fontSize: 16,
        fontWeight: "600",
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
    deleteButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#ccc",
    },
    iconDeleteButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    historyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    historyButtonText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        marginLeft: 12,
    },
}); 