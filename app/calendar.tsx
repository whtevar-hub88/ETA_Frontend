import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";

export default function CalendarScreen() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
    const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - 6);
    const [tempYear, setTempYear] = useState(currentDate.getFullYear());
    const [tempMonth, setTempMonth] = useState(currentDate.getMonth());
    const [showFullYearGrid, setShowFullYearGrid] = useState(false);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const handleDateSelect = (day: number) => {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = format(selected, "yyyy-MM-dd");
        router.push({ pathname: "/selectedDateRecords", params: { date: dateString } });
    };

    const handleConfirmMonthYear = () => {
        setCurrentDate(new Date(tempYear, tempMonth));
        setMonthPickerVisible(false);
        setShowFullYearGrid(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/home")}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar</Text>
                <TouchableOpacity
                    onPress={() => {
                        setTempYear(currentDate.getFullYear());
                        setTempMonth(currentDate.getMonth());
                        setMonthPickerVisible(true);
                    }}
                >
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
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <TouchableOpacity
                        key={day}
                        style={styles.dayCell}
                        onPress={() => handleDateSelect(day)}
                    >
                        <Text style={{ fontWeight: "500" }}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Month/Year Picker Modal */}
            <Modal visible={monthPickerVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{months[tempMonth]} {tempYear}</Text>
                        {!showFullYearGrid ? (
                            <>
                                <TouchableOpacity onPress={() => setShowFullYearGrid(true)}>
                                    <Text style={styles.yearButton}>{tempYear} ▼</Text>
                                </TouchableOpacity>
                                <View style={styles.monthGrid}>
                                    {months.map((m, idx) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[
                                                styles.monthButton,
                                                idx === tempMonth && { backgroundColor: "#97B77B" }
                                            ]}
                                            onPress={() => setTempMonth(idx)}
                                        >
                                            <Text style={{ color: idx === tempMonth ? "#fff" : "#000" }}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.confirmRow}>
                                    <TouchableOpacity onPress={() => setMonthPickerVisible(false)}>
                                        <Text style={styles.confirmText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleConfirmMonthYear}>
                                        <Text style={styles.confirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.yearNav}>
                                    <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart - 12)}>
                                        <Text style={styles.navArrow}>◀</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setShowFullYearGrid(false)}>
                                        <Text style={styles.yearButton}>{tempYear} ▲</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart + 12)}>
                                        <Text style={styles.navArrow}>▶</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.monthGrid}>
                                    {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(year => (
                                        <TouchableOpacity
                                            key={year}
                                            style={[
                                                styles.monthButton,
                                                year === tempYear && { backgroundColor: "#97B77B" }
                                            ]}
                                            onPress={() => setTempYear(year)}
                                        >
                                            <Text style={{ color: year === tempYear ? "#fff" : "#000" }}>{year}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
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
    yearButton: { marginTop: 15, fontSize: 16, color: "green" },
    confirmRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "100%",
    },
    confirmText: {
        color: "#97B77B",
        fontWeight: "600",
        fontSize: 16,
    },
    yearNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        marginBottom: 10,
    },
    navArrow: {
        fontSize: 18,
    },
});
