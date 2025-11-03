import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

export default function AuthLandingScreen({ navigation }: any) {
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
            onPress={() => navigation.navigate("CreateAccount")}
          >
            <Text style={styles.bigBtnText}>I'm new – Create Account</Text>
          </Pressable>

          <Pressable
            style={[styles.bigBtn, { backgroundColor: "#0F172A" }]}
            onPress={() => navigation.navigate("LogIn")}
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
