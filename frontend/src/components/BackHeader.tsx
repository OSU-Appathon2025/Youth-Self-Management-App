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
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
        }}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={20} color="#1F2937" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
});
