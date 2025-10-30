import React, { useState } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";

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

export default function MyHealthInfo({ navigation }: any) {
  const [insurance, setInsurance] = useState<Insurance>({
    planName: "", memberId: "", groupNumber: "", rxBin: "", rxPcn: "", phone: "",
  });
  const [contact, setContact] = useState<Contact>({ name: "", relation: "", phone: "" });
  const [profile, setProfile] = useState<Profile>({ preferredPharmacy: "", allergies: "", medications: "" });

  const dirty =
    Object.values(insurance).some(Boolean) ||
    Object.values(contact).some(Boolean) ||
    Object.values(profile).some(Boolean);

  const validate = () => {
    if (!contact.name || !contact.phone) {
      Alert.alert("Add an emergency contact","Please include at least a name and phone number.");
      return false;
    }
    if (!insurance.planName || !insurance.memberId) {
      Alert.alert("Insurance basics","Please include plan name and member ID.");
      return false;
    }
    return true;
  };

  const onSave = () => { if (!validate()) return; Alert.alert("Saved!", "Your info is saved on this device for now."); };
  const onExportSummary = () => navigation.navigate("Summary", { insurance, contact, profile });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.h1}>My Info</Text>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>← Home</Text></Pressable>
        </View>

        <InfoCard
          title="What goes in the vault?"
          bullets={[
            "Insurance info (plan name, member ID, phone on the card)",
            "Emergency contact (a parent/guardian or trusted adult)",
            "Allergies & current meds",
            "Preferred pharmacy name or address",
          ]}
          tip="Find insurance details on your card. Ask a parent/guardian if you don’t have it yet."
        />

        <Section title="Insurance">
          <Tip title="What to include">Plan name, member ID, group number, pharmacy BIN/PCN, phone on the back.</Tip>
          <Field label="Plan Name" placeholder="Buckeye Health" value={insurance.planName} onChangeText={(v)=>setInsurance({...insurance, planName:v})}/>
          <Field label="Member ID" placeholder="ABC1234567" value={insurance.memberId} onChangeText={(v)=>setInsurance({...insurance, memberId:v})}/>
          <Field label="Group # (optional)" placeholder="123456" value={insurance.groupNumber} onChangeText={(v)=>setInsurance({...insurance, groupNumber:v})}/>
          <TwoCol>
            <Field label="RX BIN (optional)" placeholder="610011" value={insurance.rxBin} onChangeText={(v)=>setInsurance({...insurance, rxBin:v})}/>
            <Field label="RX PCN (optional)" placeholder="A4" value={insurance.rxPcn} onChangeText={(v)=>setInsurance({...insurance, rxPcn:v})}/>
          </TwoCol>
          <Field label="Phone on card" placeholder="800-555-1234" value={insurance.phone} onChangeText={(v)=>setInsurance({...insurance, phone:v})}/>
        </Section>

        <Section title="Emergency Contact">
          <Tip title="Who is this?">This is the adult the clinic should call in an emergency.</Tip>
          <Field label="Name" placeholder="Jane Doe" value={contact.name} onChangeText={(v)=>setContact({...contact, name:v})}/>
          <TwoCol>
            <Field label="Relation" placeholder="Parent / Aunt / Guardian" value={contact.relation} onChangeText={(v)=>setContact({...contact, relation:v})}/>
            <Field label="Phone" placeholder="614-555-1212" value={contact.phone} onChangeText={(v)=>setContact({...contact, phone:v})}/>
          </TwoCol>
        </Section>

        <Section title="Allergies & Medications">
          <Field label="Allergies" placeholder="Peanuts, penicillin… (or 'None')" value={profile.allergies} onChangeText={(v)=>setProfile({...profile, allergies:v})} multiline/>
          <Field label="Current Medications" placeholder="Adderall 10mg daily; Claritin as needed…" value={profile.medications} onChangeText={(v)=>setProfile({...profile, medications:v})} multiline/>
          <Field label="Preferred Pharmacy" placeholder="Kroger, 123 High St, Columbus" value={profile.preferredPharmacy} onChangeText={(v)=>setProfile({...profile, preferredPharmacy:v})}/>
        </Section>

        <View style={{ height: 8 }} />
        <Pressable style={styles.primaryBtn} onPress={onSave}><Text style={styles.primaryText}>Save</Text></Pressable>
        <Pressable style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={onExportSummary}>
          <Text style={styles.secondaryText}>Export Summary →</Text>
        </Pressable>

        {!dirty ? <Text style={[styles.muted, { marginTop: 8 }]}>Tip: Fill at least Insurance + Emergency contact. You can add the rest later.</Text> : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** UI bits */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.tip}>
      <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
      <View style={{ flex: 1 }}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipText}>{children}</Text>
      </View>
    </View>
  );
}
function InfoCard({ title, bullets, tip }:{ title:string; bullets:string[]; tip?:string }) {
  return (
    <View style={[styles.card, { marginBottom: 12 }]}>
      <Text style={styles.h2}>{title}</Text>
      <View style={{ marginTop: 6 }}>
        {bullets.map((b, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ marginRight: 6 }}>•</Text>
            <Text style={{ flex: 1, color: "#111827" }}>{b}</Text>
          </View>
        ))}
      </View>
      {tip ? <Text style={[styles.muted, { marginTop: 6 }]}>{tip}</Text> : null}
    </View>
  );
}
function TwoCol({ children }: { children: React.ReactNode }) {
  const arr = React.Children.toArray(children);
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <View style={{ flex: 1 }}>{arr[0]}</View>
      <View style={{ flex: 1 }}>{arr[1]}</View>
    </View>
  );
}
function Field({ label, placeholder, value, onChangeText, keyboardType, multiline }:{
  label: string; placeholder?: string; value: string; onChangeText: (v:string)=>void;
  keyboardType?: "default" | "phone-pad" | "email-address" | "numeric"; multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline ? { height: 90, textAlignVertical: "top" } : null]}
      />
    </View>
  );
}

/** styles */
const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:8 },
  h1:{ fontSize:22, fontWeight:"800", color:"#0F172A" },
  h2:{ fontSize:16, fontWeight:"800", color:"#0F172A" },
  link:{ color:"#2563EB", fontWeight:"700" },

  section:{ marginTop: 10 },
  sectionTitle:{ fontSize:14, fontWeight:"800", color:"#0F172A", marginBottom:6 },
  card:{ backgroundColor:"white", borderRadius:16, padding:16, shadowColor:"#1F2937", shadowOpacity:0.06, shadowRadius:8, shadowOffset:{width:0,height:3} },

  tip:{ flexDirection:"row", gap:8, backgroundColor:"#EFF6FF", borderRadius:12, padding:10, marginBottom:12 },
  tipTitle:{ fontWeight:"700", color:"#0F172A" },
  tipText:{ color:"#111827" },

  label:{ fontWeight:"700", color:"#0F172A", marginBottom:6 },
  input:{ backgroundColor:"#F3F4F6", borderRadius:10, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:"#E5E7EB", color:"#111827" },

  muted:{ color:"#64748B" },
  primaryBtn:{ backgroundColor:"#2563EB", paddingVertical:12, borderRadius:12, alignItems:"center" },
  primaryText:{ color:"white", fontWeight:"800" },
  secondaryBtn:{ backgroundColor:"#EDE9FE", paddingVertical:12, borderRadius:12, alignItems:"center" },
  secondaryText:{ color:"#3730A3", fontWeight:"800" },
});
