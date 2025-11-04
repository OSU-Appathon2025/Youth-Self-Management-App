import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getCurrentUser } from "../storage/userStore";
import { getAuthToken } from "../services/api/client";

export default function AuthLandingScreen({ navigation }: any) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await getAuthToken();
    const user = await getCurrentUser();

    // If we have both a token and a user, verify token is valid by calling backend
    if (token && user) {
      try {
        // Try to fetch user profile to verify token is valid
        const { getUserProfile } = await import("../services/api/user");
        const result = await getUserProfile();

        if (result.ok) {
          // Token is valid, go to Home
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
          return;
        }
      } catch (error) {
        console.log("Token validation failed:", error);
      }

      // If we get here, token is invalid - clear it and show login
      const { clearAuthTokens } = await import("../services/api/client");
      await clearAuthTokens();
    }

    // Show the auth options
    setChecking(false);
  }

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome 👋</Text>
          <Text style={styles.desc}>
            We’ll help you get ready to move to adult care.
          </Text>

          <Pressable
            style={[styles.bigBtn, { backgroundColor: "#2563EB" }]}
            onPress={() => navigation.navigate("CreateAccountScreen")}
          >
            <Text style={styles.bigBtnText}>I'm new – Create Account</Text>
          </Pressable>

          <Pressable
            style={[styles.bigBtn, { backgroundColor: "#0F172A" }]}
            onPress={() => navigation.navigate("LogInScreen")}
          >
            <Text style={styles.bigBtnText}>I already have an account</Text>
          </Pressable>

          <Text style={styles.smallNote}>
            You can always edit your info later.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, justifyContent: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  bigBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  bigBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  smallNote: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
});
