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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  getCurrentUser,
  UserProfile,
} from "../storage/userStore";

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
  butterfly: require('../../assets/butterfly.png'),
};

// Sparkling butterfly (for special transformation)
const BUTTERFLY_SPARKLE = require('../../assets/sparkle.png');

const BUTTERFLY_THRESHOLD = 500; // Points needed to transform

export default function Home({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [animFrame, setAnimFrame] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showCloset, setShowCloset] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isButterfly, setIsButterfly] = useState(false);
  const [showButterflyModal, setShowButterflyModal] = useState(false);

  // Caterpillar animation frames
  const caterpillarFrames = [
    require('../../assets/cater1.png'),
    require('../../assets/cater2.png'),
    require('../../assets/cater3.png'),
  ];

  // Get dressed caterpillar or regular
  const getCurrentCaterpillar = () => {
    if (isButterfly) {
      return BUTTERFLY_SPARKLE;
    }
    if (currentOutfit && DRESSED_CATERPILLARS[currentOutfit as keyof typeof DRESSED_CATERPILLARS]) {
      return DRESSED_CATERPILLARS[currentOutfit as keyof typeof DRESSED_CATERPILLARS];
    }
    return caterpillarFrames[animFrame];
  };

  // Animation effect - cycles through caterpillar frames (only when no outfit)
  useEffect(() => {
    if (currentOutfit || isButterfly) return; // Don't animate when wearing outfit or butterfly
    
    const interval = setInterval(() => {
      setAnimFrame((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, [currentOutfit, isButterfly]);

  // helper: load user from storage
  async function load() {
    const u = await getCurrentUser();
    setUser(u);
    if (u) {
      // Load saved points or set initial test value
      const savedPoints = await AsyncStorage.getItem('userPoints');
      const currentPoints = savedPoints !== null ? parseInt(savedPoints) : 800;
      setUserPoints(currentPoints);
      
      // Save initial points if none exist
      if (savedPoints === null) {
        await AsyncStorage.setItem('userPoints', '800');
      }
      
      // Load owned items
      const savedItems = await AsyncStorage.getItem('ownedItems');
      if (savedItems) {
        setOwnedItems(JSON.parse(savedItems));
      }
      
      // Load current outfit
      const savedOutfit = await AsyncStorage.getItem('currentOutfit');
      if (savedOutfit) {
        setCurrentOutfit(savedOutfit);
      }
      
      // Load butterfly state
      const savedButterfly = await AsyncStorage.getItem('isButterfly');
      if (savedButterfly === 'true') {
        setIsButterfly(true);
      }
      
      // Check if butterfly transformation should trigger
      if (currentPoints >= BUTTERFLY_THRESHOLD && savedButterfly !== 'true') {
        setShowButterflyModal(true);
      }
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
    if (isButterfly) {
      alert("You can't remove your butterfly transformation!");
      return;
    }
    setCurrentOutfit(null);
    await AsyncStorage.removeItem('currentOutfit');
    alert("Outfit removed!");
  };

  const handleButterflyTransformation = async () => {
    setIsButterfly(true);
    setCurrentOutfit(null);
    await AsyncStorage.setItem('isButterfly', 'true');
    await AsyncStorage.removeItem('currentOutfit');
    setShowButterflyModal(false);
    alert("🦋 You've transformed into a beautiful butterfly! 🦋");
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
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarText}>
                {user.name?.[0]?.toUpperCase() || "Y"}
              </Text>
            </View>
            <View>
              <Text style={styles.hello}>
                Hey {user.name?.split(" ")[0] || "there"} 👋
              </Text>
              <Text style={styles.subtitle}>
                You're doing great
              </Text>
            </View>
          </View>

          <View style={styles.pointsPill}>
            <Text>⚡</Text>
            <Text style={styles.pointsText}>{userPoints}</Text>
            <Text style={styles.pointsSub}>pts</Text>
          </View>
        </View>

        {/* Show progress to butterfly if not yet transformed */}
        {!isButterfly && userPoints < BUTTERFLY_THRESHOLD && (
          <View style={styles.butterflyProgressCard}>
            <Text style={styles.butterflyProgressTitle}>
              🦋 Transform into a Butterfly!
            </Text>
            <Text style={styles.butterflyProgressText}>
              {userPoints} / {BUTTERFLY_THRESHOLD} points
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min((userPoints / BUTTERFLY_THRESHOLD) * 100, 100)}%`, backgroundColor: '#8B5CF6' },
                ]}
              />
            </View>
            <Text style={styles.butterflyProgressSubtext}>
              {BUTTERFLY_THRESHOLD - userPoints} points to go!
            </Text>
          </View>
        )}

        {/* If they didn't pass onboarding/assessment yet, put a banner */}
        {needsAssessment ? (
          <Pressable
            style={styles.assessmentBanner}
            onPress={() => navigation.navigate("Assess")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                Start your self-check
              </Text>
              <Text style={styles.bannerSub}>
                Take a quick quiz so we know what to help you learn.
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
                  Keep up the momentum!
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
            {!isButterfly && (
              <>
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
              </>
            )}
            {isButterfly && (
              <Text style={styles.butterflyLabel}>🦋 You're a Butterfly! 🦋</Text>
            )}
          </View>
          
          <Image 
            source={getCurrentCaterpillar()} 
            style={styles.caterpillarImage}
            resizeMode="contain"
          />
          
          {currentOutfit && !isButterfly && (
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
          <Text style={styles.cardSubtitle}>
            Next Appointment
          </Text>

          <Row icon="calendar-outline" text="Tuesday, Oct 29" />
          <Row icon="time-outline" text="3:00 PM" />
          <Row icon="person-outline" text="Dr. Nguyen" />

          <Text style={[styles.muted, { marginTop: 6 }]}>
            Check-up
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={() => navigation.navigate("Appointments")}
          >
            <Text style={styles.primaryBtnText}>
              Start Prep  →
            </Text>
          </Pressable>
        </View>

        {/* To-Do / Goals */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>
            Your Goals
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
              You've finished everything in your plan 🎉
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
                        Goal
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
                    Work on it
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

            <ScrollView 
              style={styles.shopScrollView}
              contentContainerStyle={styles.shopScrollContent}
              showsVerticalScrollIndicator={true}
            >
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

            <ScrollView 
              style={styles.shopScrollView}
              contentContainerStyle={styles.shopScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Show butterfly transformation option if eligible and not transformed yet */}
              {userPoints >= BUTTERFLY_THRESHOLD && !isButterfly && (
                <View style={styles.butterflyTransformOption}>
                  <Image 
                    source={BUTTERFLY_SPARKLE} 
                    style={styles.shopItemImage}
                    resizeMode="contain"
                  />
                  <View style={styles.shopItemInfo}>
                    <Text style={styles.shopItemName}>🦋 Butterfly Transformation</Text>
                    <Text style={styles.butterflyReadyText}>You're ready to transform!</Text>
                  </View>
                  <Pressable
                    style={styles.transformClosetBtn}
                    onPress={() => {
                      setShowCloset(false);
                      setShowButterflyModal(true);
                    }}
                  >
                    <Text style={styles.buyBtnText}>Transform</Text>
                  </Pressable>
                </View>
              )}

              {ownedItems.length === 0 && userPoints < BUTTERFLY_THRESHOLD ? (
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

      {/* Butterfly Transformation Modal */}
      <Modal
        visible={showButterflyModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.butterflyModalOverlay}>
          <View style={styles.butterflyModalContent}>
            <Text style={styles.butterflyModalTitle}>
              🎉 Congratulations! 🎉
            </Text>
            <Text style={styles.butterflyModalText}>
              You've earned {BUTTERFLY_THRESHOLD} points! 
              You're ready to transform into a beautiful butterfly!
            </Text>
            <Image 
              source={BUTTERFLY_SPARKLE} 
              style={styles.butterflyPreview}
              resizeMode="contain"
            />
            <Pressable
              style={styles.transformBtn}
              onPress={handleButterflyTransformation}
            >
              <Text style={styles.transformBtnText}>
                Transform Now! 🦋
              </Text>
            </Pressable>
            <Pressable
              style={styles.laterBtn}
              onPress={() => setShowButterflyModal(false)}
            >
              <Text style={styles.laterBtnText}>Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  hello: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 70,
  },
  pointsText: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
  },
  pointsSub: {
    color: "#64748B",
    marginLeft: 1,
    fontSize: 11,
  },

  butterflyProgressCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#C084FC",
  },
  butterflyProgressTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6B21A8",
    marginBottom: 8,
    textAlign: "center",
  },
  butterflyProgressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7C3AED",
    textAlign: "center",
    marginBottom: 8,
  },
  butterflyProgressSubtext: {
    fontSize: 14,
    color: "#9333EA",
    textAlign: "center",
    marginTop: 8,
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
  squareLabel: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
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
    padding: 20,
    height: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  },
  pointsDisplayText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D4ED8",
    textAlign: "center",
  },
  shopScrollView: {
    flex: 1,
  },
  shopScrollContent: {
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
  butterflyTransformOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "#C084FC",
  },
  butterflyReadyText: {
    color: "#7C3AED",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  transformClosetBtn: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  // Butterfly transformation modal
  butterflyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  butterflyModalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  butterflyModalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  butterflyModalText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  butterflyPreview: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  transformBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    marginBottom: 12,
  },
  transformBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
    textAlign: "center",
  },
  laterBtn: {
    paddingVertical: 10,
  },
  laterBtnText: {
    color: "#64748B",
    fontWeight: "600",
  },
  butterflyLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#8B5CF6",
    textAlign: "center",
  },
});