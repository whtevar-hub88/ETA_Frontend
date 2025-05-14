import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
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
            return Alert.alert("All fields are required.");
        }

        if (password !== confirmPassword) {
            return Alert.alert("Passwords do not match.");
        }

        // Backend API call from first code
        try {
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("Registration Successful", "You can now log in.", [
                    { text: "OK", onPress: () => router.push("/loginscreen") }
                ]);
            } else {
                Alert.alert("Registration Failed", data.msg || "Try again.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not connect to server.");
            console.error("Registration error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Expense Tracker App</Text>
                <Image source={require("../assets/images/pig.png")} style={styles.image} />
                <Text style={styles.subtitle}>No problem. Let's get you signed in.</Text>

                <Text style={styles.label}>Enter your full name</Text>
                <TextInput
                    style={styles.input}
                    placeholder=""
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Enter your email</Text>
                <TextInput
                    style={styles.input}
                    placeholder=""
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>Enter your password</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                            size={22}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm your password</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                            size={22}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#87B56C",
        padding: 30,
        borderRadius: 30,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: "90%",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 14,
        color: "white",
        marginVertical: 10,
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    label: {
        color: "white",
        fontSize: 15,
        width: "100%",
        marginTop: 10,
    },
    input: {
        backgroundColor: "#DDE1D4",
        width: "100%",
        padding: 12,
        borderRadius: 10,
        marginTop: 5,
        paddingRight: 40,
        borderWidth: 1,
        borderColor: "#87B56C",
    },
    inputWrapper: {
        width: "100%",
        position: "relative",
        justifyContent: "center",
    },
    eyeIcon: {
        position: "absolute",
        right: 12,
        top: 18,
    },
    button: {
        backgroundColor: "#87B56C",
        padding: 15,
        width: "100%",
        borderRadius: 10,
        alignItems: "center",
        marginTop: 15,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
});