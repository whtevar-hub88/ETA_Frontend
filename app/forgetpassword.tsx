import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const ForgetPasswordScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert("Validation", "Please enter your email.");
            return;
        }

        try {
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("Success", "Code sent to your email!");
                router.push(`/resetcode?email=${encodeURIComponent(email)}`);
            } else {
                Alert.alert("Failed", data.msg || "Something went wrong");
            }
        } catch (err) {
            Alert.alert("Error", "Could not connect to server.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.heading}>Expense Tracker App</Text>

            <Image
                source={require("../assets/images/Frame.png")}
                style={styles.image}
                resizeMode="contain"
            />

            <Text style={styles.title}>Forgot Your Password ?</Text>
            <Text style={styles.description}>
                Don't worry ! It happens. Please{"\n"}enter your email.{"\n"}We will send you the OTP there.
            </Text>

            <TextInput
                placeholder="example@gmail.com"
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        fontSize: 22,
        fontWeight: "600",
        color: "white",
        marginBottom: 10,
    },
    image: {
        width: 200,
        height: 180,
        marginVertical: 20,
    },
    title: {
        fontSize: 20,
        color: "white",
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: "white",
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 22,
    },
    input: {
        backgroundColor: "#E5E4E2",
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
        width: "90%",
    },
    button: {
        backgroundColor: "#D9D9D9",
        padding: 15,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 20,
        width: "60%",
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#000",
    },
});
