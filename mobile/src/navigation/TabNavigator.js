import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/home/HomeScreen';
import MyPlansScreen from '../screens/main/trip/MyPlansScreen';
import ExploreScreen from '../screens/main/explore/ExploreScreen';
import ProfileScreen from '../screens/main/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            MyPlans: focused ? 'map' : 'map-outline',
            Explore: focused ? 'compass' : 'compass-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="MyPlans" component={MyPlansScreen} options={{ tabBarLabel: '내 계획' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: '탐색' }} />
      <Tab.Screen
        name="Profile"
        options={{ tabBarLabel: '프로필' }}
      >
        {(props) => <ProfileScreen {...props} navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
