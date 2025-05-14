import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ResetPasswordScreen = () => {
    const router = useRouter();
    const { email, code } = useLocalSearchParams(); // ✅ Added to get email and code from previous screen
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    // Password validation regex
    const isSecurePassword = (password: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
        return regex.test(password);
    };

    const handleReset = async () => {
        let isValid = true;

        // Validate new password
        if (!newPassword || !isSecurePassword(newPassword)) {
            setNewPasswordError("Password must include letters, numbers, and a special character.");
            isValid = false;
        } else {
            setNewPasswordError("");
        }

        // Validate confirm password
        if (!confirmPassword || newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            isValid = false;
        } else {
            setConfirmPasswordError("");
        }

        // If validation passes, proceed with API call
        if (isValid) {
            try {
                const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        code,
                        newPassword,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    Alert.alert("✅ Password Reset", "You can now log in.");
                    router.push("/loginscreen");
                } else {
                    Alert.alert("❌ Failed", data.msg || "Try again.");
                }
            } catch (err) {
                Alert.alert("Server Error", "Something went wrong.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Expense Tracker App</Text>
            <Image source={require("../assets/images/pig.png")} style={styles.image} />

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(text) => {
                        setNewPassword(text);
                        setNewPasswordError(""); // Clear while typing
                    }}
                />
                <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#333"
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                />
            </View>
            {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setConfirmPasswordError(""); // Clear while typing
                    }}
                />
                <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#333"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                />
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Reset Password</Text> {/* Updated to match first code */}
            </TouchableOpacity>
        </View>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        justifyContent: "center",
        padding: 25,
    },
    image: {
        width: 130,
        height: 130,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        color: "white",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E5E4E2",
        borderRadius: 12,
        marginBottom: 5,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        paddingHorizontal: 5,
    },
    errorText: {
        color: "#FFDDDD",
        fontSize: 13,
        marginBottom: 10,
        fontStyle: "italic",
    },
    button: {
        backgroundColor: "#D9D9D9",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
        width: "50%",
        alignSelf: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
});