// frontend/App.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens from frontend/src/screens
import Home from "./src/screens/Home";
import Learn from "./src/screens/Learn";
import TopicDetails from "./src/screens/TopicDetails"; // <-- matches your file name
import Appointments from "./src/screens/Appointments";
import MyHealthInfo from "./src/screens/MyHealthInfo";
import Plan from "./src/screens/Plan";
import Summary from "./src/screens/Summary";
import Rewards from "./src/screens/Rewards";

// OPTIONAL screens (only include if you actually navigate to them)
import LogInScreen from "./src/screens/LogInScreen";
import CreateAccountScreen from "./src/screens/CreateAccountScreen";
import AuthLandingScreen from "./src/screens/AuthLandingScreen";
import AuthChoice from "./src/screens/AuthChoice";
import ModuleScreen from "./src/screens/ModuleScreen";
import FinalAssessment from "./src/screens/FinalAssessment";

export type RootStackParamList = {
  // core app
  Home: undefined;
  Learn: undefined;
  TopicDetails: { topic: string }; // Learn will send { topic: "insurance" } etc.
  Appointments: undefined;
  MyHealthInfo: undefined;
  Plan: undefined;
  Summary: undefined;
  Rewards: undefined;

  // optional / auth / extras
  LogInScreen: undefined;
  CreateAccountScreen: undefined;
  AuthLandingScreen: undefined;
  AuthChoice: undefined;
  ModuleScreen: { topic?: string } | undefined;
  FinalAssessment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* MAIN FLOW */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Learn" component={Learn} />
        <Stack.Screen name="TopicDetails" component={TopicDetails} />
        <Stack.Screen name="Appointments" component={Appointments} />
        <Stack.Screen name="MyHealthInfo" component={MyHealthInfo} />
        <Stack.Screen name="Plan" component={Plan} />
        <Stack.Screen name="Summary" component={Summary} />
        <Stack.Screen name="Rewards" component={Rewards} />

        {/* OPTIONAL / AUTH / OTHER */}
        <Stack.Screen name="LogInScreen" component={LogInScreen} />
        <Stack.Screen
          name="CreateAccountScreen"
          component={CreateAccountScreen}
        />
        <Stack.Screen
          name="AuthLandingScreen"
          component={AuthLandingScreen}
        />
        <Stack.Screen name="AuthChoice" component={AuthChoice} />
        <Stack.Screen name="ModuleScreen" component={ModuleScreen} />
        <Stack.Screen name="FinalAssessment" component={FinalAssessment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
