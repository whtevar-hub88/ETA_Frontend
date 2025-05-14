import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GoogleLoginScreen = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Expense Tracker App</Text>

            <Text style={styles.subText}>Sign in with google</Text>

            <View style={styles.card}>
                <Image source={require("../assets/icons/google.png")} style={styles.appIcon} />

                <Text style={styles.cardTitle}>Choose an account to continue to Expense</Text>

                {/* Google Account Options */}
                <TouchableOpacity style={styles.accountRow}>
                    <Ionicons name="person-circle" size={28} color="#D26EFF" />
                    <View style={styles.accountLines}>
                        <View style={styles.line} />
                        <View style={styles.line} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.accountRow}>
                    <Ionicons name="person-circle" size={28} color="#8B7EFF" />
                    <View style={styles.accountLines}>
                        <View style={styles.line} />
                        <View style={styles.line} />
                    </View>
                </TouchableOpacity>

                {/* Add Another Account */}
                <TouchableOpacity style={styles.addAccountRow} onPress={() => router.push("/home")}>
                    <Ionicons name="person-add" size={22} color="black" />
                    <Text style={styles.addAccountText}>Add another account</Text>
                </TouchableOpacity>
            </View>

            
        </View>
    );
};

export default GoogleLoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#7A9E7E",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 26,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    subText: {
        fontSize: 16,
        color: "white",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#E1E1E1",
        width: "100%",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
    },
    appIcon: {
        width: 60,
        height: 60,
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 16,
        color: "black",
        marginBottom: 20,
        textAlign: "center",
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
    },
    accountLines: {
        flex: 1,
        marginLeft: 10,
    },
    line: {
        height: 6,
        backgroundColor: "#B8B8B8",
        borderRadius: 3,
        marginVertical: 3,
        width: "90%",
    },
    addAccountRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    addAccountText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "500",
    },
    footerText: {
        position: "absolute",
        bottom: 30,
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
    },
});
