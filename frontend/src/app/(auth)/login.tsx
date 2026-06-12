import axios from 'axios';
import { useRouter, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from "react-native";
import SvgIcon from "@/components/LogoProject";


interface CustomJwtPayload {
  sub: string;
  tipo_usuario: string;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);

  const API_IP = '10.0.2.2';
  const BASE_URL = `http://${API_IP}:8000`;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      
      const response = await axios.post(`${BASE_URL}/auth/jwt/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.access_token) {
        const tokenString = response.data.access_token;
        await SecureStore.setItemAsync('userToken', tokenString);
    
        const meResponse = await axios.get(`${BASE_URL}/vinculos/me`, {
          headers: { Authorization: `Bearer ${tokenString}` }
        });

        const role = meResponse.data.tipo_usuario;
        await SecureStore.setItemAsync('userRole', role);

        if (role === 'psicologo') {
          router.replace('/(tabs_psi)');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert("Erro", "Email ou senha incorretos!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

       
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <SvgIcon />
          </View>
          <Text style={styles.title}>Clareza</Text>
          <Text style={styles.subtitle}>Retorne ao seu espaço seguro para reflexão e calma.</Text>
        </View>

        
        <View style={styles.card}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>FORGOT PASSWORD?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Novo no Clareza?{' '}
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Criar uma Conta</Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5', 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    paddingHorizontal: 25,
    paddingVertical: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', 
    marginBottom: 8,
    marginTop: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E6151',
    letterSpacing: 1,
    marginTop: 5,
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 10,
    color: '#A0A0A0',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F0F2F0',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#4E6151',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#8C9A8E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E6151',
  }
});