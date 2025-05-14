import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withSequence,
    withDelay,
    Easing 
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from './config/api';

const SplashScreen = () => {
    const router = useRouter();

    // Load Montserrat Font
    const [fontsLoaded] = useFonts({ Montserrat_400Regular });

    // Create shared values for each letter
    const e1Opacity = useSharedValue(0);
    const xOpacity = useSharedValue(0);
    const pOpacity = useSharedValue(0);
    const e2Opacity = useSharedValue(0);
    const nOpacity = useSharedValue(0);
    const sOpacity = useSharedValue(0);
    const e3Opacity = useSharedValue(0);

    useEffect(() => {
        const animateLetters = () => {
            // First E
            e1Opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) });
            
            // X with delay
            xOpacity.value = withDelay(500, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));

            // P with delay
            pOpacity.value = withDelay(800, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));
            
            // Second E with delay
            e2Opacity.value = withDelay(1000, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));
            
            // N with delay
            nOpacity.value = withDelay(1200, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));
            
            // S with delay
            sOpacity.value = withDelay(1500, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));
            
            // Last E with delay
            e3Opacity.value = withDelay(1800, withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }));
        };

        if (fontsLoaded) {
            animateLetters();
            // Wait for all animations to complete before checking auth
            setTimeout(() => {
                checkAuth();
            }, 2500);
        }
    }, [fontsLoaded]);

    const checkAuth = async () => {
        try {
            // Check for authentication token
            const token = await SecureStore.getItemAsync("token");
            const userPin = await SecureStore.getItemAsync("userPin");

            if (!token) {
                // If no token, go to login
                router.replace("/loginscreen");
                return;
            }

            // Verify token is still valid
            try {
                const headers = await getAuthHeader();
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
                    method: "GET",
                    headers
                });

                if (!response.ok) {
                    // Token is invalid, clear storage and redirect to login
                    await SecureStore.deleteItemAsync("token");
                    await SecureStore.deleteItemAsync("userPin");
                    router.replace("/loginscreen");
                    return;
                }

                // Token is valid, check PIN setup
                if (userPin) {
                    // If PIN is set, navigate to the pin lock screen for verification
                    router.replace("/pin-lock");
                } else {
                    // If no PIN is set, navigate to home
                    router.replace("/home");
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                // If token verification fails, clear storage and redirect to login
                await SecureStore.deleteItemAsync("token");
                await SecureStore.deleteItemAsync("userPin");
                router.replace("/loginscreen");
            }
        } catch (error) {
            console.error("Error checking auth:", error);
            // Clear any potentially corrupted storage
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("userPin");
            router.replace("/loginscreen");
        }
    };

    // Animation styles for each letter
    const e1Style = useAnimatedStyle(() => ({
        opacity: e1Opacity.value,
    }));
    const xStyle = useAnimatedStyle(() => ({
        opacity: xOpacity.value,
    }));
    const pStyle = useAnimatedStyle(() => ({
        opacity: pOpacity.value,
    }));
    const e2Style = useAnimatedStyle(() => ({
        opacity: e2Opacity.value,
    }));
    const nStyle = useAnimatedStyle(() => ({
        opacity: nOpacity.value,
    }));
    const sStyle = useAnimatedStyle(() => ({
        opacity: sOpacity.value,
    }));
    const e3Style = useAnimatedStyle(() => ({
        opacity: e3Opacity.value,
    }));

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Animated.Text style={[styles.letter, e1Style]}>E</Animated.Text>
                <Animated.Text style={[styles.letter, xStyle]}>X</Animated.Text>
                <Animated.Text style={[styles.letter, pStyle]}>P</Animated.Text>
                <Animated.Text style={[styles.letter, e2Style]}>E</Animated.Text>
                <Animated.Text style={[styles.letter, nStyle]}>N</Animated.Text>
                <Animated.Text style={[styles.letter, sStyle]}>S</Animated.Text>
                <Animated.Text style={[styles.letter, e3Style]}>E</Animated.Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    letter: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
        marginHorizontal: 4,
    },
});

export default SplashScreen;
