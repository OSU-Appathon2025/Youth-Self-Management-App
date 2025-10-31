// frontend/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Assess from "./src/screens/Assess";
import FinalAssessment from "./src/screens/FinalAssessment";

import Home from "./src/screens/Home";
import Appointments from "./src/screens/Appointments";
import MyHealthInfo from "./src/screens/MyHealthInfo";
import Summary from "./src/screens/Summary";
import Learn from "./src/screens/Learn";
import Rewards from "./src/screens/Rewards";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // default header style for most screens
        screenOptions={{
          headerShown: true,
          headerTitleStyle: {
            fontWeight: "700",
            color: "#0F172A",
          },
          headerStyle: {
            backgroundColor: "#F6F8FB",
          },
          headerShadowVisible: false, // remove bottom line / make it clean
          // headerBackTitleVisible: false, // ❌ remove this for native stack
        }}
      >
        {/* Onboarding / first quiz screen.
           We hide header here so it looks like a welcome flow */}
        <Stack.Screen
          name="Assess"
          component={Assess}
          options={{
            headerShown: false,
          }}
        />

        {/* Final check / exit quiz */}
        <Stack.Screen
          name="FinalAssessment"
          component={FinalAssessment}
          options={{
            title: "Final Check",
          }}
        />

        {/* Main app screens */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "Home",
            headerShown: false, // Home is like the hub, usually no back arrow
          }}
        />
        <Stack.Screen
          name="Appointments"
          component={Appointments}
          options={{
            title: "Appointments",
          }}
        />
        <Stack.Screen
          name="MyHealthInfo"
          component={MyHealthInfo}
          options={{
            title: "My Info",
          }}
        />
        <Stack.Screen
          name="Summary"
          component={Summary}
          options={{
            title: "My Summary",
          }}
        />
        <Stack.Screen
          name="Learn"
          component={Learn}
          options={{
            title: "Learn",
          }}
        />
        <Stack.Screen
          name="Rewards"
          component={Rewards}
          options={{
            title: "Rewards",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
