import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PsicologoLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#4E6151',
      tabBarInactiveTintColor: '#A0A0A0',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        elevation: 10,
        height: 60,
        paddingBottom: 10,
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="[id]" 
        options={{ href: null }} 
      />
    </Tabs>
  );
}