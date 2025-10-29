import React from "react";
import { View, Text, Pressable } from "react-native";

export default function Home({ navigation }: any) {
  const Btn = ({ label, to }: { label: string; to: string }) => (
    <Pressable
      onPress={() => navigation.navigate(to)}
      style={{
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginVertical: 6,
      }}
    >
      <Text style={{ color: "white", fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 12 }}>
        Home is rendering ✅
      </Text>
      <Btn label="Go to Appointments" to="Appointments" />
      <Btn label="Go to My Health Info" to="MyHealthInfo" />
      <Btn label="Go to Summary" to="Summary" />
      <Btn label="Go to Learn" to="Learn" />
      <Btn label="Go to Rewards" to="Rewards" />
    </View>
  );
}
