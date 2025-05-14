// screens/bank-accounts.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function BankAccountsScreen() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [newAccount, setNewAccount] = useState({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        ifsc: "",
    });

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem("bankAccounts");
            if (stored) setAccounts(JSON.parse(stored));
        })();
    }, []);

    const saveAccounts = async (data: any[]) => {
        setAccounts(data);
        await AsyncStorage.setItem("bankAccounts", JSON.stringify(data));
    };

    const addAccount = () => {
        if (!newAccount.bankName || !newAccount.accountNumber) return;
        const updated = [...accounts, newAccount];
        saveAccounts(updated);
        setNewAccount({ bankName: "", accountNumber: "", accountHolder: "", ifsc: "" });
    };

    const removeAccount = (index: number) => {
        const updated = accounts.filter((_, i) => i !== index);
        saveAccounts(updated);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.header}>Bank Accounts</Text>

            {accounts.map((acc, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.label}>Bank: {acc.bankName}</Text>
                    <Text style={styles.label}>Account No: {acc.accountNumber}</Text>
                    <Text style={styles.label}>Holder: {acc.accountHolder}</Text>
                    <Text style={styles.label}>IFSC: {acc.ifsc}</Text>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeAccount(index)}
                    >
                        <Ionicons name="trash" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            ))}

            <Text style={styles.subHeader}>Add New Account</Text>
            {(Object.keys(newAccount) as (keyof typeof newAccount)[]).map((key) => (
                <TextInput
                    key={key}
                    placeholder={key.replace(/([A-Z])/g, " $1")}
                    style={styles.input}
                    value={newAccount[key]}
                    onChangeText={(text) =>
                        setNewAccount((prev) => ({ ...prev, [key]: text }))
                    }
                />
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={addAccount}>
                <Text style={styles.addText}>Add Account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50, backgroundColor: "#fff", flexGrow: 1 },
    back: { position: "absolute", top: 50, left: 20 },
    header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    subHeader: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
    card: {
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
        position: "relative",
    },
    deleteBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#D9534F",
        padding: 6,
        borderRadius: 6,
    },
    label: { fontSize: 14, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 10,
    },
    addBtn: {
        backgroundColor: "#6CC551",
        padding: 14,
        alignItems: "center",
        borderRadius: 8,
    },
    addText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
