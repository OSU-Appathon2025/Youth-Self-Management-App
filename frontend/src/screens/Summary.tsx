// frontend/src/screens/Summary.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, Platform, ScrollView, Share, ActivityIndicator, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getHealthInfo } from "../services/api/healthInfo";
import { getCurrentUser } from "../storage/userStore";

type Insurance = {
  planName: string;
  memberId: string;
  groupNumber: string;
  rxBin: string;
  rxPcn: string;
  phone: string;
};
type Contact = { name: string; relation: string; phone: string; };
type Profile = { preferredPharmacy: string; allergies: string; medications: string; };

export default function Summary({ route, navigation }: any) {
  const paramsData = route.params || {};
  const [insurance, setInsurance] = useState<Insurance | undefined>(paramsData.insurance);
  const [contact, setContact] = useState<Contact | undefined>(paramsData.contact);
  const [profile, setProfile] = useState<Profile | undefined>(paramsData.profile);
  const [isLoading, setIsLoading] = useState(!paramsData.insurance);
  const [userName, setUserName] = useState("");

  // Load from backend if no params provided
  useEffect(() => {
    if (!paramsData.insurance) {
      loadHealthData();
    }
    loadUserName();
  }, []);

  async function loadUserName() {
    const user = await getCurrentUser();
    if (user) {
      setUserName(user.name);
    }
  }

  async function loadHealthData() {
    setIsLoading(true);
    const result = await getHealthInfo();

    if (result.ok && result.data?.healthInfo) {
      const data = result.data.healthInfo;

      // Map backend to display format
      const loadedInsurance: Insurance = {
        planName: data.insurance_provider || "",
        memberId: data.insurance_id || "",
        groupNumber: "",
        rxBin: "",
        rxPcn: "",
        phone: "",
      };

      const loadedProfile: Profile = {
        preferredPharmacy: "",
        allergies: data.allergies || "",
        medications: "",
      };

      const loadedContact: Contact = {
        name: "",
        relation: "",
        phone: "",
      };

      // Parse health_summary
      if (data.health_summary) {
        const parts = data.health_summary.split(" | ");
        parts.forEach((part) => {
          if (part.startsWith("Group: ")) loadedInsurance.groupNumber = part.replace("Group: ", "");
          else if (part.startsWith("RX BIN: ")) loadedInsurance.rxBin = part.replace("RX BIN: ", "");
          else if (part.startsWith("RX PCN: ")) loadedInsurance.rxPcn = part.replace("RX PCN: ", "");
          else if (part.startsWith("Phone: ")) loadedInsurance.phone = part.replace("Phone: ", "");
          else if (part.startsWith("Pharmacy: ")) loadedProfile.preferredPharmacy = part.replace("Pharmacy: ", "");
          else if (part.startsWith("Medications: ")) loadedProfile.medications = part.replace("Medications: ", "");
          else if (part.startsWith("Emergency Contact: ")) {
            const contactMatch = part.match(/Emergency Contact: (.+?) \((.+?)\) (.+)/);
            if (contactMatch) {
              loadedContact.name = contactMatch[1];
              loadedContact.relation = contactMatch[2];
              loadedContact.phone = contactMatch[3];
            }
          }
        });
      }

      setInsurance(loadedInsurance);
      setProfile(loadedProfile);
      setContact(loadedContact);
    }

    setIsLoading(false);
  }

  const onPrint = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      alert("On device, we'll add Share/Print in a later step.");
    }
  };

  const onShare = async () => {
    const summary = buildTextSummary();
    try {
      await Share.share({
        message: summary,
        title: "My Health Summary",
      });
    } catch (error) {
      Alert.alert("Error", "Could not share summary");
    }
  };

  function buildTextSummary(): string {
    const lines = [];
    lines.push(`===== HEALTH SUMMARY =====`);
    if (userName) lines.push(`Name: ${userName}`);
    lines.push(``);

    lines.push(`--- INSURANCE ---`);
    if (insurance?.planName) lines.push(`Plan Name: ${insurance.planName}`);
    if (insurance?.memberId) lines.push(`Member ID: ${insurance.memberId}`);
    if (insurance?.groupNumber) lines.push(`Group #: ${insurance.groupNumber}`);
    if (insurance?.rxBin) lines.push(`RX BIN: ${insurance.rxBin}`);
    if (insurance?.rxPcn) lines.push(`RX PCN: ${insurance.rxPcn}`);
    if (insurance?.phone) lines.push(`Phone: ${insurance.phone}`);
    lines.push(``);

    lines.push(`--- EMERGENCY CONTACT ---`);
    if (contact?.name) lines.push(`Name: ${contact.name}`);
    if (contact?.relation) lines.push(`Relation: ${contact.relation}`);
    if (contact?.phone) lines.push(`Phone: ${contact.phone}`);
    lines.push(``);

    lines.push(`--- HEALTH INFO ---`);
    if (profile?.allergies) lines.push(`Allergies: ${profile.allergies}`);
    if (profile?.medications) lines.push(`Medications: ${profile.medications}`);
    if (profile?.preferredPharmacy) lines.push(`Preferred Pharmacy: ${profile.preferredPharmacy}`);
    lines.push(``);

    lines.push(`Generated by Youth Self-Management App`);
    return lines.join("\n");
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>Loading your health summary...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Summary</Text>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>← Back</Text></Pressable>
        </View>

        {userName ? (
          <View style={styles.nameCard}>
            <Text style={styles.nameLabel}>Patient Name</Text>
            <Text style={styles.nameValue}>{userName}</Text>
          </View>
        ) : null}

        <Block title="Insurance">
          <Line k="Plan Name" v={insurance?.planName} />
          <Line k="Member ID" v={insurance?.memberId} />
          <Line k="Group #" v={insurance?.groupNumber} />
          <Line k="RX BIN" v={insurance?.rxBin} />
          <Line k="RX PCN" v={insurance?.rxPcn} />
          <Line k="Phone on card" v={insurance?.phone} />
        </Block>

        <Block title="Emergency Contact">
          <Line k="Name" v={contact?.name} />
          <Line k="Relation" v={contact?.relation} />
          <Line k="Phone" v={contact?.phone} />
        </Block>

        <Block title="Allergies & Meds">
          <Line k="Allergies" v={profile?.allergies} />
          <Line k="Medications" v={profile?.medications} />
          <Line k="Preferred Pharmacy" v={profile?.preferredPharmacy} />
        </Block>

        <View style={styles.buttonRow}>
          {Platform.OS === "web" ? (
            <Pressable style={styles.actionBtn} onPress={onPrint}>
              <Ionicons name="print-outline" size={18} color="white" />
              <Text style={styles.actionText}>Print</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.actionBtn} onPress={onShare}>
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          )}
        </View>

        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8, textAlign: "center" }}>
          {Platform.OS === "web"
            ? "Click Print to save as PDF or print this summary"
            : "Share this summary via text, email, or other apps"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <View style={{ gap: 6 }}>{children}</View>
    </View>
  );
}
function Line({ k, v }: { k: string; v: string | undefined }) {
  return (
    <View style={styles.line}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  link: { color: "#2563EB", fontWeight: "700" },

  nameCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  nameLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
  },
  nameValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  block: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, marginBottom: 12 },
  blockTitle: { fontWeight: "800", color: "#0F172A", marginBottom: 8 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  k: { color: "#6B7280" },
  v: { color: "#111827", fontWeight: "600", maxWidth: "60%" },

  buttonRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionText: { color: "white", fontWeight: "800" },

  // Legacy style for backwards compatibility
  printBtn: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  printText: { color: "white", fontWeight: "800" },
});
