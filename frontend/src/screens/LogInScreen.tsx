import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import BackHeader from "../components/BackHeader";
import { signIn } from "../storage/userStore";

export default function LogInScreen({ navigation }: any) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!loginEmail.trim()) {
      setStatusMsg("Please enter your email.");
      return;
    }

    if (!loginPassword.trim()) {
      setStatusMsg("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("Logging in...");

    const result = await signIn(loginEmail.trim(), loginPassword);

    setIsLoading(false);

    if (!result.ok) {
      setStatusMsg(result.error || "Login failed. Please check your credentials.");
      return;
    }

    if (result.user) {
      setStatusMsg(`Welcome back, ${result.user.name}!`);

      // Navigate to Home after short delay
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 500);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Log In" navigation={navigation} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log In</Text>
          <Text style={styles.cardDesc}>
            Use the same email you used before.
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={loginEmail}
            onChangeText={setLoginEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            autoCapitalize="none"
            value={loginPassword}
            onChangeText={setLoginPassword}
            style={styles.input}
          />

          <Pressable
            style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </Pressable>

          {statusMsg ? (
            <Text style={styles.statusText}>{statusMsg}</Text>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#0F172A",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
  },
  statusText: {
    marginTop: 12,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
});
