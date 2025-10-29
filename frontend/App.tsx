import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Default / first screen */}
        <Stack.Screen name="Home" component={Home} />

        {/* Other pages */}
        <Stack.Screen name="Appointments" component={Appointments} />
        <Stack.Screen name="MyHealthInfo" component={MyHealthInfo} />
        <Stack.Screen name="Summary" component={Summary} />
        <Stack.Screen name="Learn" component={Learn} />
        <Stack.Screen name="Rewards" component={Rewards} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
