import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const SignupScreen = () => {
    const router = useRouter();
    const [name, setName] = useState(""); // Added from first code
    const [email, setEmail] = useState(""); // Added from first code
    const [password, setPassword] = useState(""); // Added from first code
    const [confirmPassword, setConfirmPassword] = useState(""); // Added from first code
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        // Validation from first code
        if (!name || !email || !password || !confirmPassword) {
            return Alert.alert("All fields are required!");
        }

        if (password !== confirmPassword) {
            return Alert.alert("Passwords do not match!");
        }

        // Backend API call from first code
        try {
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.status === 201) {
                Alert.alert("✅ Registered successfully!");
                router.push("/loginscreen");
            } else {
                Alert.alert("⚠️ Registration failed", data.msg || "Try again.");
            }
        } catch (error) {
            console.error("Register error:", error);
            Alert.alert("Server Error", "Could not connect to the backend.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expense Tracker App</Text>

            <Text style={styles.subtitle}>Enter your full name</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.subtitle}>Enter your email</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            {/* Password with Eye Inside Input */}
            <Text style={styles.subtitle}>Enter your password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder=""
                    secureTextEntry={!showPassword}
                    style={styles.inputWithIcon}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Confirm Password with Eye Inside Input */}
            <Text style={styles.subtitle}>Confirm your password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder=""
                    secureTextEntry={!showConfirmPassword}
                    style={styles.inputWithIcon}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#333" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/loginscreen")}>
                <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#87B56C",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        color: "white",
        marginTop: 10,
        alignSelf: "flex-start",
        marginLeft: "5%",
    },
    input: {
        width: "90%",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    inputWrapper: {
        width: "90%",
        position: "relative",
        marginBottom: 10,
    },
    inputWithIcon: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        paddingRight: 40,
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: 15,
    },
    registerButton: {
        backgroundColor: "#d3d3d3",
        padding: 15,
        borderRadius: 10,
        width: "50%",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    loginText: {
        color: "white",
        marginTop: 20,
        textDecorationLine: "underline",
    },
});