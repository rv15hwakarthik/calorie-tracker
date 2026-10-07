import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const TAB_ACTIVE = '#1B5E20';
const TAB_INACTIVE = '#B8B8B8';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E8E8',
        },
        headerStyle: {
          backgroundColor: '#FAFAFA',
        },
        headerTintColor: '#1B5E20',
        headerTitleStyle: {
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-targets"
        options={{
          href: null,
          title: 'Edit targets',
        }}
      />
    </Tabs>
  );
}
