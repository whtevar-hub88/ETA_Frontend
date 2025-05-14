import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";

type RecordItem = {
    id: number;
    label: string;
    amount: number;
};

const dummyRecords: Record<string, RecordItem[]> = {
    "2025-03-28": [
        { id: 1, label: "Salary", amount: 15000 },
        { id: 2, label: "Towel", amount: -500 },
        { id: 3, label: "Shopping", amount: -650 },
    ],
};

export default function CalendarScreen() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
    const [yearPickerVisible, setYearPickerVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
    const [yearRangeStart, setYearRangeStart] = useState(2020);

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        const key = format(selectedDate, "yyyy-MM-dd");
        setRecords(dummyRecords[key] || []);
    }, [selectedDate]);

    const handleDateSelect = (day: number) => {
        const newSelected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelected);
    };

    const handleEditDelete = (record: RecordItem) => {
        setSelectedRecord(record);
        setEditModalVisible(true);
    };

    const confirmDelete = () => {
        if (!selectedRecord) return;
        const key = format(selectedDate, "yyyy-MM-dd");
        dummyRecords[key] = dummyRecords[key].filter(r => r.id !== selectedRecord.id);
        setEditModalVisible(false);
        setSelectedRecord(null);
        setRecords(dummyRecords[key]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/home")}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar</Text>
                <TouchableOpacity onPress={() => setMonthPickerVisible(true)}>
                    <Text style={styles.monthText}>{format(currentDate, "MMM yyyy")} ▼</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                    <Text key={i} style={styles.dayHeader}>{d}</Text>
                ))}
                {Array(firstDay).fill(null).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const isToday = selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentDate.getMonth() &&
                        selectedDate.getFullYear() === currentDate.getFullYear();

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayCell, isToday && styles.activeDay]}
                            onPress={() => handleDateSelect(day)}
                        >
                            <Text>{day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.recordsSection}>
                <Text style={styles.recordTitle}>{format(selectedDate, "dd MMM yyyy")}</Text>
                {records.map(record => (
                    <TouchableOpacity
                        key={record.id}
                        style={styles.recordItem}
                        onPress={() => handleEditDelete(record)}
                    >
                        <Text>{record.label}</Text>
                        <Text>{record.amount}</Text>
                        <Ionicons name="ellipsis-vertical" size={18} color="gray" />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.fab} onPress={() => Alert.alert("Add Record", "Open form modal here")}>
                <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>

            <Modal visible={monthPickerVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Month</Text>
                        <View style={styles.monthGrid}>
                            {months.map((m, idx) => (
                                <TouchableOpacity
                                    key={m}
                                    style={styles.monthButton}
                                    onPress={() => {
                                        setCurrentDate(new Date(currentDate.getFullYear(), idx));
                                        setMonthPickerVisible(false);
                                    }}
                                >
                                    <Text>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity onPress={() => setYearPickerVisible(true)}>
                            <Text style={styles.yearButton}>Change Year</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={yearPickerVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Year</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                            <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart - 12)}>
                                <Text>{"<"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart + 12)}>
                                <Text>{">"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.monthGrid}>
                            {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(year => (
                                <TouchableOpacity
                                    key={year}
                                    style={styles.monthButton}
                                    onPress={() => {
                                        setCurrentDate(new Date(year, currentDate.getMonth()));
                                        setYearPickerVisible(false);
                                    }}
                                >
                                    <Text>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {selectedRecord?.label} - {selectedRecord?.amount}
                        </Text>
                        <TouchableOpacity onPress={() => Alert.alert("Edit", "Open edit form")}>
                            <Text>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDelete}>
                            <Text style={{ color: "red", marginTop: 10 }}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Text style={{ marginTop: 10 }}>Cancel</Text>
                        </TouchableOpacity>
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
    monthText: { fontSize: 16, color: "black" },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        margin: 10,
    },
    dayHeader: {
        width: "14.28%",
        textAlign: "center",
        fontWeight: "600",
    },
    dayCell: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 4,
        borderRadius: 6,
        backgroundColor: "#eee",
    },
    activeDay: {
        backgroundColor: "#97B77B",
    },
    recordsSection: { paddingHorizontal: 20, marginTop: 20 },
    recordTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    recordItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f3f3f3",
        padding: 12,
        marginBottom: 6,
        borderRadius: 8,
    },
    fab: {
        backgroundColor: "#97B77B",
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        right: 20,
        bottom: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        width: "85%",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    monthButton: {
        padding: 10,
        margin: 5,
        backgroundColor: "#eee",
        borderRadius: 8,
        width: 70,
        alignItems: "center",
    },
    yearButton: {
        marginTop: 15,
        fontSize: 16,
        color: "green",
    },
    yearItem: {
        padding: 10,
        fontSize: 16,
    },
});
