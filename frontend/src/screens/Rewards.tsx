// frontend/src/screens/Rewards.tsx
import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";

export default function Rewards() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>Rewards</Text>
        <Text style={styles.muted}>Spend points on pet skins, emotes, and themes (MVP soon).</Text>
        <Pressable style={styles.btn}><Text style={styles.btnText}>Shop (coming soon)</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  h1: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  muted: { color: "#64748B", marginBottom: 12, textAlign: "center" },
  btn: { backgroundColor: "#6366F1", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800" },
});
