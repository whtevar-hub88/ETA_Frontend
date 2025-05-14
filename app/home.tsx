import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format, isSameDay, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import NotificationService from "./services/NotificationService";

const { width } = Dimensions.get("window");

const iconMap: Record<string, any> = {
  Salary: require("../assets/icons/Salary.png"),
  Investments: require("../assets/icons/Investments.png"),
  "Part-Time": require("../assets/icons/Part-Time.png"),
  Bonus: require("../assets/icons/Bonus.png"),
  Housing: require("../assets/icons/Housing.png"),
  Utilities: require("../assets/icons/Utilities.png"),
  Transportation: require("../assets/icons/Transportation.png"),
  Groceries: require("../assets/icons/Groceries.png"),
  Healthcare: require("../assets/icons/Healthcare.png"),
  Education: require("../assets/icons/Education.png"),
  "Childcare & Family": require("../assets/icons/Childcare & Family.png"),
  Insurance: require("../assets/icons/Insurance.png"),
  Entertainment: require("../assets/icons/Entertainment.png"),
  Food: require("../assets/icons/Food.png"),
  Shopping: require("../assets/icons/Shopping.png"),
  Travel: require("../assets/icons/Travel.png"),
  Subscription: require("../assets/icons/Subscription.png"),
  Donation: require("../assets/icons/Donation.png"),
  "Personal Care": require("../assets/icons/Personal Care.png"),
  "Emergency fund": require("../assets/icons/Emergency fund.png"),
  "Retirement savings": require("../assets/icons/Retirement savings.png"),
  "Vacation fund": require("../assets/icons/Vacation fund.png"),
  "Education fund": require("../assets/icons/Education.png"),
  "Finance fund": require("../assets/icons/Finance fund.png"),
  "Bank credits": require("../assets/icons/Bank credits.png"),
  Others: require("../assets/icons/Others.png"),
};

