import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from './config/api';

export default function PinSetupScreen() {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN
    const router = useRouter();

    const handlePinSubmit = async () => {
        if (pin.length !== 4) {
            Alert.alert("Error", "PIN must be 4 digits");
            return;
        }

        if (step === 1) {
            setStep(2);
        } else {
            if (pin !== confirmPin) {
                Alert.alert("Error", "PINs do not match");
                setConfirmPin("");
                return;
            }

            try {
                // Verify token is still valid
                const headers = await getAuthHeader();
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
                    method: "GET",
                    headers
                });

                if (response.ok) {
                    // Save PIN to SecureStore
                    await SecureStore.setItemAsync("userPin", pin);
                    Alert.alert(
                        "Success",
                        "PIN has been set successfully",
                        [
                            {
                                text: "OK",
                                onPress: () => router.replace("/home")
                            }
                        ]
                    );
                } else {
                    // Token is invalid, clear storage and redirect to login
                    await SecureStore.deleteItemAsync("token");
                    router.replace("/loginscreen");
                }
            } catch (error) {
                console.error("Error setting PIN:", error);
                Alert.alert("Error", "Failed to set PIN. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        if (step === 1) {
            router.back();
        } else {
            setStep(1);
            setConfirmPin("");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>
                    {step === 1 ? "Set Your PIN" : "Confirm Your PIN"}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 1
                        ? "Enter a 4-digit PIN to secure your app"
                        : "Re-enter your PIN to confirm"}
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={step === 1 ? pin : confirmPin}
                        onChangeText={(text) => {
                            if (text.length <= 4 && /^\d*$/.test(text)) {
                                if (step === 1) {
                                    setPin(text);
                                } else {
                                    setConfirmPin(text);
                                }
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
                        <Text style={styles.buttonText}>Confirm</Text>
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
