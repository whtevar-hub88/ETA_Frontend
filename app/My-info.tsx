// screens/my-info.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function MyInfoScreen() {
    const router = useRouter();
    const [info, setInfo] = useState({
        documentName: "",
        documentNumber: "",
        dob: "",
        address: "",
        age: "",
        gender: "",
    });

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("myInfo");
            if (saved) setInfo(JSON.parse(saved));
        })();
    }, []);

    const saveInfo = async () => {
        await AsyncStorage.setItem("myInfo", JSON.stringify(info));
        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.header}>My Information</Text>

            {(Object.keys(info) as (keyof typeof info)[]).map((key) => (

                <View key={key} style={styles.fieldBox}>
                    <Text style={styles.label}>{key.replace(/([A-Z])/g, " $1")}:</Text>
                    <TextInput
                        style={styles.input}
                        value={info[key]}
                        onChangeText={(text) => setInfo({ ...info, [key]: text })}
                        placeholder={`Enter ${key}`}
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={saveInfo}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50, backgroundColor: "#fff", flexGrow: 1 },
    back: { position: "absolute", top: 50, left: 20 },
    header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    fieldBox: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: "#6CC551",
        marginTop: 20,
        padding: 14,
        alignItems: "center",
        borderRadius: 8,
    },
    saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