export default function HomeScreen() {
  const router = useRouter();
  const currentDate = new Date();
  const [income, setIncome] = useState<number>(0);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dropdownVisibleIndex, setDropdownVisibleIndex] = useState<number | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchRecords = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log("Token available:", !!token);
      
      if (!token) {
        console.log("No token found, redirecting to login");
        router.replace("/login");
        return;
      }

      const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        console.log("Token expired or invalid, redirecting to login");
        await SecureStore.deleteItemAsync("token");
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        const todayRecords = data.filter((record: any) => {
          const date = record.date ? parseISO(record.date) : new Date();
          return isSameDay(date, currentDate);
        });

        setRecords(todayRecords);

        const totalIncome = todayRecords
          .filter((r: any) => r.type === "income")
          .reduce((sum: number, r: any) => sum + r.amount, 0);
        setIncome(totalIncome);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  const fetchNotifications = async () => {
    const service = NotificationService.getInstance();
    const notifications = await service.getAllNotifications();
    setNotificationCount(notifications.length);
  };

  useEffect(() => {
    fetchRecords();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000); // Poll every 2s for updates
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(useCallback(() => { fetchRecords(); }, []));

  const handleEdit = (index: number) => {
    const record = records[index];
    const route =
      record.type === "income"
        ? "/income"
        : record.budgetCategory === "wants"
        ? "/wants"
        : record.budgetCategory === "needs"
        ? "/needs"
        : record.budgetCategory === "savings"
        ? "/savings"
        : null;

    if (!route) return;

    router.push({
      pathname: route,
      params: {
        editMode: "true",
        index: index.toString(),
        amount: record.amount.toString(),
        note: record.note || "",
        label: record.category,
        type: record.type,
        _id: record._id,
      },
    });

    setDropdownVisibleIndex(null);
  };

  const handleDelete = (index: number) => {
    setSelectedIndex(index);
    setDropdownVisibleIndex(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedIndex === null) return;
    const target = records[selectedIndex];
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await fetch(
        `https://expenses-tracker-8k6o.onrender.com/api/transactions/${target._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const updated = [...records];
        updated.splice(selectedIndex, 1);
        setRecords(updated);
        setShowDeleteConfirm(false);
        setSelectedIndex(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const expenses = records.reduce(
    (total, r) => (r.amount < 0 ? total + Math.abs(r.amount) : total),
    0
  );
  const balance = income - expenses;

  const renderRecord = ({ item, index }: { item: any; index: number }) => {
    const icon = iconMap[item.category] || iconMap["Others"];
    return (
      <View style={[styles.recordRow, { zIndex: dropdownVisibleIndex === index ? 999 : 1 }]}>
        <View style={styles.recordLeft}>
          <View style={styles.recordIconWrap}>
            <Image source={icon} style={styles.recordIcon} />
          </View>
          <View>
            <Text style={styles.recordLabel}>{item.category}</Text>
            {item.note ? <Text style={styles.recordNote}>{item.note}</Text> : null}
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
          <Text style={[styles.recordAmount, { color: item.amount < 0 ? "red" : "green" }]}>
            {item.amount < 0
              ? `- ${Math.abs(item.amount).toLocaleString()}`
              : `${item.amount.toLocaleString()}`}
          </Text>
          {/* Edit Icon */}
          <TouchableOpacity onPress={() => handleEdit(index)} style={{ marginLeft: 8, padding: 6 }}>
            <Ionicons name="pencil-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
          {/* Delete Icon */}
          <TouchableOpacity onPress={() => handleDelete(index)} style={{ marginLeft: 4, padding: 6 }}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Notification Bell Icon */}
        <View style={{ position: 'absolute', left: 24, top: 40, zIndex: 10 }}>
          <TouchableOpacity onPress={() => router.push("/notifications")}
            style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={28} color="#FFD600" />
            {notificationCount > 0 && (
              <View style={{
                position: 'absolute',
                top: 2,
                right: -2,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#2196F3',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: notificationCount > 9 ? 3 : 0,
                borderWidth: 2,
                borderColor: '#fff',
              }}>
                {notificationCount === 1 ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3' }} />
                ) : (
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notificationCount}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/calendar")} style={{ alignSelf: "flex-end" }}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Expense Tracker</Text>
        <View style={styles.toggleContainer} />
      </View>

      {/* Summary */}
      <View style={styles.summaryBar}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{format(currentDate, "dd MMM")}</Text>
          <Text style={styles.dayText}>{format(currentDate, "EEEE")}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryValue}>{income.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryValue}>{expenses.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={styles.summaryValue}>{balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* Records */}
      {!records || records.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          <Image source={require("../assets/images/no-records.png")} style={styles.noRecordsImage} />
          <Text style={styles.noRecordsText}>No Records</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderRecord}
          contentContainerStyle={{ padding: 16 }}
          extraData={dropdownVisibleIndex}
        />
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push("/records")} style={styles.navItem}>
          <Image 
            source={require("../assets/icons/records.png")} 
            style={[styles.navIcon, { tintColor: "#87B56C" }]} 
          />
          <Text style={[styles.navLabel, { color: "#87B56C" }]}>Records</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/charts")} style={styles.navItem}>
          <Image source={require("../assets/icons/charts.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Charts</Text>
        </TouchableOpacity>
        <View style={{ width: 70 }} />
        <TouchableOpacity onPress={() => router.push("/reports")} style={styles.navItem}>
          <Image source={require("../assets/icons/reports.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
          <Ionicons name="person-outline" size={26} color="black" />
          <Text style={styles.navLabel}>Me</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push("/pin-management")}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#666" />
          <Text style={styles.settingsText}>PIN Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={[styles.addButton, { left: width / 2 - 35 }]} onPress={() => router.push("/addExpense")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Delete Confirm */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: "brown", marginBottom: 10, fontSize: 16 }}>Are you sure to delete?</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete}>
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    zIndex: 1,
    overflow: "visible", // ⬅️ important for dropdown visibility
  },
  recordLeft: { flexDirection: "row", alignItems: "center" },
  recordIconWrap: {
    backgroundColor: "#E6E6E6",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  recordIcon: { width: 24, height: 24, tintColor: "black" },
  recordLabel: { fontSize: 14, color: "black" },
  recordNote: { fontSize: 12, color: "gray" },
  recordAmount: { fontSize: 14, fontWeight: "bold" },

  dropdownMenu: {
    position: "absolute",
    top: -65, // ⬆️ move above the row
    right: 0,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 8,
    zIndex: 100,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },

  noRecordsContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noRecordsImage: { width: 90, height: 90, tintColor: "black" },
  noRecordsText: { fontSize: 18, fontWeight: "500", marginTop: 12, color: "black" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#7A9E7E",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: { fontSize: 34, color: "white" },

  navItem: { alignItems: "center", width: (width - 70) / 4 - 5 },
  navLabel: { fontSize: 12, marginTop: 3, color: "black", textAlign: "center" },
  navIcon: { width: 26, height: 26, tintColor: "black" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingHorizontal: 20,
  },

  header: {
    backgroundColor: "#97B77B",
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "black", marginTop: 6 },
  toggleContainer: { flexDirection: "row", marginTop: 16 },
  activeToggle: {
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  inactiveToggle: {
    borderColor: "black",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeToggleText: { color: "white", fontWeight: "600" },
  inactiveToggleText: { color: "black", fontWeight: "600" },

  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateBlock: { alignItems: "center" },
  dateText: { fontSize: 16, fontWeight: "600", color: "black" },
  dayText: { fontSize: 14, color: "#666", marginTop: 2 },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 14, color: "#555", fontWeight: "500" },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: "black", marginTop: 2 },

  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
});
