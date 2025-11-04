import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  getCurrentUser,
  UserProfile,
} from "../storage/userStore";
import { getAllAppointments, type Appointment } from "../services/api/appointments";
import { getPoints } from "../storage/progressStore";
import { DIALOGFLOW_PROJECT_ID, DIALOGFLOW_ACCESS_TOKEN } from '@env';

type Visit = {
  id: string;
  date: string;
  time: string;
  provider: string;
  reason: string;
};

// Shop Items
const SHOP_ITEMS = [
  { id: 'ballerina', name: 'Ballerina Outfit', cost: 50, image: require('../../assets/ballerinaoutfit.png') },
  { id: 'spider', name: 'Spider-Man Outfit', cost: 70, image: require('../../assets/spiderfit.png') },
  { id: 'phone', name: 'Phone', cost: 30, image: require('../../assets/phone.png') },
  { id: 'skateboard', name: 'Skateboard', cost: 45, image: require('../../assets/skateboard.png') },
];

// Caterpillar with accessories images
const DRESSED_CATERPILLARS = {
  ballerina: require('../../assets/ballerina_caterpillar.png'),
  spider: require('../../assets/spiderpillar.png'),
  phone: require('../../assets/phonepillar.png'),
  skateboard: require('../../assets/skatepillar.png'),
};

