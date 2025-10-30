// frontend/src/screens/Summary.tsx
import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Summary({ route, navigation }: any) {
  const { insurance, contact, profile } = route.params || {};

  const onPrint = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      alert("On device, we’ll add Share/Print in a later step.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Summary</Text>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>← Back</Text></Pressable>
        </View>

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

        <Pressable style={styles.printBtn} onPress={onPrint}>
          <Ionicons name="print-outline" size={18} color="white" />
          <Text style={styles.printText}>Print</Text>
        </Pressable>

        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>
          MVP print preview. Full PDF export coming later.
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

  block: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, marginBottom: 12 },
  blockTitle: { fontWeight: "800", color: "#0F172A", marginBottom: 8 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  k: { color: "#6B7280" },
  v: { color: "#111827", fontWeight: "600", maxWidth: "60%" },

  printBtn: {
    marginTop: 10, backgroundColor: "#2563EB", paddingVertical: 12, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
  },
  printText: { color: "white", fontWeight: "800" },
});
