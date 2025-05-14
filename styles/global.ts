import { StyleSheet } from "react-native";

const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C", // Default green background
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        color: "white",
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#E5E4E2",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#D9D9D9",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginBottom: 10,
    },
});

export default GlobalStyles;
