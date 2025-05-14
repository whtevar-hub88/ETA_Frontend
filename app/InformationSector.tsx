import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function InformationSectorScreen() {
  const router = useRouter();
  const [firstPostTime, setFirstPostTime] = useState("Today");
  const [secondPostTime, setSecondPostTime] = useState("Today");

  useEffect(() => {
    // Set the initial post dates when the component mounts
    const initializePostDates = async () => {
      try {
        const firstPostDate = new Date();
        const secondPostDate = new Date();
        
        // Store these dates in AsyncStorage
        await AsyncStorage.setItem('firstPostDate', firstPostDate.toISOString());
        await AsyncStorage.setItem('secondPostDate', secondPostDate.toISOString());
        
        // Update the display times
        updatePostTimes();
      } catch (error) {
        console.error('Error initializing post dates:', error);
      }
    };

    initializePostDates();
  }, []);

  const updatePostTimes = async () => {
    try {
      const now = new Date();
      const firstPostDateStr = await AsyncStorage.getItem('firstPostDate');
      const secondPostDateStr = await AsyncStorage.getItem('secondPostDate');
      
      const firstPostDate = firstPostDateStr ? new Date(firstPostDateStr) : now;
      const secondPostDate = secondPostDateStr ? new Date(secondPostDateStr) : now;

      const getRelativeTime = (date: Date) => {
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return "Today";
        } else if (diffDays === 1) {
          return "Yesterday";
        } else {
          return `${diffDays} days ago`;
        }
      };

      setFirstPostTime(getRelativeTime(firstPostDate));
      setSecondPostTime(getRelativeTime(secondPostDate));
    } catch (error) {
      console.error('Error updating post times:', error);
    }
  };

  const handleReadPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL: " + url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information Sector</Text>
      </View>

      {/* Scrollable Articles */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Image
            source={require("../assets/images/expinfo1.png")}
            style={styles.image}
          />
          <Text style={styles.days}>{firstPostTime}</Text>
          <Text style={styles.title}>
          How to Budget Money in 5 Steps
          </Text>
          <TouchableOpacity 
            style={styles.readButton}
            onPress={() => handleReadPress("https://www.nerdwallet.com/article/finance/how-to-budget")}
          >
            <Text style={styles.readText}>READ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Image
            source={require("../assets/images/expinfo2.png")}
            style={styles.image}
          />
          <Text style={styles.days}>{secondPostTime}</Text>
          <Text style={styles.title}>
          Budgeting basics: The 50-30-20 rule
          </Text>
          <TouchableOpacity 
            style={styles.readButton}
            onPress={() => handleReadPress("https://www.unfcu.org/financial-wellness/50-30-20-rule/#:~:text=The%2050-30-20%20rule%20recommends%20putting%2050%%20of,closer%20look%20at%20each%20category")}
          >
            <Text style={styles.readText}>READ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TabItem
          source={require("../assets/icons/records.png")}
          label="Records"
          onPress={() => router.push("/records")}
        />
        <TabItem
          source={require("../assets/icons/charts.png")}
          label="Charts"
          onPress={() => router.push("/charts")}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/addExpense")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
        <TabItem
          source={require("../assets/icons/reports.png")}
          label="Reports"
          onPress={() => router.push("/reports")}
        />
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={24} color="#87B56C" />
          <Text style={[styles.tabLabel, { color: "#87B56C" }]}>Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// TabItem Component
const TabItem = ({
  source,
  label,
  onPress,
}: {
  source: any;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Image source={source} style={styles.tabIcon} />
    <Text style={styles.tabLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#87B56C",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollContainer: {
    padding: 10,
    gap: 20,
    paddingBottom: 80, // To prevent content from hiding behind nav bar
  },
  card: {
    borderWidth: 1,
    borderColor: "#646464",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 10,
  },
  days: {
    color: "#666",
    fontSize: 13,
    marginBottom: 5,
  },
  title: {
    fontSize: 15,
    color: "#000",
    marginBottom: 10,
  },
  readButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#646464",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  readText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  addButton: {
    width: 64,
    height: 64,
    backgroundColor: "#7B997C",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
  },
}); 
