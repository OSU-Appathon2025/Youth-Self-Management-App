// frontend/src/screens/Auth.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { signIn, signUp } from "../storage/userStore";

export default function Auth({ navigation }: any) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("Taylor");
  const [email, setEmail] = useState("you@example.com");
  const [pw, setPw] = useState("password");
  const [loading, setLoading] = useState(false);

  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });

  const onSubmit = async () => {
    if (loading) return;
    if (mode === "signup" && !name.trim()) {
      Alert.alert("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Please enter your email.");
      return;
    }
    if (!pw) {
      Alert.alert("Please enter your password.");
      return;
    }
    try {
      setLoading(true);
      if (mode === "signup") {
        await signUp(name.trim(), email.trim(), pw);
      } else {
        await signIn(email.trim(), pw);
      }
      goHome();
    } catch (e: any) {
      Alert.alert("Oops", e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Welcome</Text>

        <View style={s.modeRow}>
          <Pressable
            onPress={() => setMode("login")}
            style={[s.modeBtn, mode === "login" && s.modeActive]}
          >
            <Text style={[s.modeText, mode === "login" && s.modeTextActive]}>
              Log in
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("signup")}
            style={[s.modeBtn, mode === "signup" && s.modeActive]}
          >
            <Text style={[s.modeText, mode === "signup" && s.modeTextActive]}>
              Create account
            </Text>
          </Pressable>
        </View>

        {mode === "signup" && (
          <>
            <Text style={s.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Taylor"
              style={s.input}
            />
          </>
        )}

        <Text style={s.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          style={s.input}
        />

        <Text style={s.label}>Password</Text>
        <TextInput
          value={pw}
          onChangeText={setPw}
          placeholder="••••••••"
          secureTextEntry
          style={s.input}
        />

        <Pressable onPress={onSubmit} style={s.primary} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.primaryText}>
              {mode === "login" ? "Log in" : "Create account"}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={goHome} style={s.subtle}>
          <Text style={s.subtleText}>Skip for now →</Text>
        </Pressable>

        {mode === "signup" ? (
          <Text style={s.note}>
            You can take the assessment now or later. If you skip it, it’ll show
            on your Home screen until you finish.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  modeActive: { backgroundColor: "#2563EB" },
  modeText: { color: "#111827", fontWeight: "700" },
  modeTextActive: { color: "white" },
  label: { fontWeight: "700", color: "#334155", marginTop: 6 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primary: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryText: { color: "white", fontWeight: "800" },
  subtle: { alignItems: "center", marginTop: 8 },
  subtleText: { color: "#2563EB", fontWeight: "700" },
  note: { color: "#64748B", marginTop: 8 },
});
