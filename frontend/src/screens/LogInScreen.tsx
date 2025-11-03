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
import { getCurrentUser, signIn } from "../storage/userStore";

export default function LogInScreen({ navigation }: any) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState(""); // if you want pw later
  const [statusMsg, setStatusMsg] = useState("");

  async function handleLogin() {
    const emailClean = loginEmail.trim().toLowerCase();

    if (!emailClean) {
      setStatusMsg("Please enter your email.");
      return;
    }

    // look at what's currently saved on device
    const existing = await getCurrentUser();

    // if there's nothing saved at all
    if (!existing) {
      setStatusMsg("No account found. Try Create Account.");
      return;
    }

    // try to sign in
    const profile = await signIn(emailClean);

    if (!profile) {
      // we HAVE a saved user, but the email doesn't match what they typed
      setStatusMsg("That email doesn't match. Try again.");
      return;
    }

    // success
    setStatusMsg(`Welcome back, ${profile.name}!`);

    // go to Home and wipe history so back won't bounce to auth
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
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

          {/* password box now shown, but not enforced yet */}
          <TextInput
            placeholder="Password (optional for now)"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={loginPw}
            onChangeText={setLoginPw}
            style={styles.input}
          />

          <Pressable style={styles.primaryBtn} onPress={handleLogin}>
            <Text style={styles.primaryBtnText}>Log In</Text>
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
