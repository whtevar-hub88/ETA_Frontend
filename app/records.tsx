import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const RecordsScreen = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace("/home");
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#87B56C" />
        </View>
    );
};

export default RecordsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
});