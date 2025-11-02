// frontend/src/screens/AuthChoice.tsx
import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";

export default function AuthChoice({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <View style={styles.wrap}>
        <Text style={styles.heading}>Welcome 👋</Text>
        <Text style={styles.sub}>
          Let’s get you set up so we can build your health plan.
        </Text>

        <Pressable
          style={[styles.bigBtn, { backgroundColor: "#2563EB" }]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={styles.bigBtnText}>Create an account</Text>
        </Pressable>

        <Pressable
          style={[styles.bigBtn, { backgroundColor: "#475569" }]}
          onPress={() => navigation.navigate("LogIn")}
        >
          <Text style={styles.bigBtnText}>Log in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 24,
    maxWidth: 320,
  },
  bigBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  bigBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
});
