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
import { createAccount } from "../storage/userStore";

export default function CreateAccountScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [ageText, setAgeText] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState(""); // not enforced yet
  const [statusMsg, setStatusMsg] = useState("");

  async function handleCreate() {
    const ageNum = parseInt(ageText, 10);

    if (!name.trim() || !email.trim() || !ageNum) {
      setStatusMsg("Please fill in name, age, and email.");
      return;
    }

    try {
      const profile = await createAccount(
        name.trim(),
        email.trim().toLowerCase(),
        ageNum
      );

      if (profile) {
        setStatusMsg("Your account has been made! 🎉");

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setStatusMsg("Something went wrong creating your account.");
      }
    } catch (err) {
      setStatusMsg("Error creating account.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Create Account" navigation={navigation} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Let's get started</Text>
          <Text style={styles.cardDesc}>
            We’ll build a plan for you based on your age.
          </Text>

          <TextInput
            placeholder="Name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Age"
            placeholderTextColor="#94A3B8"
            value={ageText}
            onChangeText={setAgeText}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password (not checked yet)"
            placeholderTextColor="#94A3B8"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            style={styles.input}
          />

          <Pressable style={styles.primaryBtn} onPress={handleCreate}>
            <Text style={styles.primaryBtnText}>Create account</Text>
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
    backgroundColor: "white",
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
