import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Transactions</Text>
            <TextInput
                style={styles.input}
                placeholder="Type to search..."
                placeholderTextColor="#999"
                
            />
        </View>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EFEFEF",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        elevation: 2,
    },
});