export default function Home({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [animFrame, setAnimFrame] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showCloset, setShowCloset] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [nextVisit, setNextVisit] = useState<Visit | null>(null);
  // Chatbot state
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Caterpillar animation frames
  const caterpillarFrames = [
    require('../../assets/cater1.png'),
    require('../../assets/cater2.png'),
    require('../../assets/cater3.png'),
  ];

  // Get dressed caterpillar or regular
  const getCurrentCaterpillar = () => {
    if (currentOutfit && DRESSED_CATERPILLARS[currentOutfit as keyof typeof DRESSED_CATERPILLARS]) {
      return DRESSED_CATERPILLARS[currentOutfit as keyof typeof DRESSED_CATERPILLARS];
    }
    return caterpillarFrames[animFrame];
  };

  // Animation effect - cycles through caterpillar frames (only when no outfit)
  useEffect(() => {
    if (currentOutfit) return; // Don't animate when wearing outfit
    
    const interval = setInterval(() => {
      setAnimFrame((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, [currentOutfit]);

  // helper: load user from storage
  async function load() {
    const u = await getCurrentUser();
    setUser(u);

    // Load points from progressStore instead of calculating from plan
    const points = await getPoints();
    setUserPoints(points);

    await loadAppointments();
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;

    const userMsg = { text: chatInput, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      const response = await fetch(
        `https://dialogflow.googleapis.com/v2/projects/${DIALOGFLOW_PROJECT_ID}/agent/sessions/123456789:detectIntent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DIALOGFLOW_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            queryInput: {
              text: { text: chatInput, languageCode: "en" },
            },
          }),
        }
      );

      const data = await response.json();
      const botReply =
        data.queryResult?.fulfillmentText ||
        "Sorry, I didn't understand that.";

      setMessages((prev) => [
        ...prev,
        { text: botReply, sender: "bot" },
      ]);
    } catch (err) {
      console.error("Dialogflow error:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to Dialogflow.", sender: "bot" },
      ]);
    }
  }

  // helper: load next appointment from backend
  async function loadAppointments() {
    try {
      console.log("Loading appointments...");
      const result = await getAllAppointments();
      console.log("getAllAppointments result:", result);

      if (result.ok && result.data?.appointments) {
        console.log("Appointments from backend:", result.data.appointments);

        // Sort appointments by date and get the next upcoming one
        const now = new Date();
        console.log("Current time:", now);

        const upcoming = result.data.appointments
          .map((apt: Appointment) => {
            const appointmentDate = new Date(apt.appointment_date);
            return {
              id: apt.id,
              date: appointmentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
              time: appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              provider: apt.provider || "Provider",
              reason: apt.purpose || "Appointment",
              rawDate: appointmentDate,
            };
          })
          .filter((v: any) => v.rawDate >= now)
          .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime());

        console.log("Upcoming appointments after filtering:", upcoming);

        if (upcoming.length > 0) {
          const { rawDate, ...visit } = upcoming[0];
          console.log("Setting next visit:", visit);
          setNextVisit(visit);
        } else {
          console.log("No upcoming appointments found");
          setNextVisit(null);
        }
      } else {
        console.log("No appointments data in result");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  }

  // load on mount
  useEffect(() => {
    load();
  }, []);

  // also reload every time Home comes back into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // if no user, shove them to Auth screen
  useEffect(() => {
    if (user === null) return;
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
    }
  }, [user, navigation]);

  const handleBuyItem = async (item: any) => {
    if (userPoints >= item.cost && !ownedItems.includes(item.id)) {
      const newPoints = userPoints - item.cost;
      const newOwnedItems = [...ownedItems, item.id];
      
      setUserPoints(newPoints);
      setOwnedItems(newOwnedItems);
      
      // Save to storage
      await AsyncStorage.setItem('userPoints', newPoints.toString());
      await AsyncStorage.setItem('ownedItems', JSON.stringify(newOwnedItems));
      
      alert(`You bought ${item.name}!`);
    } else if (ownedItems.includes(item.id)) {
      alert("You already own this item!");
    } else {
      alert("Not enough points!");
    }
  };

  const handleWearItem = async (itemId: string) => {
    setCurrentOutfit(itemId);
    await AsyncStorage.setItem('currentOutfit', itemId);
    setShowCloset(false);
    alert("Outfit equipped!");
  };

  const handleRemoveOutfit = async () => {
    setCurrentOutfit(null);
    await AsyncStorage.removeItem('currentOutfit');
    alert("Outfit removed!");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={{ color: "#64748B" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  // compute progress / points
  const goalsDone = user.plan.filter((g) => g.done).length;
  const totalGoals = user.plan.length;
  const progressPct =
    totalGoals === 0
      ? 0
      : Math.round((goalsDone / totalGoals) * 100);

  // To-Do = goals that are NOT done yet
  const remainingGoals = user.plan.filter((g) => !g.done);
  const needsAssessment = !user.hasCompletedAssessment;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeftRow}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarText}>
                {user.name?.[0]?.toUpperCase() || "Y"}
              </Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.helloText}>
                hey {user.name?.split(" ")[0] || "there"} 👋
              </Text>
              <Text style={styles.subHelloText}>
                here's your health stuff for today
              </Text>
            </View>
          </View>

          <View style={styles.pointsPill}>
            <Text style={styles.pointsNum}>{userPoints}</Text>
            <Text style={styles.pointsPts}>pts</Text>
          </View>
        </View>

        {/* If they didn't pass onboarding/assessment yet, put a banner */}
        {needsAssessment ? (
          <Pressable
            style={styles.assessmentBanner}
            onPress={() => navigation.navigate("FinalAssessment")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                Start your self-check
              </Text>
              <Text style={styles.bannerSub}>
                Quick questions so we know what to help you learn
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color="#2563EB"
            />
          </Pressable>
        ) : (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>This Week</Text>
                <Text style={styles.muted}>
                  Keep building your independence.
                </Text>
              </View>
              <View style={styles.ring}>
                <Text style={styles.ringText}>
                  {progressPct}%
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPct}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Animated Caterpillar with Shop/Closet buttons */}
        <View style={styles.caterpillarContainer}>
          <View style={styles.caterpillarControls}>
            <Pressable
              style={styles.controlBtn}
              onPress={() => setShowShop(true)}
            >
              <Text style={styles.controlBtnText}>🛍️ Shop</Text>
            </Pressable>
            <Pressable
              style={styles.controlBtn}
              onPress={() => setShowCloset(true)}
            >
              <Text style={styles.controlBtnText}>👕 Closet</Text>
            </Pressable>
          </View>
          
          <Image 
            source={getCurrentCaterpillar()} 
            style={styles.caterpillarImage}
            resizeMode="contain"
          />
          
          {currentOutfit && (
            <Pressable
              style={styles.removeOutfitBtn}
              onPress={handleRemoveOutfit}
            >
              <Text style={styles.removeOutfitText}>Remove Outfit</Text>
            </Pressable>
          )}
        </View>

        {/* Coming Up */}
        <Text style={styles.sectionTitle}>Coming Up</Text>
        <View style={styles.card}>
          {nextVisit ? (
            <>
              <Text style={styles.cardSubtitle}>
                Next Appointment
              </Text>

              <Row icon="calendar-outline" text={nextVisit.date} />
              <Row icon="time-outline" text={nextVisit.time} />
              <Row icon="person-outline" text={nextVisit.provider} />

              <Text style={[styles.muted, { marginTop: 6 }]}>
                {nextVisit.reason}
              </Text>

              <Pressable
                style={[styles.primaryBtn, { marginTop: 14 }]}
                onPress={() => navigation.navigate("Appointments")}
              >
                <Text style={styles.primaryBtnText}>
                  Start Prep  →
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.cardSubtitle}>
                No Upcoming Appointments
              </Text>
              <Text style={styles.muted}>
                Add your next appointment to get prepared.
              </Text>
              <Pressable
                style={[styles.primaryBtn, { marginTop: 14 }]}
                onPress={() => navigation.navigate("Appointments", { add: true })}
              >
                <Text style={styles.primaryBtnText}>
                  Add Appointment  →
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* To-Do / Goals */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>
            Your Skills
          </Text>
          <View style={styles.itemsPill}>
            <Text style={styles.itemsPillText}>
              {remainingGoals.length} left
            </Text>
          </View>
        </View>

        {remainingGoals.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.muted}>
              You're caught up on everything in your plan.
            </Text>
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 12, backgroundColor: "#10B981" },
              ]}
              onPress={() => navigation.navigate("Plan")}
            >
              <Text style={styles.primaryBtnText}>
                View full plan
              </Text>
            </Pressable>
          </View>
        ) : (
          remainingGoals.slice(0, 2).map((g) => (
            <View key={g.id} style={styles.card}>
              <View style={styles.todoHeader}>
                <View style={styles.radioEmpty} />
                <View style={{ flex: 1 }}>
                  <View style={styles.todoLine1}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        next step
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.todoTitle}>
                    {g.label}
                  </Text>
                </View>

                <Pressable
                  style={styles.startBtn}
                  onPress={() =>
                    navigation.navigate("Plan")
                  }
                >
                  <Text style={styles.startBtnText}>
                    Open plan
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          <SquareAction
            color="#2563EB"
            icon={
              <Ionicons
                name="calendar"
                size={22}
                color="white"
              />
            }
            label="My Visits"
            onPress={() => navigation.navigate("Appointments")}
          />

          <SquareAction
            color="#10B981"
            icon={
              <Ionicons
                name="shield-checkmark"
                size={22}
                color="white"
              />
            }
            label="My Info"
            onPress={() => navigation.navigate("MyHealthInfo")}
          />

          <SquareAction
            color="#7C3AED"
            icon={
              <Ionicons
                name="document-text-outline"
                size={22}
                color="white"
              />
            }
            label="Summary"
            onPress={() => navigation.navigate("Summary")}
          />

          <SquareAction
            color="#0284C7"
            icon={
              <Ionicons
                name="play-circle"
                size={22}
                color="white"
              />
            }
            label="Learn"
            onPress={() => navigation.navigate("Learn")}
          />
        </View>

        {/* Shop / Rewards */}
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>
            Rewards
          </Text>
          <Text style={styles.shopSub}>
            You have {userPoints} points to use.
          </Text>
          <Pressable
            style={styles.shopBtn}
            onPress={() => setShowShop(true)}
          >
            <Text style={styles.shopBtnText}>
              Open Rewards
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Shop Modal */}
      <Modal
        visible={showShop}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛍️ Item Shop</Text>
              <Pressable onPress={() => setShowShop(false)}>
                <Ionicons name="close" size={28} color="#0F172A" />
              </Pressable>
            </View>

            <View style={styles.pointsDisplay}>
              <Text style={styles.pointsDisplayText}>
                Your Points: ⚡{userPoints}
              </Text>
            </View>

            <ScrollView style={styles.shopGrid}>
              {SHOP_ITEMS.map((item) => (
                <View key={item.id} style={styles.shopItem}>
                  <Image 
                    source={item.image} 
                    style={styles.shopItemImage}
                    resizeMode="contain"
                  />
                  <View style={styles.shopItemInfo}>
                    <Text style={styles.shopItemName}>{item.name}</Text>
                    <Text style={styles.shopItemCost}>⚡{item.cost} pts</Text>
                  </View>
                  <Pressable
                    style={[
                      styles.buyBtn,
                      ownedItems.includes(item.id) && styles.ownedBtn
                    ]}
                    onPress={() => handleBuyItem(item)}
                    disabled={ownedItems.includes(item.id)}
                  >
                    <Text style={styles.buyBtnText}>
                      {ownedItems.includes(item.id) ? 'Owned' : 'Buy'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Closet Modal */}
      <Modal
        visible={showCloset}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👕 Your Closet</Text>
              <Pressable onPress={() => setShowCloset(false)}>
                <Ionicons name="close" size={28} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView style={styles.shopGrid}>
              {ownedItems.length === 0 ? (
                <View style={styles.emptyCloset}>
                  <Text style={styles.emptyText}>
                    Your closet is empty! Buy items from the shop.
                  </Text>
                </View>
              ) : (
                ownedItems.map((itemId) => {
                  const item = SHOP_ITEMS.find(i => i.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <View key={item.id} style={styles.shopItem}>
                      <Image 
                        source={item.image} 
                        style={styles.shopItemImage}
                        resizeMode="contain"
                      />
                      <View style={styles.shopItemInfo}>
                        <Text style={styles.shopItemName}>{item.name}</Text>
                        {currentOutfit === item.id && (
                          <Text style={styles.equippedText}>✓ Equipped</Text>
                        )}
                      </View>
                      <Pressable
                        style={[
                          styles.buyBtn,
                          currentOutfit === item.id && styles.equippedBtn
                        ]}
                        onPress={() => handleWearItem(item.id)}
                        disabled={currentOutfit === item.id}
                      >
                        <Text style={styles.buyBtnText}>
                          {currentOutfit === item.id ? 'Wearing' : 'Wear'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chatbot Button */}
      <Pressable
        style={styles.chatbotButton}
        onPress={() => setChatVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="white" />
      </Pressable>

      {/* Chat Modal */}
      {chatVisible && (
        <View style={styles.chatModal}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat with Assistant 🤖</Text>
            <Pressable onPress={() => setChatVisible(false)}>
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          <ScrollView style={styles.chatMessages}>
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "bot" && { color: "#111827" },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              value={chatInput}
              onChangeText={setChatInput}
            />
            <Pressable style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Little row for appointment info
function Row({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.apptRow}>
      <Ionicons
        name={icon}
        size={18}
        color="#2563EB"
      />
      <Text style={styles.apptText}>{text}</Text>
    </View>
  );
}

// Square quick action button
function SquareAction({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.square, { backgroundColor: color }]}
    >
      <View style={{ alignItems: "center" }}>{icon}</View>
      <Text style={styles.squareLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#F6F8FB",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  avatarBubble: {
    backgroundColor: "#E0F2FE",
    borderRadius: 24,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  helloText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  subHelloText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  pointsPill: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: "center",
  },
  pointsNum: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
  },
  pointsPts: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 14,
    textAlign: "center",
  },

  assessmentBanner: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  bannerTitle: {
    fontWeight: "800",
    color: "#1E3A8A",
    fontSize: 16,
    marginBottom: 4,
  },
  bannerSub: {
    color: "#1E40AF",
    fontSize: 13,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
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
  ringText: {
    fontWeight: "700",
    color: "#2563EB",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563EB",
  },

  caterpillarContainer: {
    alignItems: "center",
    marginVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  caterpillarControls: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  controlBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  controlBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  caterpillarImage: {
    width: 150,
    height: 150,
  },
  removeOutfitBtn: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  removeOutfitText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 6,
  },
  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  apptText: {
    color: "#111827",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
  },

  itemsPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemsPillText: {
    color: "#065F46",
    fontWeight: "700",
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioEmpty: {
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
  chip: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  chipText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 12,
  },
  todoTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  startBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  square: {
    flexGrow: 1,
    flexBasis: "48%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  squareLabel: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },

  shopCard: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  shopTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 6,
  },
  shopSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginBottom: 12,
  },
  shopBtn: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  shopBtnText: {
    color: "#7C3AED",
    fontWeight: "800",
    fontSize: 15,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: "85%",
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  pointsDisplay: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  pointsDisplayText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D4ED8",
    textAlign: "center",
  },
  shopGrid: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shopItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  shopItemImage: {
    width: 60,
    height: 60,
  },
  shopItemInfo: {
    flex: 1,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  shopItemCost: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyBtnText: {
    color: "white",
    fontWeight: "700",
  },
  ownedBtn: {
    backgroundColor: "#10B981",
  },
  equippedBtn: {
    backgroundColor: "#7C3AED",
  },
  equippedText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 2,
  },
  emptyCloset: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },

  // Chatbot styles
  chatbotButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  chatModal: {
    position: "absolute",
    bottom: 100,
    right: 10,
    left: 10,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    maxHeight: "70%",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111827",
  },
  chatMessages: {
    maxHeight: 250,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "white",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 10,
  },
});