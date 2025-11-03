// frontend/src/screens/MyHealthInfo.tsx

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getHealthInfo,
  saveHealthInfo,
  HealthInfo,
} from "../storage/healthStore";

export default function MyHealthInfo({ navigation }: any) {
  // all the fields we care about
  const [fullName, setFullName] = useState("");
  const [diagnoses, setDiagnoses] = useState("");
  const [meds, setMeds] = useState("");
  const [allergies, setAllergies] = useState("");
  const [insuranceCard, setInsuranceCard] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [preferredPharmacy, setPreferredPharmacy] = useState("");

  const [statusMsg, setStatusMsg] = useState("");

  // load saved info once
  useEffect(() => {
    (async () => {
      const data = await getHealthInfo();
      setFullName(data.fullName);
      setDiagnoses(data.diagnoses);
      setMeds(data.meds);
      setAllergies(data.allergies);
      setInsuranceCard(data.insuranceCard);
      setEmergencyName(data.emergencyName);
      setEmergencyRelation(data.emergencyRelation);
      setEmergencyPhone(data.emergencyPhone);
      setPreferredPharmacy(data.preferredPharmacy);
    })();
  }, []);

  async function handleSave() {
    const payload: HealthInfo = {
      fullName,
      diagnoses,
      meds,
      allergies,
      insuranceCard,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
      preferredPharmacy,
    };

    await saveHealthInfo(payload);

    setStatusMsg("Saved!");
    setTimeout(() => setStatusMsg(""), 2000);
  }

  function handleExport() {
    navigation.navigate("Summary");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={styles.pageWrap}>
        {/* Top bar: back + title (like your screenshots) */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.backWrap}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={16} color="#0F172A" />
          </Pressable>

          <Text style={styles.topTitle}>My Info</Text>

          {/* spacer so the title stays centered */}
          <View style={{ width: 24 }} />
        </View>

        {/* Big white panel area like your wide layout */}
        <View style={styles.bigCard}>
          {/* each field block */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Your full name</Text>
            <TextInput
              style={styles.inputRow}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Conditions / diagnoses</Text>
            <TextInput
              style={styles.inputRow}
              value={diagnoses}
              onChangeText={setDiagnoses}
              placeholder="asthma, lupus..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Medicines and doses</Text>
            <TextInput
              style={styles.inputRow}
              value={meds}
              onChangeText={setMeds}
              placeholder="albuterol 2 puffs 2x/day"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Allergies</Text>
            <TextInput
              style={styles.inputRow}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="nuts, penicillin..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Insurance / ID info</Text>
            <TextInput
              style={[styles.inputRow, { minHeight: 60 }]}
              value={insuranceCard}
              onChangeText={setInsuranceCard}
              placeholder="Plan / Member ID / Group # / RX BIN / phone on card"
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Emergency contact name</Text>
            <TextInput
              style={styles.inputRow}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Emergency contact relation</Text>
            <TextInput
              style={styles.inputRow}
              value={emergencyRelation}
              onChangeText={setEmergencyRelation}
              placeholder="mom, sister, friend..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Emergency contact phone</Text>
            <TextInput
              style={styles.inputRow}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              placeholder="###-###-####"
              placeholderTextColor="#94A3B8"
              keyboardType={Platform.OS === "web" ? "default" : "phone-pad"}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              Preferred pharmacy / location
            </Text>
            <TextInput
              style={styles.inputRow}
              value={preferredPharmacy}
              onChangeText={setPreferredPharmacy}
              placeholder="CVS on High St"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Save button */}
          <Pressable style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Save Info</Text>
          </Pressable>

          {statusMsg ? (
            <Text style={styles.savedText}>{statusMsg}</Text>
          ) : null}

          {/* Export button */}
          <Pressable style={styles.secondaryBtn} onPress={handleExport}>
            <Text style={styles.secondaryBtnText}>
              Export / Print Summary
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    padding: 16,
    // on big screens it'll still just stretch, but leaving padding so
    // it doesn't touch the browser edges
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
    marginTop: 8,
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

  secondaryBtn: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  secondaryBtnText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 15,
  },
});
