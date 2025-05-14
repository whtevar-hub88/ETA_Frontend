import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

const { width } = Dimensions.get("window");
const barWidth = width - 60;

const targetPercents = {
  Needs: 50,
  Wants: 30,
  Savings: 20,
};

export default function ProgressBarScreen() {
  const router = useRouter();
  const [income, setIncome] = useState(0);
  const [stats, setStats] = useState({ needs: 0, wants: 0, savings: 0 });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");
      
      if (!token) {
        console.log("No token found, redirecting to login");
        router.replace("/login");
        return;
      }

      const res = await axios.get(
        "https://expenses-tracker-8k6o.onrender.com/api/transactions/budget",
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );

      if (res.status === 401) {
        console.log("Token expired or invalid, redirecting to login");
        await SecureStore.deleteItemAsync("token");
        router.replace("/login");
        return;
      }

      const { budgetStats } = res.data;
      setIncome(budgetStats.totalIncome || 0);
      setStats({
        needs: Math.abs(budgetStats.needs || 0),
        wants: Math.abs(budgetStats.wants || 0),
        savings: Math.abs(budgetStats.savings || 0),
      });

      setError(false);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        await SecureStore.deleteItemAsync("token");
        router.replace("/login");
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderBar = (label: keyof typeof targetPercents) => {
    const spent = stats[label.toLowerCase() as keyof typeof stats];
    const target = targetPercents[label];
    const spentPercent = income ? (spent / income) * 100 : 0;
    const targetWidth = (target / 100) * barWidth;
    const spentWidth = Math.min((spentPercent / 100) * barWidth, barWidth);
    const spentColor = spentPercent > target ? "red" : "green";
    const allocated = (target / 100) * income;
    const remaining = allocated - spent;

    return (
      <View key={label} style={styles.section}>
        <TouchableOpacity onPress={() => setExpanded(expanded === label ? null : label)}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.barContainer}>
            <View style={styles.baseBar}>
              <View style={[styles.innerBar, { width: targetWidth, backgroundColor: "#4285F4" }]} />
            </View>
            <Text style={styles.percentText}>{target}%</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.baseBar}>
              <View style={[styles.innerBar, { width: spentWidth, backgroundColor: spentColor }]} />
            </View>
            <Text style={[styles.percentText, { color: spentColor }]}>{Math.round(spentPercent)}%</Text>
          </View>
        </TouchableOpacity>

        {expanded === label && (
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text>Total Income</Text>
              <Text>{income.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Allocated</Text>
              <Text>{allocated.toFixed(0)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Spent</Text>
              <Text>{spent.toFixed(0)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Remaining</Text>
              <Text>{remaining.toFixed(0)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const totalSpent = stats.needs + stats.wants + stats.savings;
  const overall = income ? Math.round((totalSpent / income) * 100) : 0;
  const overspent = {
    Needs: stats.needs > income * 0.5,
    Wants: stats.wants > income * 0.3,
    Savings: stats.savings > income * 0.2,
  };
  const tipCount = Object.values(overspent).filter(Boolean).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#97B77B" />
        <Text style={{ marginTop: 10 }}>Loading budget stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", marginBottom: 10 }}>Something went wrong.</Text>
        <TouchableOpacity onPress={() => router.push("/home")} style={styles.retryBtn}>
          <Text style={{ color: "#fff" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Expense Tracker</Text>
        </View>

        <View style={styles.content}>
          {["Needs", "Wants", "Savings"].map((item) => renderBar(item as keyof typeof targetPercents))}

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#4285F4" }]} />
              <Text>Target</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "green" }]} />
              <Text>Under budget</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "red" }]} />
              <Text>Over budget</Text>
            </View>
          </View>

          <View style={styles.circleWrapper}>
            <Text style={styles.circleTitle}>Overall Balance</Text>
            <View style={[styles.circle, { borderColor: overall <= 100 ? "green" : "red" }]}>
              <Text style={{ fontSize: 18, fontWeight: "600" }}>{overall}%</Text>
              <TouchableOpacity onPress={() => setTipsVisible(!tipsVisible)} style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={20} color="black" />
                <Text style={styles.tipCount}>{tipCount}</Text>
              </TouchableOpacity>
            </View>

            {tipsVisible && (
              <View style={{ marginTop: 20 }}>
                {overspent.Needs && <Text style={styles.tipText}>⚠️ Try reducing your Needs expenses.</Text>}
                {overspent.Wants && <Text style={styles.tipText}>⚠️ Wants category is nearing limit.</Text>}
                {overspent.Savings && <Text style={styles.tipText}>✅ Good job! You're saving more than expected.</Text>}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push("/records")} style={styles.navItem}>
          <Image 
            source={require("../assets/icons/records.png")} 
            style={[styles.navIcon, { tintColor: "#000" }]} 
          />
          <Text style={styles.navLabel}>Records</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/charts")} style={styles.navItem}>
          <Image 
            source={require("../assets/icons/charts.png")} 
            style={[styles.navIcon, { tintColor: "#000" }]} 
          />
          <Text style={styles.navLabel}>Charts</Text>
        </TouchableOpacity>
        <View style={{ width: 70 }} />
        <TouchableOpacity onPress={() => router.push("/reports")} style={styles.navItem}>
          <Image 
            source={require("../assets/icons/reports.png")} 
            style={[styles.navIcon, { tintColor: "#87B56C" }]} 
          />
          <Text style={[styles.navLabel, { color: "#87B56C" }]}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
          <Ionicons name="person-outline" size={26} color="#000" />
          <Text style={styles.navLabel}>Me</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.addButton, { left: width / 2 - 35 }]} onPress={() => router.push("/addExpense")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#97B77B",
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#000" },
  content: { padding: 20 },
  section: {
    marginBottom: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 14,
    padding: 14,
  },
  label: { fontWeight: "600", fontSize: 15, marginBottom: 10 },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  baseBar: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ddd",
    overflow: "hidden",
    marginRight: 10,
  },
  innerBar: {
    height: 20,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
    textAlign: 'right',
  },
  detailsBox: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  legend: { marginTop: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  circleWrapper: { alignItems: "center", padding: 20, marginTop: 20 },
  circleTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tipIcon: {
    position: "absolute",
    top: -12,
    right: -12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  tipCount: { marginLeft: 4, fontWeight: "600" },
  tipText: { marginTop: 10, fontSize: 14, color: "black" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryBtn: {
    padding: 12,
    backgroundColor: "#000",
    borderRadius: 8,
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
  navItem: { alignItems: "center", width: (width - 70) / 4 - 5 },
  navLabel: { fontSize: 12, marginTop: 3, color: "black", textAlign: "center" },
  navIcon: { width: 26, height: 26, tintColor: "black" },
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
  addButtonText: { 
    fontSize: 34, 
    color: "white" 
  },
});
