// frontend/src/screens/Auth.tsx
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

import {
  signUp,
  signIn,
  getCurrentUser,
} from "../storage/userStore";

export default function Auth({ navigation }: any) {
  // --- CREATE ACCOUNT FIELDS ---
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPw, setNewPw] = useState("");

  // --- LOGIN FIELDS ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // status / feedback
  const [statusMsg, setStatusMsg] = useState("");

  // create account handler
  async function handleCreate() {
    // basic validation
    if (!newName.trim() || !newAge.trim() || !newEmail.trim() || !newPw.trim()) {
      setStatusMsg("Please fill in name, age, email, and password.");
      return;
    }

    const ageNum = parseInt(newAge, 10);
    if (Number.isNaN(ageNum) || ageNum <= 0) {
      setStatusMsg("Age must be a number.");
      return;
    }

    // call signUp from userStore
    const res = await signUp(newName, ageNum, newEmail, newPw);

    if (!res.ok) {
      // ex: "You already made an account. Please log in."
      setStatusMsg(res.error ?? "Could not create account.");
      return;
    }

    // success -> res.user is the profile we just saved
    setStatusMsg("Account created 🎉");

    // jump to Home and wipe nav history
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  // log in handler
  async function handleLogin() {
    if (!loginEmail.trim()) {
      setStatusMsg("Please enter your email.");
      return;
    }

    // OPTIONAL: we also collected loginPw. We can check it in signIn later
    const user = await signIn(loginEmail, loginPw);

    if (!user) {
      // two main cases:
      // 1. there's no saved user at all
      // 2. the email didn't match the saved user
      // (we're not strictly password-checking yet unless you uncomment that code in userStore)
      const existing = await getCurrentUser();
      if (!existing) {
        setStatusMsg("No account found. Try Create Account.");
      } else {
        setStatusMsg("That email doesn't match. Try again.");
      }
      return;
    }

    setStatusMsg(`Welcome back, ${user.name}!`);
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* CREATE ACCOUNT CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardDesc}>
            We’ll use your age to build your learning plan.
          </Text>

          <TextInput
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />

          <TextInput
            placeholder="Your age"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={newAge}
            onChangeText={setNewAge}
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={newEmail}
            onChangeText={setNewEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={newPw}
            onChangeText={setNewPw}
            style={styles.input}
          />

          <Pressable style={styles.primaryBtn} onPress={handleCreate}>
            <Text style={styles.primaryBtnText}>Create account</Text>
          </Pressable>
        </View>

        {/* LOGIN CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log in</Text>
          <Text style={styles.cardDesc}>
            Already made an account? Jump back in.
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
            value={loginPw}
            onChangeText={setLoginPw}
            style={styles.input}
          />

          <Pressable style={styles.secondaryBtn} onPress={handleLogin}>
            <Text style={styles.secondaryBtnText}>Log in</Text>
          </Pressable>
        </View>

        {statusMsg ? (
          <Text style={styles.statusMsg}>{statusMsg}</Text>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },

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

  secondaryBtn: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#0F172A",
    fontWeight: "800",
  },

  statusMsg: {
    textAlign: "center",
    fontWeight: "700",
    color: "#1F2937",
  },
});
