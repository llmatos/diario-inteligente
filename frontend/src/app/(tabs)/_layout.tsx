// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
    const activeColor = '#4E6151';
    const inactiveColor = '#9E9E9E';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#EEEEEE',
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: 25,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Diário',
                    tabBarLabel: 'DIÁRIO',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="format-list-bulleted" color={color} size={28} />
                    ),
                }}
            />
            <Tabs.Screen
                name="refletir"
                options={{
                    title: 'Refletir',
                    tabBarLabel: 'REFLETIR',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="meditation" color={color} size={28} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Ajustes',
                    tabBarLabel: 'AJUSTES',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog-outline" color={color} size={28} />
                    ),
                }}
            />
            <Tabs.Screen
                name="criar-registro"
                options={{
                    href: null, 
                }}
            />
        </Tabs>
    );
}