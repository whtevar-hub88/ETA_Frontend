// app/settings.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Switch, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

export default function SettingsScreen() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [transactionNotifications, setTransactionNotifications] = useState(true);
    const [isPinSet, setIsPinSet] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));
    const [transactionScaleAnim] = useState(new Animated.Value(1));
    const [iconScaleAnim] = useState(new Animated.Value(1));
    const [transactionIconScaleAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const notificationsEnabled = await AsyncStorage.getItem("notificationsEnabled");
            const transactionNotifications = await AsyncStorage.getItem("transactionNotifications");
            const pinSet = await SecureStore.getItemAsync("isPinSet");
            
            setNotificationsEnabled(notificationsEnabled !== "false");
            setTransactionNotifications(transactionNotifications !== "false");
            setIsPinSet(pinSet === "true");
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const animateToggle = (scaleAnim: Animated.Value, iconScaleAnim: Animated.Value) => {
        // Scale down animation
        Animated.sequence([
            // Scale down
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
            // Scale up
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
        ]).start();

        // Icon bounce animation
        Animated.sequence([
            Animated.spring(iconScaleAnim, {
                toValue: 1.2,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
            Animated.spring(iconScaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
        ]).start();
    };

    const handleNotificationsToggle = async (value: boolean) => {
        animateToggle(scaleAnim, iconScaleAnim);
        try {
            await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(value));
            setNotificationsEnabled(value);
            if (!value) {
                setTransactionNotifications(false);
                await AsyncStorage.setItem("transactionNotifications", "false");
            }
        } catch (error) {
            console.error("Error saving notification settings:", error);
        }
    };

    const handleTransactionNotificationsToggle = async (value: boolean) => {
        animateToggle(transactionScaleAnim, transactionIconScaleAnim);
        try {
            await AsyncStorage.setItem("transactionNotifications", JSON.stringify(value));
            setTransactionNotifications(value);
        } catch (error) {
            console.error("Error saving transaction notification settings:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 26 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    {!isPinSet ? (
                        <TouchableOpacity 
                            style={styles.option} 
                            onPress={() => router.push("/pin-setup")}
                        >
                            <View style={styles.optionLeft}>
                                <Ionicons name="lock-closed-outline" size={24} color="#6CC551" />
                                <Text style={styles.optionText}>Set Up PIN</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.option} 
                                onPress={() => router.push("/change-pin")}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons name="key-outline" size={24} color="#6CC551" />
                                    <Text style={styles.optionText}>Change PIN</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.option} 
                                onPress={() => router.push("/remove-pin")}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                                    <Text style={[styles.optionText, { color: "#FF3B30" }]}>Remove PIN</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#666" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <Animated.View 
                        style={[
                            styles.option,
                            { transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <View style={styles.optionLeft}>
                            <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
                                <Ionicons 
                                    name="notifications-outline" 
                                    size={24} 
                                    color={notificationsEnabled ? "#6CC551" : "#999"} 
                                />
                            </Animated.View>
                            <Text style={[
                                styles.optionText,
                                !notificationsEnabled && styles.disabledText
                            ]}>
                                Enable Notifications
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationsToggle}
                            trackColor={{ false: "#E0E0E0", true: "#6CC551" }}
                            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                        />
                    </Animated.View>

                    <Animated.View 
                        style={[
                            styles.option,
                            { transform: [{ scale: transactionScaleAnim }] },
                            !notificationsEnabled && styles.disabledOption
                        ]}
                    >
                        <View style={styles.optionLeft}>
                            <Animated.View style={{ transform: [{ scale: transactionIconScaleAnim }] }}>
                                <Ionicons 
                                    name="cash-outline" 
                                    size={24} 
                                    color={transactionNotifications ? "#6CC551" : "#999"} 
                                />
                            </Animated.View>
                            <Text style={[
                                styles.optionText,
                                !transactionNotifications && styles.disabledText
                            ]}>
                                Transaction Notifications
                            </Text>
                        </View>
                        <Switch
                            value={transactionNotifications}
                            onValueChange={handleTransactionNotificationsToggle}
                            trackColor={{ false: "#E0E0E0", true: "#6CC551" }}
                            thumbColor={transactionNotifications ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                            disabled={!notificationsEnabled}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/records")} style={styles.navItem}>
                    <Image source={require("../assets/icons/records.png")} style={styles.navIcon} />
                    <Text style={styles.navLabel}>Records</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/charts")} style={styles.navItem}>
                    <Image source={require("../assets/icons/charts.png")} style={styles.navIcon} />
                    <Text style={styles.navLabel}>Charts</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/addExpense")} style={styles.fabButtonContainer}>
                    <View style={styles.fabButton}>
                        <Text style={styles.fabText}>+</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/reports")} style={styles.navItem}>
                    <Image source={require("../assets/icons/reports.png")} style={styles.navIcon} />
                    <Text style={styles.navLabel}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
                    <Ionicons name="person-outline" size={26} color="#87B56C" />
                    <Text style={[styles.navLabel, { color: "#87B56C" }]}>Me</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    header: {
        backgroundColor: "#97B77B",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "black",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    disabledOption: {
        opacity: 0.5,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 12,
    },
    disabledText: {
        color: "#999",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    navItem: { 
        alignItems: "center", 
        width: (width - 70) / 4 - 5 
    },
    navLabel: { 
        fontSize: 12, 
        marginTop: 3, 
        color: "black", 
        textAlign: "center" 
    },
    navIcon: { 
        width: 26, 
        height: 26, 
        tintColor: "black" 
    },
    fabButtonContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -30,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    fabButton: {
        backgroundColor: "#A1B97A",
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
    },
    fabText: {
        fontSize: 34,
        color: "black",
    },
});
