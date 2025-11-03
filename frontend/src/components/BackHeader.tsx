// frontend/src/components/BackHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function BackHeader({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backHit}>
        <Ionicons name="chevron-back" size={22} color="#0F172A" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },
  backHit: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
    marginRight: 32, // balance the back button space
  },
});
