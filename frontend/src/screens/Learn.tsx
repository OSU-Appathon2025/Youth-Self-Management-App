// frontend/src/screens/Learn.tsx
import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

export default function Learn() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <View style={styles.center}>
        <Text style={styles.h1}>Learn</Text>
        <Text style={styles.muted}>Short videos & quick quizzes coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  muted: { color: "#64748B" },
});
