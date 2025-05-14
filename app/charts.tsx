import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  DimensionValue,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const API_BASE = "https://expenses-tracker-8k6o.onrender.com/api/transactions";

type ChartItem = {
  name: string;
  amount: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};

const createPieSlice = (
  startAngle: number,
  endAngle: number,
  radius: number,
  color: string,
  key: string
): JSX.Element => {
  const start = polarToCartesian(100, 100, radius, endAngle);
  const end = polarToCartesian(100, 100, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L 100 100`,
    "Z",
  ].join(" ");
  return <Path key={key} d={d} fill={color} />;
};

const PieChart = ({ data, total }: { data: ChartItem[]; total: number }) => {
  const radius = 80;
  const innerRadius = 45;
  let startAngle = 0;

  // Format the total amount for better display
  const formattedTotal = total.toLocaleString();
  const totalText = `NRS. ${formattedTotal}`;

  return (
    <Svg height="200" width="200" viewBox="0 0 200 200">
      <G>
        {data.map((item, index) => {
          const valuePercent = item.amount / total;
          const angle = valuePercent * 360;
          const slice = createPieSlice(
            startAngle,
            startAngle + angle,
            radius,
            item.color,
            `${item.name}-${index}`
          );
          startAngle += angle;
          return slice;
        })}
        {/* Inner circle */}
        <Path
          d={`M ${100 - innerRadius},100 a ${innerRadius},${innerRadius} 0 1,0 ${
            innerRadius * 2
          },0 a ${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0`}
          fill="#fff"
        />
        {/* Center text container */}
        <G transform="translate(100, 100)">
          <SvgText
            x="0"
            y="-5"
            textAnchor="middle"
            fontSize="12"
            fill="#000"
            fontWeight="bold"
          >
            NRS.
          </SvgText>
          <SvgText
            x="0"
            y="10"
            textAnchor="middle"
            fontSize="14"
            fill="#000"
            fontWeight="bold"
          >
            {formattedTotal}
          </SvgText>
        </G>
      </G>
    </Svg>
  );
};

export default function ChartsScreen() {
  const router = useRouter();
  const [view, setView] = useState<"Today" | "This Month" | "This Year">("This Month");
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const getColorByName = (name: string): string => {
    const map: Record<string, string> = {
      Entertainment: "#7AC7C4",
      Food: "#FECB2F",
      Shopping: "#FF9F68",
      Travel: "#8E44AD",
      Subscription: "#A29BFE",
      Donation: "#B33771",
      "Personal Care": "#63cdda",
      Housing: "#F68686",
      Utilities: "#BDC581",
      Transportation: "#3B3B98",
      Groceries: "#FDA7DF",
      Healthcare: "#3DC1D3",
      Education: "#82589F",
      "Childcare & Family": "#F97F51",
      Insurance: "#546de5",
      "Emergency fund": "#E15F41",
      "Retirement savings": "#58B19F",
      "Vacation fund": "#FC427B",
      "Education fund": "#1B9CFC",
      "Finance fund": "#2C3A47",
      "Bank credits": "#CAD3C8",
      Income: "#2ECC71",
      Needs: "#FECB2F",
      Wants: "#54A0FF",
      Savings: "#1DD1A1",
      Others: "#A3E4AB",
    };
    const key = name.split(" - ")[0];
    return map[key] || "#9C88FF";
  };

  const getIconByName = (name: string): keyof typeof Ionicons.glyphMap => {
    const map: Record<string, keyof typeof Ionicons.glyphMap> = {
      Entertainment: "tv-outline",
      Food: "fast-food-outline",
      Shopping: "cart-outline",
      Travel: "airplane-outline",
      Subscription: "albums-outline",
      Donation: "calendar-outline",
      "Personal Care": "people-outline",
      Housing: "home-outline",
      Utilities: "build-outline",
      Transportation: "car-outline",
      Groceries: "basket-outline",
      Healthcare: "medkit-outline",
      Education: "school-outline",
      "Childcare & Family": "body-outline",
      Insurance: "shield-checkmark-outline",
      "Emergency fund": "cash-outline",
      "Retirement savings": "home-outline",
      "Vacation fund": "boat-outline",
      "Education fund": "school-outline",
      "Finance fund": "pricetags-outline",
      "Bank credits": "wallet-outline",
      Income: "cash-outline",
      Needs: "cart-outline",
      Wants: "game-controller-outline",
      Savings: "wallet-outline",
      Others: "apps-outline",
    };
    const key = name.split(" - ")[0];
    return map[key] || "pie-chart-outline";
  };

  const groupTopCategories = (items: { name: string; amount: number }[]): ChartItem[] => {
    const sorted = [...items].sort((a, b) => b.amount - a.amount);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    const result: ChartItem[] = top5.map((item) => ({
      name: item.name,
      amount: item.amount,
      color: getColorByName(item.name),
      icon: getIconByName(item.name),
    }));

    if (others.length > 0) {
      const otherSum = others.reduce((sum, item) => sum + item.amount, 0);
      result.push({
        name: "Others",
        amount: otherSum,
        color: getColorByName("Others"),
        icon: getIconByName("Others"),
      });
    }

    return result;
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");
      let endpoint = "/expenses/monthly";
      if (view === "Today") endpoint = "/expenses/daily";
      else if (view === "This Year") endpoint = "/expenses/yearly";

      const url = `${API_BASE}${endpoint}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = res.data;
      let parsed: ChartItem[] = [];

      if (endpoint.includes("monthly") || endpoint.includes("yearly")) {
        const items: { name: string; amount: number }[] = [];
        raw.forEach((entry: any) => {
          const label = endpoint.includes("yearly")
            ? entry.year
            : `Month ${entry._id?.month || entry.month}, ${entry._id?.year || entry.year}`;
          if (entry.needs) items.push({ name: `Needs - ${label}`, amount: entry.needs });
          if (entry.wants) items.push({ name: `Wants - ${label}`, amount: entry.wants });
          if (entry.savings) items.push({ name: `Savings - ${label}`, amount: entry.savings });
          if (entry.income) items.push({ name: `Income - ${label}`, amount: entry.income });
        });
        parsed = groupTopCategories(items);
      } else {
        const items: { name: string; amount: number }[] = [];
        raw.forEach((entry: any) => {
          const category = entry._id?.category || "Others";
          const amount = Math.abs(entry.total || 0);
          items.push({ name: category, amount });
        });
        parsed = groupTopCategories(items);
      }

      setChartData(parsed);
      setTotalAmount(parsed.reduce((sum, item) => sum + item.amount, 0));
    } catch (error) {
      console.error("❌ Chart Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [view]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Charts</Text>
        <View style={styles.toggleContainer}>
          {["Today", "This Month", "This Year"].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setView(option as typeof view)}
              style={[styles.toggleButton, view === option && styles.activeToggle]}
            >
              <Text style={[styles.toggleText, view === option && styles.activeToggleText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartRow}>
        {loading ? (
          <ActivityIndicator size="large" color="#7A9E7E" />
        ) : chartData.length > 0 && totalAmount > 0 ? (
          <PieChart data={chartData} total={totalAmount} />
        ) : (
          <Text style={{ textAlign: "center", fontSize: 16, color: "#666", marginTop: 20 }}>
            No data available for {view}.
          </Text>
        )}
      </View>

      {/* Bars */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {chartData.map((item, index) => {
          const percent = ((item.amount / totalAmount) * 100).toFixed(2);
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.iconLabel}>
                <Ionicons name={item.icon} size={22} color={item.color} />
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <View style={styles.progressWrapper}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percent}%` as DimensionValue,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.rightLabels}>
                <Text style={styles.percent}>{percent}%</Text>
                <Text style={styles.amount}>NRS. {item.amount}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Nav */}
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
            style={[styles.navIcon, { tintColor: "#87B56C" }]} 
          />
          <Text style={[styles.navLabel, { color: "#87B56C" }]}>Charts</Text>
        </TouchableOpacity>
        <View style={{ width: 70 }} />
        <TouchableOpacity onPress={() => router.push("/reports")} style={styles.navItem}>
          <Image 
            source={require("../assets/icons/reports.png")} 
            style={[styles.navIcon, { tintColor: "#000" }]} 
          />
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
          <Ionicons name="person-outline" size={26} color="#000" />
          <Text style={styles.navLabel}>Me</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={[styles.addButton, { left: width / 2 - 35 }]} onPress={() => router.push("/addExpense")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#9BBF7E",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "600", marginBottom: 8 },
  toggleContainer: { flexDirection: "row", marginTop: 6 },
  toggleButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  toggleText: { fontSize: 14, color: "#000" },
  activeToggle: { backgroundColor: "#000" },
  activeToggleText: { color: "#fff" },
  chartRow: { 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 20,
    marginBottom: 10 
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingRight: 10,
  },
  iconLabel: {
    width: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemName: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#222",
    flexShrink: 1,
  },
  progressWrapper: {
    flex: 1,
    backgroundColor: "#eee",
    height: 8,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    marginLeft: 8,
  },
  progressBar: { height: 8, borderRadius: 12 },
  rightLabels: { 
    alignItems: "flex-end", 
    width: 100,
    paddingLeft: 8,
  },
  percent: { 
    fontSize: 12, 
    color: "#555",
    marginBottom: 2,
  },
  amount: { 
    fontSize: 13, 
    fontWeight: "600",
    flexWrap: 'wrap',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { 
    alignItems: "center", 
    width: (width - 70) / 4 - 5 
  },
  navLabel: { 
    fontSize: 12, 
    marginTop: 3, 
    color: "#000", 
    textAlign: "center" 
  },
  navIcon: { 
    width: 26, 
    height: 26, 
    tintColor: "#000" 
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
  addButtonText: { 
    fontSize: 34, 
    color: "white" 
  },
});
