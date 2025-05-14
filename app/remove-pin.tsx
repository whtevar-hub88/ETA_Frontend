import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function RemovePinScreen() {
    const router = useRouter();
    const [pin, setPin] = useState(["", "", "", ""]);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (/^\d?$/.test(value)) {
            const updated = [...pin];
            updated[index] = value;
            setPin(updated);

            if (value && index < 3) {
                inputRefs.current[index + 1]?.focus();
            } else if (value && index === 3) {
                handleVerify();
            }
        }
    };

    const handleVerify = async () => {
        const enteredPin = pin.join("");
        if (enteredPin.length < 4) {
            return;
        }

        try {
            const storedPin = await SecureStore.getItemAsync("userPIN");
            
            if (storedPin === enteredPin) {
                Alert.alert(
                    "Remove PIN",
                    "Are you sure you want to remove your PIN?",
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
                                    await SecureStore.deleteItemAsync("userPIN");
                                    await SecureStore.deleteItemAsync("isPinSet");
                                    await SecureStore.deleteItemAsync("token");
                                    
                                    Alert.alert(
                                        "Success", 
                                        "PIN removed successfully. You will need to log in again.",
                                        [
                                            {
                                                text: "OK",
                                                onPress: () => router.replace("/login")
                                            }
                                        ]
                                    );
                                } catch (error) {
                                    console.error("Error removing PIN:", error);
                                    Alert.alert("Error", "Failed to remove PIN.");
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "Incorrect PIN. Please try again.");
                setPin(["", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error("Error verifying PIN:", error);
            Alert.alert("Error", "Failed to verify PIN.");
        }
    };

    const handleCancel = () => {
        router.replace("/settings");
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Enter Current PIN</Text>
                <Text style={styles.subtitle}>Please enter your current PIN to remove it</Text>
                <View style={styles.pinContainer}>
                    {pin.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={1}
                            secureTextEntry
                            value={digit}
                            onChangeText={(value) => handleChange(value, index)}
                        />
                    ))}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleVerify}>
                        <Text style={styles.confirm}>Verify</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e6e6e6",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#fff",
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: "85%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    pinContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 25,
    },
    input: {
        borderBottomWidth: 2,
        borderColor: "#000",
        fontSize: 22,
        textAlign: "center",
        padding: 5,
        width: 40,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "60%",
    },
    cancel: {
        color: "#6CC551",
        fontWeight: "600",
        fontSize: 16,
    },
    confirm: {
        color: "#6CC551",
        fontWeight: "600",
        fontSize: 16,
    },
}); 