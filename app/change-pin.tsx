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

export default function ChangePinScreen() {
    const router = useRouter();
    const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
    const [newPin, setNewPin] = useState(["", "", "", ""]);
    const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
    const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (/^\d?$/.test(value)) {
            let updatedPin;
            if (step === 'current') {
                updatedPin = [...currentPin];
                updatedPin[index] = value;
                setCurrentPin(updatedPin);
            } else if (step === 'new') {
                updatedPin = [...newPin];
                updatedPin[index] = value;
                setNewPin(updatedPin);
            } else {
                updatedPin = [...confirmPin];
                updatedPin[index] = value;
                setConfirmPin(updatedPin);
            }

            if (value && index < 3) {
                inputRefs.current[index + 1]?.focus();
            } else if (value && index === 3) {
                handleConfirm();
            }
        }
    };

    const handleCancel = () => {
        router.replace("/settings");
    };

    const handleConfirm = async () => {
        if (step === 'current') {
            const enteredPin = currentPin.join("");
            try {
                const storedPin = await SecureStore.getItemAsync("userPIN");
                if (storedPin === enteredPin) {
                    setStep('new');
                    setNewPin(["", "", "", ""]);
                    setTimeout(() => {
                        inputRefs.current[0]?.focus();
                    }, 100);
                } else {
                    Alert.alert("Error", "Current PIN is incorrect.");
                    setCurrentPin(["", "", "", ""]);
                    inputRefs.current[0]?.focus();
                }
            } catch (error) {
                console.error("Error verifying PIN:", error);
                Alert.alert("Error", "Failed to verify PIN.");
            }
        } else if (step === 'new') {
            const enteredPin = newPin.join("");
            if (enteredPin.length === 4) {
                setStep('confirm');
                setConfirmPin(["", "", "", ""]);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } else {
                Alert.alert("Incomplete", "Please enter all 4 digits.");
            }
        } else {
            const finalNewPin = newPin.join("");
            const finalConfirmPin = confirmPin.join("");

            if (finalNewPin === finalConfirmPin) {
                try {
                    await SecureStore.setItemAsync("userPIN", finalNewPin);
                    Alert.alert("Success", "PIN changed successfully.", [
                        {
                            text: "OK",
                            onPress: () => router.replace("/settings")
                        }
                    ]);
                } catch (error) {
                    console.error("Error saving PIN:", error);
                    Alert.alert("Error", "Failed to save PIN.");
                }
            } else {
                Alert.alert("Error", "PINs do not match. Please try again.");
                setConfirmPin(["", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        }
    };

    const getTitle = () => {
        switch (step) {
            case 'current':
                return "Enter Current PIN";
            case 'new':
                return "Enter New PIN";
            case 'confirm':
                return "Confirm New PIN";
        }
    };

    const getCurrentPin = () => {
        switch (step) {
            case 'current':
                return currentPin;
            case 'new':
                return newPin;
            case 'confirm':
                return confirmPin;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{getTitle()}</Text>
                <View style={styles.pinContainer}>
                    {getCurrentPin().map((digit, index) => (
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
                    <TouchableOpacity onPress={handleConfirm}>
                        <Text style={styles.confirm}>Confirm</Text>
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
        marginBottom: 20,
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