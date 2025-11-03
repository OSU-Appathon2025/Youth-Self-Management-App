// frontend/src/screens/Appointments.tsx

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";

type Visit = {
  id: string;
  date: string;     // "2025-11-13"
  time: string;     // "12:30 pm"
  provider: string; // "Dr. Smith"
  reason: string;   // "Check-up"
};

const STORAGE_KEY = "ysma:visits";

export default function Appointments({ navigation }: any) {
  // form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [provider, setProvider] = useState("");
  const [reason, setReason] = useState("");

  // list of saved visits
  const [visits, setVisits] = useState<Visit[]>([]);
  const [statusMsg, setStatusMsg] = useState("");

  // load visits once on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setVisits(JSON.parse(raw) as Visit[]);
        } else {
          setVisits([]);
        }
      } catch {
        setVisits([]);
      }
    })();
  }, []);

  async function saveVisitsToStorage(next: Visit[]) {
    setVisits(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function handleSaveVisit() {
    if (!date.trim() || !time.trim() || !provider.trim() || !reason.trim()) {
      Alert.alert(
        "Missing info",
        "Please fill date, time, provider, and reason."
      );
      return;
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      date: date.trim(),
      time: time.trim(),
      provider: provider.trim(),
      reason: reason.trim(),
    };

    const nextList = [newVisit, ...visits];
    await saveVisitsToStorage(nextList);

    // clear form
    setDate("");
    setTime("");
    setProvider("");
    setReason("");

    // little success message
    setStatusMsg("Visit saved!");
    setTimeout(() => setStatusMsg(""), 2000);
  }

  async function handleDeleteVisit(id: string) {
    const nextList = visits.filter((v) => v.id !== id);
    await saveVisitsToStorage(nextList);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={styles.pageWrap}>
        {/* header row with Back + title */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.backWrap}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={16} color="#0F172A" />
          </Pressable>

          <Text style={styles.topTitle}>Appointments</Text>

          {/* spacer to center the title */}
          <View style={{ width: 24 }} />
        </View>

        {/* ADD A VISIT CARD */}
        <View style={styles.bigCard}>
          <Text style={styles.sectionHeader}>Add a visit</Text>

          <View style={styles.row2colWrap}>
            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.inputRow}
                placeholder="2025-11-13"
                placeholderTextColor="#94A3B8"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.inputRow}
                placeholder="12:30 pm"
                placeholderTextColor="#94A3B8"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Provider</Text>
            <TextInput
              style={styles.inputRow}
              placeholder="Dr. Smith"
              placeholderTextColor="#94A3B8"
              value={provider}
              onChangeText={setProvider}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput
              style={styles.inputRow}
              placeholder="Check-up"
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
            />
          </View>

          <Pressable style={styles.primaryBtn} onPress={handleSaveVisit}>
            <Text style={styles.primaryBtnText}>Save Visit</Text>
          </Pressable>

          {statusMsg ? (
            <Text style={styles.savedText}>{statusMsg}</Text>
          ) : null}
        </View>

        {/* VISIT LIST CARD */}
        <View style={styles.bigCard}>
          <Text style={styles.sectionHeader}>Your visits</Text>

          {visits.length === 0 ? (
            <Text style={styles.emptyText}>No visits saved yet.</Text>
          ) : (
            visits.map((v) => (
              <View key={v.id} style={styles.visitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitMain}>
                    {v.date} • {v.time}
                  </Text>
                  <Text style={styles.visitSub}>
                    <Text style={{ fontWeight: "700" }}>Provider: </Text>
                    {v.provider}
                  </Text>
                  <Text style={styles.visitSub}>
                    <Text style={{ fontWeight: "700" }}>Reason: </Text>
                    {v.reason}
                  </Text>
                </View>

                <View style={styles.visitActionsCol}>
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteVisit(v.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    padding: 16,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  backWrap: {
    padding: 4,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  bigCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  row2colWrap: {
    flexDirection: "row",
    gap: 16,
  },
  colHalf: {
    flex: 1,
    marginBottom: 16,
  },

  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 14,
    marginBottom: 6,
  },
  inputRow: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
    fontWeight: "600",
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  savedText: {
    marginTop: 8,
    fontWeight: "700",
    color: "#10B981",
    textAlign: "center",
  },

  emptyText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },

  visitRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  visitMain: {
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  visitSub: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },

  visitActionsCol: {
    justifyContent: "center",
    marginLeft: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
