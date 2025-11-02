// frontend/src/screens/CreateAccountScreen.tsx
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
import { signUp } from "../storage/userStore";

export default function CreateAccountScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [ageText, setAgeText] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  async function handleCreate() {
    // convert age from text box -> number
    const ageNum = parseInt(ageText, 10);

    // call signUp from userStore
    const res = await signUp(name, ageNum, email, pw);

    if (!res.ok) {
      // something went wrong, show message
      setStatusMsg(res.error || "Something went wrong.");
      return;
    }

    // success!
    setStatusMsg("Your account was created! 🎉");

    // after success, go to Home and clear auth screens
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Create Account" navigation={navigation} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>

          <Text style={styles.cardDesc}>
            We ask your age because different ages are expected to know
            different health skills. This helps build your plan.
          </Text>

          {/* name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Taylor"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* age */}
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="16"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={ageText}
            onChangeText={setAgeText}
            style={styles.input}
          />

          {/* email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          {/* password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={pw}
            onChangeText={setPw}
            style={styles.input}
          />

          {/* button */}
          <Pressable style={styles.primaryBtn} onPress={handleCreate}>
            <Text style={styles.primaryBtnText}>Create account</Text>
          </Pressable>

          {/* feedback */}
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
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
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
