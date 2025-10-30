import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Visit = {
  id: string;
  date: string;   // "2025-11-02"
  time: string;   // "15:00"
  provider: string;
  reason: string;
  notes?: string;
  done?: boolean; // reflection completed
};

export default function Appointments({ route }: any) {
  const [visits, setVisits] = useState<Visit[]>([
    { id: "v1", date: "2025-10-29", time: "15:00", provider: "Dr. Nguyen", reason: "Check-up" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [showPrep, setShowPrep] = useState<Visit | null>(null);
  const [showReflect, setShowReflect] = useState<Visit | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [provider, setProvider] = useState("");
  const [reason, setReason] = useState("");

  const [prepAnswers, setPrepAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [reflectAnswers, setReflectAnswers] = useState({ r1: "", r2: "", r3: "" });

  const shouldOpenAdd = route?.params?.add === true;

  React.useEffect(() => {
    if (shouldOpenAdd) setShowAdd(true);
  }, [shouldOpenAdd]);

  React.useEffect(() => {
    const fromHomeId = route?.params?.visitId as string | undefined;
    if (fromHomeId) {
      const v = visits.find((x) => x.id === fromHomeId) || visits[0];
      setShowPrep(v || null);
    }
  }, [route?.params, visits]);

  const upcoming = useMemo(() => {
    const sorted = [...visits].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return sorted;
  }, [visits]);

  const onAddVisit = () => {
    if (!date || !time || !provider || !reason) {
      Alert.alert("Missing info", "Please fill date, time, provider, and reason.");
      return;
    }
    const id = "v" + Math.random().toString(36).slice(2, 7);
    setVisits((v) => [{ id, date, time, provider, reason }, ...v]);
    setDate(""); setTime(""); setProvider(""); setReason("");
    setShowAdd(false);
  };

  const onDelete = (id: string) => setVisits((v) => v.filter((x) => x.id !== id));
  const openPrep = (v: Visit) => { setPrepAnswers({ q1: "", q2: "", q3: "" }); setShowPrep(v); };
  const savePrep = () => { setShowPrep(null); Alert.alert("Saved", "Prep notes saved for this visit."); };

  const openReflect = (v: Visit) => { setReflectAnswers({ r1: "", r2: "", r3: "" }); setShowReflect(v); };
  const saveReflect = () => {
    if (!showReflect) return;
    setVisits((old) => old.map((x) => (x.id === showReflect.id ? { ...x, done: true } : x)));
    setShowReflect(null);
    Alert.alert("Great job!", "Reflection saved. Visit marked as done.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={styles.h1}>Appointments</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowAdd((s) => !s)}>
            <Ionicons name={showAdd ? "close" : "add"} size={18} color="white" />
            <Text style={styles.addText}>{showAdd ? "Cancel" : "Add Visit"}</Text>
          </Pressable>
        </View>

        {showAdd && (
          <View style={styles.card}>
            <Text style={styles.h2}>Add a visit</Text>
            <TwoCol>
              <Field label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
              <Field label="Time" placeholder="HH:MM (24h)" value={time} onChangeText={setTime} />
            </TwoCol>
            <Field label="Provider" placeholder="Dr. Smith" value={provider} onChangeText={setProvider} />
            <Field label="Reason" placeholder="Check-up / Follow-up / Vaccination…" value={reason} onChangeText={setReason} />
            <Pressable style={styles.primaryBtn} onPress={onAddVisit}>
              <Text style={styles.primaryText}>Save Visit</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your visits</Text>
        {upcoming.length === 0 ? (
          <Empty message="No visits yet. Tap Add Visit to create one." />
        ) : (
          upcoming.map((v) => (
            <View key={v.id} style={styles.visitCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.visitTitle}>{v.date} • {v.time}</Text>
                {v.done ? <Text style={styles.donePill}>Done</Text> : <Text style={styles.upcomingPill}>Upcoming</Text>}
              </View>
              <Text style={styles.visitLine}><Text style={styles.bold}>Provider:</Text> {v.provider}</Text>
              <Text style={styles.visitLine}><Text style={styles.bold}>Reason:</Text> {v.reason}</Text>

              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={() => openPrep(v)}>
                  <Ionicons name="list-circle-outline" size={18} color="#2563EB" />
                  <Text style={styles.ghostText}>Prep</Text>
                </Pressable>
                <Pressable style={styles.ghostBtn} onPress={() => openReflect(v)}>
                  <Ionicons name="checkmark-done-circle-outline" size={18} color="#16A34A" />
                  <Text style={[styles.ghostText, { color: "#16A34A" }]}>Reflection</Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable style={styles.deleteBtn} onPress={() => onDelete(v.id)}>
                  <Ionicons name="trash-outline" size={16} color="white" />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {showPrep && (
        <Sheet title="Appointment Prep" onClose={() => setShowPrep(null)} onSave={savePrep}>
          <Hint text="Use this to get ready. You can show these notes during your visit." />
          <Q label="1) What do you want to ask your provider?"
             value={prepAnswers.q1} onChangeText={(v) => setPrepAnswers((s) => ({ ...s, q1: v }))} />
          <Q label="2) Any symptoms or changes to mention?"
             value={prepAnswers.q2} onChangeText={(v) => setPrepAnswers((s) => ({ ...s, q2: v }))} />
          <Q label="3) Anything you need (refills, forms, school note)?"
             value={prepAnswers.q3} onChangeText={(v) => setPrepAnswers((s) => ({ ...s, q3: v }))} />
        </Sheet>
      )}

      {showReflect && (
        <Sheet title="After-Visit Reflection" onClose={() => setShowReflect(null)} onSave={saveReflect} saveLabel="Mark Done">
          <Hint text="Quick recap so you remember next time." />
          <Q label="1) What did you learn or decide?"
             value={reflectAnswers.r1} onChangeText={(v) => setReflectAnswers((s) => ({ ...s, r1: v }))} />
          <Q label="2) Next steps (tests, meds, follow-up)?"
             value={reflectAnswers.r2} onChangeText={(v) => setReflectAnswers((s) => ({ ...s, r2: v }))} />
          <Q label="3) Any questions left?"
             value={reflectAnswers.r3} onChangeText={(v) => setReflectAnswers((s) => ({ ...s, r3: v }))} />
        </Sheet>
      )}
    </SafeAreaView>
  );
}

/** UI helpers **/
function Field({ label, placeholder, value, onChangeText }:{
  label: string; placeholder?: string; value: string; onChangeText: (v:string)=>void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} style={styles.input} />
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
function Empty({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}
function Hint({ text }: { text: string }) {
  return (
    <View style={styles.hint}>
      <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
      <Text style={{ color: "#111827", flex: 1, marginLeft: 6 }}>{text}</Text>
    </View>
  );
}
function Q({ label, value, onChangeText }:{
  label: string; value: string; onChangeText: (v:string)=>void;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontWeight: "700", color: "#0F172A", marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder="Type here…"
                 style={[styles.input, { height: 90, textAlignVertical: "top" }]} multiline />
    </View>
  );
}
function Sheet({ title, onClose, onSave, saveLabel="Save", children }:{
  title: string; onClose: () => void; onSave: () => void; saveLabel?: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.sheetWrap}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose}><Ionicons name="close" size={22} color="#374151" /></Pressable>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>{children}</ScrollView>
        <Pressable style={styles.primaryBtn} onPress={onSave}><Text style={styles.primaryText}>{saveLabel}</Text></Pressable>
      </View>
    </View>
  );
}

/** styles **/
const styles = StyleSheet.create({
  headerRow:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  h1:{ fontSize:22, fontWeight:"800", color:"#0F172A" },
  h2:{ fontSize:16, fontWeight:"800", color:"#0F172A", marginBottom:8 },

  card:{ backgroundColor:"white", borderRadius:16, padding:16, shadowColor:"#1F2937", shadowOpacity:0.06, shadowRadius:8, shadowOffset:{width:0,height:3}, marginBottom:14 },

  primaryBtn:{ backgroundColor:"#2563EB", paddingVertical:12, borderRadius:12, alignItems:"center", marginTop:6 },
  primaryText:{ color:"white", fontWeight:"800" },

  sectionTitle:{ fontSize:14, fontWeight:"800", color:"#0F172A", marginBottom:8, marginTop:6 },

  visitCard:{ backgroundColor:"white", borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:"#E5E7EB" },
  visitTitle:{ fontWeight:"800", color:"#0F172A", marginBottom:6 },
  visitLine:{ color:"#111827", marginBottom:4 },
  bold:{ fontWeight:"700" },

  row:{ flexDirection:"row", alignItems:"center", gap:10, marginTop:8 },

  ghostBtn:{ backgroundColor:"#EFF6FF", paddingVertical:8, paddingHorizontal:12, borderRadius:10, flexDirection:"row", alignItems:"center", gap:6 },
  ghostText:{ color:"#2563EB", fontWeight:"800" },

  deleteBtn:{ backgroundColor:"#EF4444", paddingVertical:8, paddingHorizontal:12, borderRadius:10, flexDirection:"row", alignItems:"center", gap:6 },
  deleteText:{ color:"white", fontWeight:"800" },

  donePill:{ color:"#065F46", backgroundColor:"#D1FAE5", paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:"800" },
  upcomingPill:{ color:"#1E40AF", backgroundColor:"#DBEAFE", paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:"800" },

  label:{ fontWeight:"700", color:"#0F172A", marginBottom:6 },
  input:{ backgroundColor:"#F3F4F6", borderRadius:10, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:"#E5E7EB", color:"#111827" },
  muted:{ color:"#64748B" },

  empty:{ backgroundColor:"white", borderRadius:12, padding:16, borderWidth:1, borderColor:"#E5E7EB" },
  hint:{ flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"#EFF6FF", borderRadius:10, padding:10, marginBottom:10 },

  sheetWrap:{ position:"absolute", left:0, right:0, bottom:0, top:0, backgroundColor:"rgba(15,23,42,0.35)", justifyContent:"flex-end" },
  sheet:{ backgroundColor:"white", padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
  sheetHeader:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  sheetTitle:{ fontWeight:"800", color:"#0F172A", fontSize:16 },
});
