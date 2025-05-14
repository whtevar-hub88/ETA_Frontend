import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { format} from "date-fns";

type RecordItem = {
  _id: string;
  label?: string;
  amount: number;
  note?: string;
  type: "income" | "expense";
  date?: string;
  category: string;
  budgetCategory?: "needs" | "wants" | "savings";
};

export default function SelectedDateRecordsScreen() {
  const { date } = useLocalSearchParams();
  const router = useRouter();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RecordItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchRecords = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const formattedDate = format((date as string), "yyyy-MM-dd");

      const res = await axios.get(
        `https://expenses-tracker-8k6o.onrender.com/api/transactions/date/${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data: RecordItem[] = Array.isArray(res.data) ? res.data : [];
      setRecords(data);
      applyFilter(data, filter);
      calculateSummary(data);
    } catch (error) {
      console.error("❌ Error fetching records:", error);
    }
  };

  const calculateSummary = (data: RecordItem[]) => {
    let income = 0,
      expenses = 0,
      savings = 0;
    for (const r of data) {
      if (r.type === "income") income += r.amount;
      else if (r.budgetCategory === "savings") savings += Math.abs(r.amount);
      else expenses += Math.abs(r.amount);
    }
    setSummary({ income, expenses, savings });
  };

  const applyFilter = (source: RecordItem[], type: typeof filter) => {
    setFilteredRecords(type === "all" ? source : source.filter((r) => r.type === type));
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      const token = await SecureStore.getItemAsync("token");
      await axios.delete(
        `https://expenses-tracker-8k6o.onrender.com/api/transactions/${selectedRecord._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = records.filter((r) => r._id !== selectedRecord._id);
      setRecords(updated);
      applyFilter(updated, filter);
      calculateSummary(updated);
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("❌ Failed to delete record:", error);
    }
  };

  const handleEdit = (item: RecordItem) => {
    const route =
      item.type === "income" ? "/income" : `/${item.budgetCategory || "addExpense"}`;

    router.push({
      pathname: route as any,
      params: {
        editMode: "true",
        _id: item._id,
        amount: item.amount.toString(),
        note: item.note || "",
        label: item.label || item.category,
        type: item.type,
        budgetCategory: item.budgetCategory || "",
        date: item.date ?? "",
      },
    });
  };

  const handleAdd = () => {
    router.push({
      pathname: "/addExpense",
      params: { date: date as string },
    });
  };

  useEffect(() => {
    if (date) fetchRecords();
  }, [date]);

  useEffect(() => {
    applyFilter(records, filter);
  }, [filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {format(new Date(date as string), "dd MMM yyyy")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {["all", "income", "expense"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type as typeof filter)}
            style={[
              styles.filterButton,
              filter === type && { backgroundColor: "#97B77B" },
            ]}
          >
            <Text style={{ color: filter === type ? "#fff" : "#444", fontWeight: "600" }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Income: {summary.income.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Expenses: {summary.expenses.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Savings: {summary.savings.toLocaleString()}</Text>
      </View>

      <FlatList
        data={filteredRecords}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchRecords();
              setRefreshing(false);
            }}
          />
        }
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={64} color="gray" />
            <Text style={styles.emptyText}>No records for this filter</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const icon =
            item.type === "income"
              ? "arrow-down-circle"
              : item.budgetCategory === "savings"
              ? "wallet"
              : "arrow-up-circle";
          const color =
            item.type === "income"
              ? "#2ecc71"
              : item.budgetCategory === "savings"
              ? "#3498db"
              : "#e74c3c";
          const tag =
            item.type === "income"
              ? "💰 Income"
              : item.budgetCategory === "savings"
              ? "🏦 Savings"
              : item.budgetCategory === "needs"
              ? "🛒 Needs"
              : "🎉 Wants";

          return (
            <View style={styles.recordItem}>
              <Ionicons name={icon as any} size={20} color={color} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{item.label?.trim() || item.category}</Text>
                <Text style={{ fontSize: 12, color }}>{tag}</Text>
                {item.note ? (
                  <Text style={{ color: "gray", fontSize: 13 }}>{item.note}</Text>
                ) : null}
              </View>
              <Text style={{ fontWeight: "600", color }}>{Math.abs(item.amount).toLocaleString()}</Text>
              <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginLeft: 10 }}>
                <Ionicons name="create-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRecord(item);
                  setShowDeleteConfirm(true);
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Delete Confirm Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: "brown", marginBottom: 10, fontSize: 16 }}>
              Are you sure you want to delete?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={{ fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={{ fontSize: 16, color: "red" }}>Confirm</Text>
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
  header: {
    backgroundColor: "#97B77B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "black" },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "gray",
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#97B77B",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
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
});
