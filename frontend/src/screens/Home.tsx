// frontend/src/screens/Home.tsx
import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

type NextAppt = {
  dateLabel: string;
  timeLabel: string;
  provider: string;
  reason: string;
};

type TodoItem = {
  id: string;
  type: "assessment" | "goal";
  title: string;
  etaMin?: number;
  status: "todo" | "doing" | "done";
};

type HomeProps = {
  navigation: any;
  route?: { params?: { needsAssessment?: boolean } };
};

const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({
  children,
  style,
}) => <View style={[styles.card, style]}>{children}</View>;

const Chip: React.FC<{ label: string; color?: string }> = ({
  label,
  color,
}) => (
  <View style={[styles.chip, color ? { backgroundColor: color } : null]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const Row = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.apptRow}>
    <Ionicons name={icon} size={18} color="#2563EB" />
    <Text style={styles.apptText}>{text}</Text>
  </View>
);

const SquareAction = ({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.square, { backgroundColor: color }]}>
    <View style={{ alignItems: "center" }}>{icon}</View>
    <Text style={styles.squareLabel}>{label}</Text>
  </Pressable>
);

export default function Home({ navigation, route }: HomeProps) {
  // ----- Demo data (replace with real data later) -----
  const points = 120;
  const weeklyProgress = 0.65;
  const needsAssessment = route?.params?.needsAssessment ?? false;

  const nextAppt: NextAppt = {
    dateLabel: "Tuesday, Oct 29",
    timeLabel: "3:00 PM",
    provider: "Dr. Nguyen",
    reason: "Check-up",
  };

  // Base todos
  let todos: TodoItem[] = [
    {
      id: "t1",
      type: "assessment",
      title: "Insurance Basics Assessment",
      etaMin: 3,
      status: "todo",
    },
    {
      id: "t2",
      type: "goal",
      title: "Carry insurance card daily",
      status: "doing",
    },
  ];

  // If the user hasn’t taken the starter assessment, inject it to the top
  if (needsAssessment) {
    todos = [
      {
        id: "assess-starter",
        type: "assessment",
        title: "Starter Assessment (20 questions)",
        etaMin: 6,
        status: "todo",
      },
      ...todos,
    ];
  }

  // ----- Computed -----
  const progressPct = Math.round(weeklyProgress * 100);
  const todoCount = useMemo(
    () => todos.filter((t) => t.status !== "done").length,
    [todos]
  );

  // ----- Navigation helpers -----
  const goAppointments = () => navigation.navigate("Appointments");
  const goMyInfo = () => navigation.navigate("MyHealthInfo");
  const goSummary = () => navigation.navigate("Summary");
  const goLearn = () => navigation.navigate("Learn");
  const goShop = () => navigation.navigate("Rewards");
  const goAddVisit = () => navigation.navigate("Appointments", { add: true });

  const startAssessment = (id: string) => {
    // If it’s the starter assessment, send a flag so Assess screen knows what to load
    const isStarter = id === "assess-starter";
    navigation.navigate("Assess", { mode: isStarter ? "starter" : "module" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.petBadge}>
              <Text style={{ fontSize: 12, color: "#0F172A", fontWeight: "700" }}>
                L2
              </Text>
              <Text style={{ fontSize: 14 }}>🙂</Text>
            </View>
            <View>
              <Text style={styles.hello}>Hey there! 👋</Text>
              <Text style={styles.subtitle}>You're doing great</Text>
            </View>
          </View>

          <View style={styles.pointsPill}>
            <Text style={{ fontSize: 14 }}>⚡</Text>
            <Text style={styles.pointsText}>{points}</Text>
            <Text style={styles.pointsSub}>pts</Text>
          </View>
        </View>

        {/* Needs assessment banner */}
        {needsAssessment ? (
          <Card style={{ backgroundColor: "#EEF2FF" }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <Ionicons name="alert-circle" size={20} color="#1D4ED8" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: "#1D4ED8" }}>
                  Complete your starter assessment
                </Text>
                <Text style={{ color: "#1F2937", marginTop: 4 }}>
                  Take a quick 20-question quiz to build your personalized plan.
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.primaryBtn, { marginTop: 12, backgroundColor: "#1D4ED8" }]}
              onPress={() => startAssessment("assess-starter")}
            >
              <Text style={styles.primaryBtnText}>Start assessment →</Text>
            </Pressable>
          </Card>
        ) : null}

        {/* This Week */}
        <Card>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>This Week</Text>
              <Text style={styles.muted}>Keep up the momentum!</Text>
            </View>
            <View style={styles.ring}>
              <Text style={{ fontWeight: "700", color: "#2563EB" }}>
                {progressPct}%
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
        </Card>

        {/* Coming Up */}
        <Text style={styles.sectionTitle}>Coming Up</Text>
        <Card>
          <Text style={styles.cardSubtitle}>Next Appointment</Text>
          <Row icon="calendar-outline" text={nextAppt.dateLabel} />
          <Row icon="time-outline" text={nextAppt.timeLabel} />
          <Row icon="person-outline" text={nextAppt.provider} />
          <Text style={[styles.muted, { marginTop: 6 }]}>{nextAppt.reason}</Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={goAppointments}
          >
            <Text style={styles.primaryBtnText}>Start Prep  →</Text>
          </Pressable>
        </Card>

        {/* To-Do */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>To-Do</Text>
          <View style={styles.itemsPill}>
            <Text style={{ color: "#065F46", fontWeight: "700" }}>
              {todoCount} items
            </Text>
          </View>
        </View>

        {todos.map((t) => (
          <Card key={t.id} style={{ paddingVertical: 14 }}>
            <View style={styles.todoHeader}>
              <View style={styles.radio} />
              <View style={{ flex: 1 }}>
                <View style={styles.todoLine1}>
                  <Chip
                    label={t.type === "assessment" ? "Assessment" : "Goal"}
                    color={t.type === "assessment" ? "#E0ECFF" : "#DCFCE7"}
                  />
                  {t.etaMin ? (
                    <View style={styles.eta}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.etaText}>{t.etaMin} min</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.todoTitle}>{t.title}</Text>
              </View>

              {t.type === "assessment" ? (
                <Pressable
                  style={styles.startBtn}
                  onPress={() => startAssessment(t.id)}
                >
                  <Text style={styles.startBtnText}>Start</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.continueBtn} onPress={goLearn}>
                  <Text style={styles.startBtnText}>Continue</Text>
                </Pressable>
              )}
            </View>
          </Card>
        ))}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <SquareAction
            color="#2563EB"
            icon={<MaterialIcons name="event-available" size={22} color="white" />}
            label="Add Visit"
            onPress={goAddVisit}
          />
          <SquareAction
            color="#10B981"
            icon={<Ionicons name="shield-checkmark" size={22} color="white" />}
            label="My Info"
            onPress={goMyInfo}
          />
          <SquareAction
            color="#7C3AED"
            icon={<Ionicons name="print-outline" size={22} color="white" />}
            label="Print Summary"
            onPress={goSummary}
          />
          <SquareAction
            color="#0284C7"
            icon={<FontAwesome5 name="play" size={18} color="white" />}
            label="Watch & Learn"
            onPress={goLearn}
          />
        </View>

        {/* Shop Banner */}
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>Visit the Shop!</Text>
          <Text style={styles.shopSub}>
            You have {points} points to spend on cool stuff
          </Text>
          <Pressable style={styles.shopBtn} onPress={goShop}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  petBadge: {
    backgroundColor: "#E0F2FE",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hello: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  subtitle: { color: "#64748B", marginTop: 2 },
  pointsPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pointsText: { fontWeight: "800", color: "#0F172A" },
  pointsSub: { color: "#64748B", marginLeft: 2 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  muted: { color: "#64748B" },
  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#BFDBFE",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#2563EB" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 6,
  },
  apptRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  apptText: { color: "#111827", fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800" },

  itemsPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todoHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  todoLine1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  chipText: { color: "#1F2937", fontWeight: "700", fontSize: 12 },
  eta: { flexDirection: "row", alignItems: "center", gap: 4 },
  etaText: { color: "#64748B", fontSize: 12 },
  todoTitle: { fontWeight: "700", color: "#0F172A" },
  startBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  continueBtn: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startBtnText: { color: "#1D4ED8", fontWeight: "700" },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  square: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  squareLabel: { color: "white", fontWeight: "700", textAlign: "center" },

  shopCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#6366F1",
    overflow: "hidden",
  },
  shopTitle: { color: "white", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  shopSub: { color: "white", opacity: 0.9, marginBottom: 12 },
  shopBtn: {
    backgroundColor: "white",
    borderRadius: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shopBtnText: { color: "#3730A3", fontWeight: "800" },
});
