import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BottomNav = () => {
    const router = useRouter();

    return (
        <View style={styles.navContainer}>
            <TouchableOpacity onPress={() => router.push("/records")}>
                <Ionicons name="document-text-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/charts")}>
                <Ionicons name="bar-chart-outline" size={28} color="white" />
            </TouchableOpacity>

            {/* Floating Center + Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/addExpense")}>
                <Text style={styles.addText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/reports")}>
                <Ionicons name="stats-chart-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/profile")}>
                <Ionicons name="person-outline" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default BottomNav;

const styles = StyleSheet.create({
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#6B4F4F",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 10,
    },
    addButton: {
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: [{ translateX: -35 }],
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#7A9E7E",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        zIndex: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addText: {
        fontSize: 36,
        color: "white",
    },
});
