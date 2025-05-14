import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ResetCodeScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams(); // ✅ Added to access email from previous screen
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [timer, setTimer] = useState<number>(120);

    // 🧠 useRef to store TextInput references
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // ⏱ Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // 👉 Handle OTP digit input
    const handleChange = (text: string, index: number) => {
        if (text.length > 1) return;
        const updatedOtp = [...otp];
        updatedOtp[index] = text;
        setOtp(updatedOtp);

        // Move to next field
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // 🔐 Handle OTP verification with backend
    const handleContinue = async () => {
        if (otp.includes("")) {
            Alert.alert("Error", "Please fill in all the digits.");
            return;
        }

        const code = otp.join(""); // Combine OTP digits into a single string

        try {
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("✅ Verified", "Code is valid!");
                router.push({
                    pathname: "/resetpassword",
                    params: { email, code }, // Pass email and code to next screen
                });
            } else {
                Alert.alert("❌ Invalid Code", data.msg || "Try again.");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to verify code.");
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

            <Image source={require("../assets/images/verify.png")} style={styles.image} />

            <Text style={styles.subtitle}>4-digit code is sent to your email</Text>

            <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpBox}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                    />
                ))}
            </View>

            <Text style={styles.timer}>{timer} sec</Text>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ResetCodeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    image: {
        width: 160,
        height: 160,
        resizeMode: "contain",
        marginBottom: 30,
    },
    subtitle: {
        fontSize: 16,
        color: "white",
        marginBottom: 10,
    },
    otpRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 10,
    },
    otpBox: {
        width: 50,
        height: 60,
        backgroundColor: "#E5E4E2",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 24,
    },
    timer: {
        fontSize: 16,
        color: "white",
        marginVertical: 20,
    },
    button: {
        backgroundColor: "#D9D9D9",
        borderRadius: 20,
        paddingVertical: 15,
        width: "70%",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
});