import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import EditProfileScreen from './src/screens/main/profile/EditProfileScreen';
import NotificationSettingsScreen from './src/screens/main/profile/NotificationSettingsScreen';
import TripDetailScreen from './src/screens/main/explore/TripDetailScreen';
import MyPlanDetailScreen from './src/screens/main/trip/MyPlanDetailScreen';
import CreateTripScreen from './src/screens/main/home/CreateTripScreen';
import { getAccessToken } from './src/utils/tokenStorage';
import { getPreference } from './src/common/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await getAccessToken();
    if (!token) {
      setInitialRoute('Login');
      return;
    }
    try {
      const pref = await getPreference();
      setInitialRoute(pref ? 'Main' : 'Onboarding');
    } catch (e) {
      setInitialRoute(e.message === 'SESSION_EXPIRED' ? 'Login' : 'Main');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="MyPlanDetail" component={MyPlanDetailScreen} />
        <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
