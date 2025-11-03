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
      setInsurance({
        planName: data.insurance_provider || "",
        memberId: data.insurance_id || "",
        groupNumber: "",
        rxBin: "",
        rxPcn: "",
        phone: "",
      });

      // Parse health_summary for additional fields
      const profile: Profile = {
        preferredPharmacy: "",
        allergies: data.allergies || "",
        medications: "",
      };

      if (data.health_summary) {
        const parts = data.health_summary.split(" | ");
        parts.forEach((part) => {
          if (part.startsWith("Pharmacy: ")) {
            profile.preferredPharmacy = part.replace("Pharmacy: ", "");
          }
          if (part.startsWith("Medications: ")) {
            profile.medications = part.replace("Medications: ", "");
          }
          if (part.startsWith("Group: ")) {
            setInsurance((prev) => ({ ...prev!, groupNumber: part.replace("Group: ", "") }));
          }
          if (part.startsWith("RX BIN: ")) {
            setInsurance((prev) => ({ ...prev!, rxBin: part.replace("RX BIN: ", "") }));
          }
          if (part.startsWith("RX PCN: ")) {
            setInsurance((prev) => ({ ...prev!, rxPcn: part.replace("RX PCN: ", "") }));
          }
          if (part.startsWith("Phone: ")) {
            setInsurance((prev) => ({ ...prev!, phone: part.replace("Phone: ", "") }));
          }
          if (part.startsWith("Emergency Contact: ")) {
            const contactInfo = part.replace("Emergency Contact: ", "");
            const [name, relation, phone] = contactInfo.split(" - ");
            setContact({ name: name || "", relation: relation || "", phone: phone || "" });
          }
        });
      }

      setProfile(profile);
    }

    setIsLoading(false);
  }

  const onPrint = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      Alert.alert("Print", "Print is only available on web.");
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
      console.error("Error sharing:", error);
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

    if (contact?.name) {
      lines.push(`--- EMERGENCY CONTACT ---`);
      lines.push(`Name: ${contact.name}`);
      lines.push(`Relation: ${contact.relation}`);
      lines.push(`Phone: ${contact.phone}`);
      lines.push(``);
    }

    lines.push(`--- ALLERGIES & MEDICATIONS ---`);
    if (profile?.allergies) lines.push(`Allergies: ${profile.allergies}`);
    if (profile?.medications) lines.push(`Medications: ${profile.medications}`);
    if (profile?.preferredPharmacy) lines.push(`Preferred Pharmacy: ${profile.preferredPharmacy}`);
    lines.push(``);

    return lines.join("\n");
  }

  function rowVal(str: string | undefined) {
    return str && str.trim() ? str : "—";
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>Loading health information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* header with back */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={16} color="#2563EB" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Health Summary</Text>

          <View style={{ width: 48 }} />
        </View>

        {userName ? (
          <View style={styles.nameCard}>
            <Text style={styles.nameLabel}>Patient Name</Text>
            <Text style={styles.nameValue}>{userName}</Text>
          </View>
        ) : null}

        {/* INSURANCE */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Insurance</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Plan Name</Text>
            <Text style={styles.rightVal}>{rowVal(insurance?.planName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Member ID</Text>
            <Text style={styles.rightVal}>{rowVal(insurance?.memberId)}</Text>
          </View>

          {insurance?.groupNumber ? (
            <View style={styles.row}>
              <Text style={styles.leftLabel}>Group #</Text>
              <Text style={styles.rightVal}>{rowVal(insurance.groupNumber)}</Text>
            </View>
          ) : null}

          {insurance?.rxBin ? (
            <View style={styles.row}>
              <Text style={styles.leftLabel}>RX BIN</Text>
              <Text style={styles.rightVal}>{rowVal(insurance.rxBin)}</Text>
            </View>
          ) : null}

          {insurance?.rxPcn ? (
            <View style={styles.row}>
              <Text style={styles.leftLabel}>RX PCN</Text>
              <Text style={styles.rightVal}>{rowVal(insurance.rxPcn)}</Text>
            </View>
          ) : null}

          {insurance?.phone ? (
            <View style={styles.row}>
              <Text style={styles.leftLabel}>Phone</Text>
              <Text style={styles.rightVal}>{rowVal(insurance.phone)}</Text>
            </View>
          ) : null}
        </View>

        {/* EMERGENCY CONTACT */}
        {contact?.name ? (
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Emergency Contact</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.leftLabel}>Name</Text>
              <Text style={styles.rightVal}>{rowVal(contact.name)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.leftLabel}>Relation</Text>
              <Text style={styles.rightVal}>{rowVal(contact.relation)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.leftLabel}>Phone</Text>
              <Text style={styles.rightVal}>{rowVal(contact.phone)}</Text>
            </View>
          </View>
        ) : null}

        {/* ALLERGIES & MEDS */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Allergies & Medications</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Allergies</Text>
            <Text style={styles.rightVal}>{rowVal(profile?.allergies)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Medications</Text>
            <Text style={styles.rightVal}>{rowVal(profile?.medications)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Preferred Pharmacy</Text>
            <Text style={styles.rightVal}>{rowVal(profile?.preferredPharmacy)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
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

        <Text style={styles.disclaimer}>
          This summary can be printed or shared with your healthcare provider.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: { color: "#2563EB", fontWeight: "700" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },

  nameCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  nameLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nameValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  block: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  blockHeader: { marginBottom: 8 },
  blockTitle: { fontWeight: "800", color: "#0F172A", fontSize: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  leftLabel: { color: "#6B7280", fontWeight: "600", flex: 1 },
  rightVal: {
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

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

  disclaimer: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 12,
  },
});