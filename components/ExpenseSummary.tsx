import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ExpenseSummary = () => {
    const router = useRouter();

    return (
        <View style={styles.summaryContainer}>
        

            <View style={styles.summaryItem}>
                <Text style={styles.label}>Expenses</Text>
                <Text style={styles.value}>0</Text>
            </View>

            <View style={styles.summaryItem}>
                <Text style={styles.label}>Income</Text>
                <Text style={styles.value}>0</Text>
            </View>

            <View style={styles.summaryItem}>
                <Text style={styles.label}>Balance</Text>
                <Text style={styles.value}>0</Text>
            </View>
        </View>
    );
};

export default ExpenseSummary;

const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#9B6A6C",
    },
    monthText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        textAlign: "left",
    },
    summaryItem: {
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        color: "white",
    },
    value: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
});
