import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from './config/api';

export default function PinManagementScreen() {
    const [isPinSet, setIsPinSet] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const storedPin = await SecureStore.getItemAsync("userPin");
            setIsPinSet(!!storedPin);
        } catch (error) {
            console.error("Error checking PIN status:", error);
        }
    };

    const handleChangePin = async () => {
        try {
            // Verify token is still valid
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
                method: "GET",
                headers
            });

            if (response.ok) {
                router.push("/pin-setup");
            } else {
                // Token is invalid, clear storage and redirect to login
                await SecureStore.deleteItemAsync("token");
                await SecureStore.deleteItemAsync("userPin");
                router.replace("/loginscreen");
            }
        } catch (error) {
            console.error("Error changing PIN:", error);
            Alert.alert("Error", "Failed to change PIN. Please try again.");
        }
    };

    const handleRemovePin = async () => {
        Alert.alert(
            "Remove PIN",
            "Are you sure you want to remove your PIN? This will make your app less secure.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Verify token is still valid
                            const headers = await getAuthHeader();
                            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
                                method: "GET",
                                headers
                            });

                            if (response.ok) {
                                await SecureStore.deleteItemAsync("userPin");
                                setIsPinSet(false);
                                Alert.alert("Success", "PIN has been removed successfully");
                            } else {
                                // Token is invalid, clear storage and redirect to login
                                await SecureStore.deleteItemAsync("token");
                                await SecureStore.deleteItemAsync("userPin");
                                router.replace("/loginscreen");
                            }
                        } catch (error) {
                            console.error("Error removing PIN:", error);
                            Alert.alert("Error", "Failed to remove PIN. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>PIN Settings</Text>
                <Text style={styles.subtitle}>
                    Manage your PIN settings
                </Text>

                <View style={styles.optionsContainer}>
                    {isPinSet ? (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.changeButton]}
                                onPress={handleChangePin}
                            >
                                <Text style={styles.buttonText}>Change PIN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.removeButton]}
                                onPress={handleRemovePin}
                            >
                                <Text style={styles.buttonText}>Remove PIN</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.setupButton]}
                            onPress={() => router.push("/pin-setup")}
                        >
                            <Text style={styles.buttonText}>Set Up PIN</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e6e6e6",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },
    optionsContainer: {
        width: "100%",
        paddingHorizontal: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    changeButton: {
        backgroundColor: "#6CC551",
    },
    removeButton: {
        backgroundColor: "#ff4444",
    },
    setupButton: {
        backgroundColor: "#6CC551",
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
}); 