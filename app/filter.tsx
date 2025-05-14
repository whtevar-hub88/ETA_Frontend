import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function FilterScreen() {
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const router = useRouter();

    const applyFilter = () => {
        // Just a placeholder action for now
        Alert.alert("Filter Applied", `Category: ${category || "Any"}\nDate: ${date || "Any"}`);
        router.back(); // Go back to Home
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Filter Expenses</Text>

            <Text style={styles.label}>Category</Text>
            <TextInput
                placeholder="e.g. Food, Transport"
                style={styles.input}
                value={category}
                onChangeText={setCategory}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
                placeholder="YYYY-MM-DD"
                style={styles.input}
                value={date}
                onChangeText={setDate}
            />

            <TouchableOpacity style={styles.button} onPress={applyFilter}>
                <Text style={styles.buttonText}>Apply Filter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF3F0",
        padding: 20,
    },
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        color: "#444",
    },
    input: {
        backgroundColor: "white",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#7A9E7E",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
