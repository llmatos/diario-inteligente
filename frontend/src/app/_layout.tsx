import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Este aplicativo está disponível apenas em versão mobile.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9F5', 
  },
  text: {
    fontSize: 18,
    color: '#1A1A1A', 
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', 
    textAlign: 'center',
    paddingHorizontal: 30, 
  }
});