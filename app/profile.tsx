import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Alert,
    Modal,
    TextInput,
    Platform,
} from "react-native";
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import * as MediaLibrary from 'expo-media-library';
import NotificationService from "./services/NotificationService";



const { width } = Dimensions.get("window");

export default function ProfileScreen() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({ name: "", email: "", userId: "" });
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [linkedAccount, setLinkedAccount] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    
useEffect(() => {
    const loadUserData = async () => {
        const name = await SecureStore.getItemAsync("name");
        const email = await SecureStore.getItemAsync("email");
        const userId = await SecureStore.getItemAsync("userId");

        setName(name);
        setEmail(email);
        setUserId(userId);
    };

    loadUserData();
  }, [])

useFocusEffect(
  useCallback(() => {
    const fetchLinkedAccount = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");

        const response = await fetch("https://expenses-tracker-8k6o.onrender.com/api/bank/accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data) && data.length > 0) {
            const existing = JSON.stringify(bankAccounts);
            const incoming = JSON.stringify(data);

          // Detect newly linked
            if (existing !== incoming && bankAccounts.length < data.length) {
                // New account linked!
                triggerNewAccountNotification(data[data.length - 1]); // send latest
            }

          setLinkedAccount(data[0]);  // Optional: for highlighting
          setBankAccounts(data);      // ✅ Show all in UI
        } else {
          setLinkedAccount(null);
          setBankAccounts([]);
        }
      } catch (error) {
        console.error("Error fetching account:", error);
        setLinkedAccount(null);
        setBankAccounts([]);
      }
    };

    fetchLinkedAccount();
  }, [])
);

const triggerNewAccountNotification = async (account: any) => {
  Alert.alert(
    "New Bank Linked!",
    `Account ending in ****${account.accountNumber.slice(-4)} linked.\nDo you want to log your latest transaction?`,
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync("token");
            console.log('Token:', token); 
            // Fetch mock transactions
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/bank/mock-transactions", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Failed to fetch mock transactions. Status: ${res.status}`);
            }

            const mockList = await res.json();
            console.log('Mock transactions:', mockList);  // Debug log

            if (!Array.isArray(mockList) || mockList.length === 0) {
              throw new Error("No mock transactions found.");
            }

            // Filter for unlogged transactions
            const unloggedMock = mockList.filter(transaction => !transaction.isAdded);
            if (unloggedMock.length === 0) {
              throw new Error("All mock transactions are already logged.");
            }

            const mock = unloggedMock[0]; // Use first unlogged transaction

            // Prepare payload matching backend expectations
            const payload = {
              mockId: mock._id,
              category: "Others", // You can make this dynamic later
              type: "expense",       // Assuming all mock data is expense
            };

            const confirmRes = await fetch("https://expenses-tracker-8k6o.onrender.com/api/bank/confirm-transaction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            const result = await confirmRes.json();

            if (!confirmRes.ok) {
              throw new Error(`Failed to confirm transaction: ${result?.msg || "Unknown error"}`);
            }

            Alert.alert("Success", "Mock transaction logged.");

            const notificationService = NotificationService.getInstance();
            await notificationService.addNotification(
              `Logged transaction: ${mock.description} (${mock.amount})`,
              "Transaction"
            );
          } catch (err) {
            console.error("Mock transaction error:", err);
            const errorMessage = (err instanceof Error) ? err.message : String(err);
            Alert.alert("Error", `Failed to fetch or log mock transaction: ${errorMessage}`);
          }
        },
      },
    ]
  );
};


