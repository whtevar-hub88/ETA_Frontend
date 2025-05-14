import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import NotificationService from "./services/NotificationService";

const { width } = Dimensions.get("window");

const SavingsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("Savings");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const isEditMode = params?.editMode === "true";

  useEffect(() => {
    if (isEditMode && params.label) {
      setSelectedLabel(params.label as string);
      setAmount(params.amount as string);
      setNote(params.note as string);
      setEditId(params._id as string);
      setModalVisible(true);
      setIsTyping(false);
    }
  }, []);

  const categories = [
    { label: "Emergency fund", icon: require("../assets/icons/Emergency fund.png") },
    { label: "Retirement savings", icon: require("../assets/icons/Retirement savings.png") },
    { label: "Vacation fund", icon: require("../assets/icons/Vacation fund.png") },
    { label: "Education fund", icon: require("../assets/icons/Education.png") },
    { label: "Finance fund", icon: require("../assets/icons/Finance fund.png") },
    { label: "Bank credits", icon: require("../assets/icons/Bank credits.png") },
    { label: "Others", icon: require("../assets/icons/Others.png") },
  ];

  const tabs = [
    { label: "Income", route: "/income" },
    { label: "Wants", route: "/wants" },
    { label: "Needs", route: "/needs" },
    { label: "Savings", route: "/savings" },
  ];

  const handleCategoryPress = (label: string) => {
    setSelectedLabel(label);
    setAmount("");
    setNote("");
    setEditId(null);
    setIsTyping(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLabel(null);
    setAmount("");
    setNote("");
    setEditId(null);
    setIsTyping(false);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || !selectedLabel) {
      alert("Please select a category and enter a valid amount");
      return;
    }

    const token = await SecureStore.getItemAsync("token");

    const payload = {
      type: "expense",
      category: selectedLabel,
      amount: -Math.abs(parseFloat(amount)),
      note,
      budgetCategory: "savings",
      date: editId ? params.date : new Date().toISOString(), 
    };

    const endpoint = editId
      ? `https://expenses-tracker-8k6o.onrender.com/api/transactions/${editId}`
      : "https://expenses-tracker-8k6o.onrender.com/api/transactions";

    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`${editId ? "📝 Updated" : "✅ Added"} savings:`, data.transaction);
        setPopupMessage(`Savings: ${amount} (${selectedLabel})`);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 4000);
        const notificationService = NotificationService.getInstance();
        notificationService.addNotification(`Savings: ${amount} (${selectedLabel})`, "Transaction");
        setTimeout(() => {
          closeModal();
          router.push("/home");
        }, 3000);
      } else {
        alert(data.msg || "Failed to save transaction");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit" : "Add"}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onPress={() => {
              if (selectedTab !== tab.label) {
                router.push(tab.route as any);
                setSelectedTab(tab.label);
              }
            }}
            style={[styles.tab, selectedTab === tab.label && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === tab.label && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity key={index} style={styles.item} onPress={() => handleCategoryPress(item.label)}>
            <View style={styles.iconWrapper}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalPanel}>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountDisplay}>
                {amount ? parseFloat(amount).toLocaleString() : "0"}
              </Text>
            </View>

            <View style={styles.noteInputRow}>
              <Text style={styles.noteLabel}>Note:</Text>
              <TextInput
                style={styles.noteField}
                placeholder="Enter a note.."
                placeholderTextColor="#555"
                value={note}
                onChangeText={setNote}
              />
            </View>

            <View style={styles.keypad}>
              {["7", "8", "9", "*", "4", "5", "6", "+", "1", "2", "3", "-", ".", "0", "×", "✓"].map(
                (key, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.key, key === "✓" && styles.checkKey, key === "×" && styles.clearKey]}
                    onPress={() => {
                      if (key === "✓") return handleSubmit();
                      if (key === "×") return setAmount((prev) => prev.slice(0, -1));
                      if (["*", "+", "-"].includes(key)) return;

                      setAmount((prev) => {
                        if (!isTyping) {
                          setIsTyping(true);
                          return key;
                        }
                        return prev + key;
                      });
                    }}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>

      {showPopup && (
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, zIndex: 999, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#6CC551', padding: 16, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{popupMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    backgroundColor: "#97B77B",
  },
  tab: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  activeTab: {
    backgroundColor: "black",
  },
  tabText: {
    fontSize: 14,
    color: "black",
  },
  activeTabText: {
    color: "white",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 25,
  },
  item: {
    width: width / 3.3,
    alignItems: "center",
    marginVertical: 15,
  },
  iconWrapper: {
    backgroundColor: "#E6E6E6",
    borderRadius: 50,
    padding: 15,
    marginBottom: 6,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: "black",
    resizeMode: "contain",
  },
  label: {
    fontSize: 13,
    color: "black",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalPanel: {
    backgroundColor: "#D9D9D9",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  amountDisplayContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  noteInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
    marginRight: 6,
  },
  noteField: {
    fontSize: 16,
    color: "black",
    flex: 1,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  key: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 6,
  },
  keyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
  },
  checkKey: {
    backgroundColor: "#7A9E7E",
  },
  clearKey: {
    backgroundColor: "#FFBABA",
  },
});

export default SavingsScreen;
