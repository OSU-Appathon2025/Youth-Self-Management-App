// frontend/src/screens/Summary.tsx

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getHealthInfo, HealthInfo } from "../storage/healthStore";

export default function Summary({ navigation }: any) {
  const [info, setInfo] = useState<HealthInfo | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getHealthInfo();
      setInfo(data);
    })();
  }, []);

  // this is what "Print" does on web
  function handlePrint() {
    if (Platform.OS === "web") {
      window.print();
    } else {
      // placeholder for native - later we can add Share API or PDF gen
      alert("Print / PDF export is coming soon on mobile.");
    }
  }

  // tiny helper: show field or "—"
  function rowVal(v: string | undefined) {
    return v && v.trim() !== "" ? v : "—";
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

        {/* INSURANCE */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Insurance</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Insurance / ID info</Text>
            <Text style={styles.rightVal}>
              {rowVal(info?.insuranceCard)}
            </Text>
          </View>
        </View>

        {/* EMERGENCY CONTACT */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Emergency Contact</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Name</Text>
            <Text style={styles.rightVal}>{rowVal(info?.emergencyName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Relation</Text>
            <Text style={styles.rightVal}>
              {rowVal(info?.emergencyRelation)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Phone</Text>
            <Text style={styles.rightVal}>{rowVal(info?.emergencyPhone)}</Text>
          </View>
        </View>

        {/* ALLERGIES & MEDS */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Allergies & Meds</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Allergies</Text>
            <Text style={styles.rightVal}>{rowVal(info?.allergies)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Medications</Text>
            <Text style={styles.rightVal}>{rowVal(info?.meds)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.leftLabel}>Preferred Pharmacy</Text>
            <Text style={styles.rightVal}>
              {rowVal(info?.preferredPharmacy)}
            </Text>
          </View>
        </View>

        {/* CONDITIONS */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Conditions / Diagnoses</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.leftLabel}>Conditions</Text>
            <Text style={styles.rightVal}>{rowVal(info?.diagnoses)}</Text>
          </View>
        </View>

        {/* PRINT */}
        <Pressable style={styles.printBtn} onPress={handlePrint}>
          <Ionicons
            name="print-outline"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.printBtnText}>Print / Save PDF</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          You can print this page or Save as PDF and send to school, work,
          urgent care, etc.
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
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  block: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
  },
  blockHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  blockTitle: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftLabel: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },
  rightVal: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
    maxWidth: "60%",
    textAlign: "right",
  },

  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    marginBottom: 8,
  },
  printBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  disclaimer: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 16,
  },
});
