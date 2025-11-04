/// frontend/src/screens/Learn.tsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MODULES } from "../data/curriculum";

export default function Learn({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* header bar */}
      <View style={styles.headerBar}>
        <Pressable style={styles.backBtnRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Learn & Practice</Text>

        {/* spacer to center title */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollWrap}>
        <Text style={styles.introTitle}>What do you want to work on?</Text>
        <Text style={styles.introSub}>
          Pick something. Read the info. Do a quick check. Earn points.
        </Text>

        <View style={styles.listWrap}>
          {MODULES.map((mod) => (
            <Pressable
              key={mod.id}
              style={({ pressed }) => [
                styles.card,
                pressed && { backgroundColor: "#F8FAFF" },
              ]}
              onPress={() => {
                // Navigate to TopicDetails with the module's video source
                navigation.navigate("TopicDetails", { 
                  topicId: mod.id,
                  title: mod.title,
                  subtitle: mod.description,
                  videoSource: mod.videoSource, // Pass the video source
                });
              }}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.iconBubble}>
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color="#1E3A8A"
                  />
                </View>

                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.cardTitle}>{mod.title}</Text>
                  <Text style={styles.cardDesc}>{mod.description}</Text>

                  <Text style={styles.cardSteps}>
                    {mod.lessons.length} steps
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#2563EB"
                />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  backBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  backText: {
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 6,
    fontSize: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
  },
  scrollWrap: {
    padding: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  introSub: {
    color: "#475569",
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 16,
  },

  listWrap: {
    width: "100%",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconBubble: {
    backgroundColor: "#DBEAFE",
    borderRadius: 24,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitle: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
    marginBottom: 4,
  },

  cardDesc: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 8,
  },

  cardSteps: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
});