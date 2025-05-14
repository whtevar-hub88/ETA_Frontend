import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

export default function ProfileDetailScreen() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        userId: "",
        gender: "Other",
        avatar: "😺",
    });
    const [editingGender, setEditingGender] = useState(false);
    const [editingField, setEditingField] = useState<null | "nickname" | "id">(null);
    const [tempValue, setTempValue] = useState("");
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [linkedAccount, setLinkedAccount] = useState<any>(null);
    const emojis = ["😺", "🐶", "🐸", "🐵", "🦊", "🐰", "🐨", "🦄", "🐼", "🐷"];
    const greenColor = "#87B56C";

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            const storedGender = await AsyncStorage.getItem("gender");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                const userId = `24${randomNum}`;
                
                if (!parsed._id) {
                    const updatedUser = { ...parsed, _id: userId };
                    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                }

                setUserInfo({
                    name: parsed.name || "",
                    email: parsed.email || "",
                    userId: parsed._id || userId,
                    gender: storedGender || "Other",
                    avatar: parsed.avatar || "😺",
                });
            }
        };

        loadUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchLinkedAccount = async () => {
                const linked = await AsyncStorage.getItem('linkedBankAccount');
                if (linked) setLinkedAccount(JSON.parse(linked));
                else setLinkedAccount(null);
            };
            fetchLinkedAccount();
        }, [])
    );

    const handleGenderChange = async (value: string) => {
        setUserInfo(prev => ({ ...prev, gender: value }));
        await AsyncStorage.setItem("gender", value);
        setGenderModalVisible(false);
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace("/loginscreen");
                    }
                }
            ]
        );
    };

    const confirmEdit = () => {
        if (editingField) {
            setUserInfo(prev => ({
                ...prev,
                [editingField === "nickname" ? "name" : "userId"]: tempValue,
            }));
            setEditingField(null);
            setTempValue("");
        }
    };

    const confirmAvatar = (emoji: string) => {
        setUserInfo(prev => ({ ...prev, avatar: emoji }));
        setAvatarModalVisible(false);
    };

    const confirmDeleteAccount = async () => {
        await AsyncStorage.clear();
        router.replace("/loginscreen");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Profile</Text>

            <ScrollView style={styles.scrollContainer}>
                {linkedAccount && (
                    <View style={[styles.row, { borderColor: '#6CC551', borderWidth: 2, marginBottom: 10 }]}> 
                        <Text style={[styles.label, { color: '#6CC551', fontWeight: 'bold' }]}>Linked Bank Account</Text>
                        <Text style={styles.value}>{linkedAccount.accountHolder} (****{linkedAccount.accountNumber?.slice(-4)})</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setAvatarModalVisible(true)}
                >
                    <Text style={styles.label}>My Avatar</Text>
                    <View style={styles.rowRight}>
                        <Text style={{ fontSize: 24 }}>{userInfo.avatar}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* ID field (unclickable) */}
                <TouchableOpacity style={styles.row} activeOpacity={1}>
                    <Text style={styles.label}>ID</Text>
                    <Text style={styles.value}>{userInfo.userId}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                        setEditingField("nickname");
                        setTempValue(userInfo.name);
                    }}
                >
                    <Text style={styles.label}>Nickname</Text>
                    <Text style={styles.value}>{userInfo.name}</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{userInfo.email}</Text>
                </View>

                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setGenderModalVisible(true)}
                >
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.rowRight}>
                        <Text style={styles.value}>{userInfo.gender}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
                    <Text style={styles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>

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

            {/* Edit Nickname Modal */}
            <Modal visible={editingField !== null} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.editPopupContainer}>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: "#D9D9D9" }]}
                            value={tempValue}
                            onChangeText={setTempValue}
                            placeholder="Enter new value"
                            placeholderTextColor="#999"
                        />
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={() => setEditingField(null)}
                            >
                                <Ionicons name="close" size={30} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={confirmEdit}
                            >
                                <Ionicons name="checkmark" size={30} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Avatar Modal */}
            <Modal visible={avatarModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.editPopupContainer}>
                        <FlatList
                            data={emojis}
                            numColumns={5}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => confirmAvatar(item)}>
                                    <Text style={{ fontSize: 28, margin: 8 }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.uploadButton}>
                            <Text style={{ color: "#000" }}>Upload from Device</Text>
                        </TouchableOpacity>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={() => setAvatarModalVisible(false)}
                            >
                                <Ionicons name="close" size={30} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Gender Modal */}
            <Modal visible={genderModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.editPopupContainer}>
                        {["Male", "Female", "Other"].map((gender, index) => (
                            <TouchableOpacity
                                key={gender}
                                style={[styles.genderButton, { backgroundColor: greenColor }]}
                                onPress={() => handleGenderChange(gender)}
                            >
                                <Text style={{ color: "#000", fontWeight: "bold" }}>{gender}</Text>
                            </TouchableOpacity>
                        ))}
                        <Text
                            style={{ marginTop: 10, fontSize: 14, color: "#555" }}
                            onPress={() => handleGenderChange("I don't want to reveal")}
                        >
                            I don't want to reveal
                        </Text>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={() => setGenderModalVisible(false)}
                            >
                                <Ionicons name="close" size={30} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.editPopupContainer}>
                        <Text style={{ fontSize: 16, marginBottom: 20, color: "#000", textAlign: "center" }}>
                            Do you really want to delete your account?
                        </Text>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Ionicons name="close" size={30} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: greenColor }]}
                                onPress={confirmDeleteAccount}
                            >
                                <Ionicons name="checkmark" size={30} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    backButton: { position: "absolute", top: 55, left: 20, zIndex: 2 },
    title: {
        paddingTop: 55,
        fontSize: 24,
        textAlign: "center",
        fontWeight: "bold",
        backgroundColor: "#87B56C",
        color: "#000",
        paddingBottom: 15,
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    row: {
        backgroundColor: "#ddd",
        borderBottomWidth: 1,
        borderBottomColor: "#aaa",
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    label: {
        fontSize: 16,
        color: "#333",
    },
    value: {
        fontSize: 16,
        color: "#666",
    },
    signOutButton: {
        backgroundColor: "#6c757d",
        marginTop: 30,
        marginHorizontal: 40,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#d9534f",
        marginTop: 10,
        marginHorizontal: 40,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 50,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    editPopupContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        width: "85%",
        alignItems: "center",
    },
    textInput: {
        borderRadius: 10,
        padding: 10,
        width: "100%",
        marginBottom: 15,
    },
    popupButtons: {
        flexDirection: "row",
        gap: 20,
        marginTop: 15,
    },
    modalButton: {
        padding: 10,
        borderRadius: 10,
    },
    uploadButton: {
        backgroundColor: "#D9D9D9",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
    genderButton: {
        width: "100%",
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
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