const handleRemoveAccount = (index: number) => {
  // Get the account ID using the passed index
  const accountId = bankAccounts[index]?._id;

  if (!accountId) {
    console.error("Invalid account ID");
    return;
  }

  Alert.alert("Remove Account", "Are you sure you want to remove this account?", [
    { text: "No", style: "cancel" },
    {
      text: "Yes",
      style: "destructive",
      onPress: async () => {
        try {
          const token = await SecureStore.getItemAsync("token");

          const res = await fetch(`https://expenses-tracker-8k6o.onrender.com/api/bank/${accountId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.error("Delete failed:", errorData.msg || res.statusText);
            return;
          }

          // Refresh local state
          setBankAccounts(prev => prev.filter((acc, idx) => idx !== index));
        } catch (err) {
          console.error("❌ Error deleting account:", err);
        }
      },
    },
  ]);
};


const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "You need to grant storage permissions.");
      return false;
    }
  }
  return true;
};

const saveToExternalStorage = async (uri: string, filename: string) => {
  const permissionGranted = await requestStoragePermission();
  if (!permissionGranted) return;

  // External storage location for Android (e.g., Downloads folder)
  const destinationPath = FileSystem.documentDirectory + `downloads/${filename}`;

  try {
    await FileSystem.copyAsync({ from: uri, to: destinationPath });
    console.log("✅ File saved successfully:", destinationPath);
    return destinationPath;
  } catch (error) {
    console.error("❗ Error saving file:", error);
    Alert.alert("Error", "Failed to save file to external storage.");
    return null;
  }
};

const handleExportPDF = async () => {
  console.log("📦 Export PDF button pressed");

  // Ensure both year and month are available
  if (!year || !month) {
    console.log("❌ Missing year or month:", { year, month });
    Alert.alert("Missing Info", "Please enter both year and month.");
    return;
  }

  // ✅ Retrieve the token directly from SecureStore
  const freshToken = await SecureStore.getItemAsync("token");
  console.log("🔑 Retrieved fresh token:", freshToken);

  // If there's no token, show an alert and stop execution
  if (!freshToken) {
    console.log("❌ Token is null. Cannot authenticate.");
    Alert.alert("Error", "You must be logged in.");
    return;
  }

  // Construct the URI for the PDF export
  const uri = `https://expenses-tracker-8k6o.onrender.com/api/pdf/export?year=${year}&month=${month}`;
  console.log("🔗 Exporting PDF from:", uri);

  try {
    // Define where to save the downloaded PDF (within app sandboxed directory)
    const destinationPath = FileSystem.documentDirectory + "transactions.pdf";
    console.log("📂 Saving to:", destinationPath);

    // Create a download resumable to download the file
    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      destinationPath,
      {
        headers: {
          Authorization: `Bearer ${freshToken}`, // Send token in the headers
        },
      }
    );

    // Log the download initiation
    console.log("⏳ Starting download...");

    // Await the download result
    const downloadResult = await downloadResumable.downloadAsync();

    // Check if the download was successful
    if (!downloadResult || !downloadResult.uri) {
      throw new Error("Download failed or URI missing.");
    }

    // Log success
    console.log("✅ Download complete:", downloadResult.uri);

    // Save the file to external storage (Android), or share it directly
    const externalFilePath = await saveToExternalStorage(downloadResult.uri, 'transactions.pdf');
    if (externalFilePath) {
      console.log("✅ File saved to external storage:", externalFilePath);
    }

    // Hide modal and show success alert
    setModalVisible(false);
    Alert.alert("Success", "PDF downloaded successfully.");

    // Optional: Share the file (only if sharing is available)
    if (await Sharing.isAvailableAsync()) {
      console.log("📤 Sharing file...");
      await Sharing.shareAsync(externalFilePath || downloadResult.uri); // Share from external path if available
    } else {
      console.log("📤 Sharing not available on this device.");
    }

  } catch (error) {
    // Log and alert any errors
    console.error("❗ PDF Download error:", error);
    Alert.alert("Error", "Failed to download PDF.");
  }
};



    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image
                    source={require("../assets/images/user.png")}
                    style={styles.avatar}
                    resizeMode="cover"
                />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.userId}>ID: {userId}</Text>
                    <Text style={styles.userId}>Email: {email}</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Accounts</Text>
                    {linkedAccount && (
                        <View style={[styles.bankAccountCard, { borderColor: '#6CC551', borderWidth: 2 }]}>
                            <Text style={[styles.accountHolder, { color: '#6CC551' }]}>Linked Account</Text>
                            <Text style={styles.accountHolder}>{linkedAccount.bankName}</Text>
                            <Text style={styles.accountNumber}>****{linkedAccount.accountNumber?.slice(-4)}</Text>
                        </View>
                    )}
                    {bankAccounts.map((account, index) => (
                        <Swipeable
                            key={index}
                            renderRightActions={() => (
                                <TouchableOpacity
                                    style={styles.swipeDeleteBtn}
                                    onPress={() => handleRemoveAccount(index)}
                                >
                                    <Ionicons name="trash" size={26} color="white" />
                                    <Text style={styles.swipeDeleteText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        >
                            <View style={styles.bankAccountCard}>
                                <Text style={styles.accountHolder}>{account.bankName}</Text>
                                <Text style={styles.accountNumber}>****{account.accountNumber.slice(-4)}</Text>
                            </View>
                        </Swipeable>
                    ))}
                    <TouchableOpacity
                        style={styles.addAccountButton}
                        onPress={() => router.push("/add-bank-account")}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#7A9E7E" />
                        <Text style={styles.addAccountText}>Add Bank Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings Options */}
                <ScrollView style={styles.cardContainer}>
                    <Option
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => router.push("/settings")}
                    />
                    <Option
                        icon="person-outline"
                        label="Profile"
                        onPress={() => router.push("/profile-detail")}
                    />
                    <Option
                        icon="information-outline"
                        label="Information Sector"
                        onPress={() => { }}
                    />
                    <Option
                        icon="file-pdf-box"
                        label="Export PDF"
                        onPress={() => setModalVisible(true)}
                        iconLib="MaterialCommunityIcons"
                    />
                </ScrollView>
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
                        style={[styles.navIcon, { tintColor: "#000" }]}
                    />
                    <Text style={styles.navLabel}>Charts</Text>
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
                    <Ionicons name="person-outline" size={26} color="#87B56C" />
                    <Text style={[styles.navLabel, { color: "#87B56C" }]}>Me</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.addButton, { left: width / 2 - 35 }]} onPress={() => router.push("/addExpense")}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {/* Export PDF Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Export PDF</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter year (e.g. 2025)"
                            keyboardType="numeric"
                            value={year}
                            onChangeText={setYear}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter month (1-12)"
                            keyboardType="numeric"
                            value={month}
                            onChangeText={setMonth}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={{ color: "#555" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleExportPDF} style={styles.exportBtn}>
                                <Text style={{ color: "white" }}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const Option = ({ icon, label, onPress, iconLib = "Ionicons" }: any) => {
    const IconLib =
        iconLib === "MaterialCommunityIcons"
            ? MaterialCommunityIcons
            : iconLib === "FontAwesome5"
                ? FontAwesome5
                : Ionicons;

    return (
        <TouchableOpacity style={styles.optionRow} onPress={onPress}>
            <View style={styles.optionLeft}>
                <IconLib
                    name={icon}
                    size={20}
                    color="#6CC551"
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.optionText}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );
};

// Add to your styles:
const styles = StyleSheet.create({
        container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#f9f9f9",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    userId: {
        fontSize: 14,
        color: "#666",
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    bankAccountCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    accountHolder: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    accountNumber: {
        fontSize: 14,
        color: "#666",
    },
    addAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#7A9E7E",
        borderRadius: 8,
        marginTop: 10,
    },
    addAccountText: {
        color: "#7A9E7E",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    navItem: {
        flex: 1,
        alignItems: "center",
    },
    navIcon: {
        width: 24,
        height: 24,
        marginBottom: 2,
    },
    navLabel: {
        fontSize: 12,
        color: "#333",
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
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
        elevation: 4,
    },
    addButtonText: { 
        fontSize: 34, 
        color: "white" 
    },
    swipeDeleteBtn: {
        backgroundColor: '#D9534F',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '90%',
        marginVertical: 8,
        borderRadius: 10,
        flexDirection: 'column',
    },
    swipeDeleteText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 4,
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    cancelBtn: {
        padding: 10,
    },
    exportBtn: {
        backgroundColor: "#6CC551",
        padding: 10,
        borderRadius: 8,
    },
});

