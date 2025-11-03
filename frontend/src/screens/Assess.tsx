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
import BackHeader from "../components/BackHeader";
import {
  getVisits,
  addVisit,
  removeVisit,
  Visit,
} from "../storage/progressStore";

export default function Appointments({ navigation }: any) {
  // form state for "Add a visit"
  const [date, setDate] = useState("2025-11-13");
  const [time, setTime] = useState("12:30 pm");
  const [provider, setProvider] = useState("Dr. Smith");
  const [reason, setReason] = useState("Check-up");

  // saved visits
  const [visits, setVisits] = useState<Visit[]>([]);

  // load visits on mount
  useEffect(() => {
    (async () => {
      const all = await getVisits();
      setVisits(all);
    })();
  }, []);

  async function handleSaveVisit() {
    if (!date.trim() || !time.trim() || !provider.trim() || !reason.trim()) {
      Alert.alert("Missing info", "Please fill out all fields first.");
      return;
    }

    const newList = await addVisit({
      date,
      time,
      provider,
      reason,
    });

    setVisits(newList);

    Alert.alert("Saved ✅", "Your visit was added.");

    // you can also clear fields after save if you want
    // setDate("");
    // setTime("");
    // setProvider("");
    // setReason("");
  }

  async function handleDeleteVisit(id: string) {
    const newList = await removeVisit(id);
    setVisits(newList);
  }

  // Pretend actions for "Prep" and "Reflection"
  function goPrep(v: Visit) {
    // for now just alert, later this can go to a prep checklist screen
    Alert.alert("Prep", `Get ready for ${v.provider} (${v.reason})`);
  }

  function goReflection(v: Visit) {
    Alert.alert(
      "Reflection",
      `After ${v.provider}: How did it go? What do you still need?`
    );
  }

  function goLearnTopic() {
    // this is the "Learn" button you wanted.
    // send them to Learn screen (or OnboardingQuiz, whatever you want)
    navigation.navigate("Learn");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Appointments" navigation={navigation} />

        {/* ADD A VISIT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add a visit</Text>

          <View style={styles.rowSplit}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                style={styles.input}
              />
            </View>

            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.label}>Provider</Text>
          <TextInput
            value={provider}
            onChangeText={setProvider}
            style={styles.input}
          />

          <Text style={styles.label}>Reason</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            style={styles.input}
          />

          <Pressable style={styles.saveBtn} onPress={handleSaveVisit}>
            <Text style={styles.saveBtnText}>Save Visit</Text>
          </Pressable>
        </View>

        {/* YOUR VISITS */}
        <Text style={styles.sectionHeader}>Your visits</Text>

        {visits.map((v) => (
          <View key={v.id} style={styles.visitCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.visitTitle}>
                {v.date} • {v.time}
              </Text>
              <Text style={styles.visitRow}>
                <Text style={styles.visitLabel}>Provider: </Text>
                {v.provider}
              </Text>
              <Text style={styles.visitRow}>
                <Text style={styles.visitLabel}>Reason: </Text>
                {v.reason}
              </Text>

              <View style={styles.visitActionsRow}>
                <Pressable style={styles.tagBlue} onPress={() => goPrep(v)}>
                  <Text style={styles.tagBlueText}>Prep</Text>
                </Pressable>

                <Pressable
                  style={styles.tagGreen}
                  onPress={() => goReflection(v)}
                >
                  <Text style={styles.tagGreenText}>Reflection</Text>
                </Pressable>

                <Pressable style={styles.tagPurple} onPress={goLearnTopic}>
                  <Text style={styles.tagPurpleText}>Learn</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sideCol}>
              <Pressable style={styles.statusPill}>
                <Text style={styles.statusText}>Upcoming</Text>
              </Pressable>

              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDeleteVisit(v.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}

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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  rowSplit: {
    flexDirection: "row",
    marginBottom: 12,
  },

  label: {
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    fontSize: 14,
  },

  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
    fontWeight: "600",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "white",
    fontWeight: "800",
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  visitCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  visitTitle: {
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  visitRow: {
    fontWeight: "600",
    color: "#1F2937",
  },
  visitLabel: {
    fontWeight: "800",
    color: "#1F2937",
  },

  visitActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  tagBlue: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagBlueText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  tagGreen: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagGreenText: {
    color: "#065F46",
    fontWeight: "700",
  },

  tagPurple: {
    backgroundColor: "#F3E8FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagPurpleText: {
    color: "#6D28D9",
    fontWeight: "700",
  },

  sideCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
  },

  statusPill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  statusText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  deleteBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteText: {
    color: "white",
    fontWeight: "700",
  },
});
