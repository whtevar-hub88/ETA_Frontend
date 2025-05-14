import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, GestureResponderEvent, ImageSourcePropType } from "react-native";

type CategoryCardProps = {
    label: string;
    image: ImageSourcePropType;
    onPress: (event: GestureResponderEvent) => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ label, image, onPress }) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image source={image} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { alignItems: "center", margin: 12 },
    icon: { width: 70, height: 70, borderRadius: 50 },
    label: { marginTop: 6, fontWeight: "500", fontSize: 14, textAlign: "center" },
});

export default CategoryCard;
