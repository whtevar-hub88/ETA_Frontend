import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from "./config/api";

export default function PinLockScreen() {
    const [pin, setPin] = useState("");
    const [attempts, setAttempts] = useState(0);
    const router = useRouter();

    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const storedPin = await SecureStore.getItemAsync("userPin");
            if (!storedPin) {
                router.replace("/home");
            }
        } catch (error) {
            console.error("Error checking PIN status:", error);
        }
    };

    const handlePinSubmit = async () => {
        if (pin.length !== 4) {
            Alert.alert("Error", "Please enter a complete 4-digit PIN");
            return;
        }

        try {
            const storedPin = await SecureStore.getItemAsync("userPin");
            
            if (pin === storedPin) {
                // Verify token is still valid
                const headers = await getAuthHeader();
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
                    method: "GET",
                    headers
                });

                if (response.ok) {
                    router.replace("/home");
                } else {
                    // Token is invalid, clear storage and redirect to login
                    await SecureStore.deleteItemAsync("token");
                    await SecureStore.deleteItemAsync("userPin");
                    router.replace("/loginscreen");
                }
            } else {
                setAttempts(attempts + 1);
                setPin("");
                
                if (attempts >= 2) {
                    Alert.alert(
                        "Too Many Attempts",
                        "You have exceeded the maximum number of attempts. Please try again later.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    setAttempts(0);
                                    setPin("");
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert("Error", "Incorrect PIN. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error verifying PIN:", error);
            Alert.alert("Error", "Failed to verify PIN. Please try again.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Enter PIN</Text>
                <Text style={styles.subtitle}>
                    Please enter your PIN to continue
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={pin}
                        onChangeText={(text) => {
                            if (text.length <= 4 && /^\d*$/.test(text)) {
                                setPin(text);
                            }
                        }}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                        placeholder="Enter PIN"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handlePinSubmit}
                    >
                        <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>
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
    inputContainer: {
        width: "100%",
        marginBottom: 30,
    },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        fontSize: 18,
        textAlign: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    cancelButton: {
        backgroundColor: "#ff4444",
    },
    confirmButton: {
        backgroundColor: "#6CC551",
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
});
