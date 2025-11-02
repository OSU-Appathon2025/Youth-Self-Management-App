// frontend/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// auth flow screens
import AuthChoice from "./src/screens/AuthChoice";
import LogInScreen from "./src/screens/LogInScreen";
import CreateAccountScreen from "./src/screens/CreateAccountScreen";

// main app screens
import Home from "./src/screens/Home";
import Assess from "./src/screens/Assess";
import Plan from "./src/screens/Plan";
import Appointments from "./src/screens/Appointments";
import MyHealthInfo from "./src/screens/MyHealthInfo";
import Summary from "./src/screens/Summary";
import Learn from "./src/screens/Learn";
import Rewards from "./src/screens/Rewards";
import Goals from "./src/screens/Goals";
import OnboardingQuiz from "./src/screens/OnboardingQuiz";
import FinalAssessment from "./src/screens/FinalAssessment";
import ModuleScreen from "./src/screens/Module"; // if you renamed this file to Module.tsx

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthChoice"
        screenOptions={{
          headerShown: false, // we are doing our own headers, like <BackHeader />
        }}
      >
        {/* onboarding / auth */}
        <Stack.Screen name="AuthChoice" component={AuthChoice} />
        <Stack.Screen name="LogIn" component={LogInScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />

        {/* main app core screens */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Assess" component={Assess} />
        <Stack.Screen name="Plan" component={Plan} />
        <Stack.Screen name="Appointments" component={Appointments} />
        <Stack.Screen name="MyHealthInfo" component={MyHealthInfo} />
        <Stack.Screen name="Summary" component={Summary} />
        <Stack.Screen name="Learn" component={Learn} />
        <Stack.Screen name="Rewards" component={Rewards} />
        <Stack.Screen name="Goals" component={Goals} />

        {/* learning / curriculum flow */}
        <Stack.Screen name="OnboardingQuiz" component={OnboardingQuiz} />
        <Stack.Screen name="FinalAssessment" component={FinalAssessment} />
        <Stack.Screen name="ModuleScreen" component={ModuleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
