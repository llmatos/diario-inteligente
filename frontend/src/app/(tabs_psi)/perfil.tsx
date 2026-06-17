import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, TextInput, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import AcoesConta from '@/components/AcoesConta';

export default function AjustesPsicologo() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
  const BASE_URL = `http://${API_IP}:8000`;


  useFocusEffect(
    useCallback(() => {
      const carregarPerfil = async () => {
        try {
          const token = await SecureStore.getItemAsync('userToken');
          const response = await axios.get(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            setNome(response.data.nome || '');
            setEmail(response.data.email || '');
            setTelefone(response.data.telefone || '');
          }
        } catch (error) {
          console.error("Erro ao carregar dados do psicólogo", error);
        }
      };

      carregarPerfil();
    }, [])
  );


  const handleSalvarAlteracoes = async () => {
    if (!email) {
      Alert.alert("Erro", "O e-mail não pode ficar vazio.");
      return;
    }
    if (!nome) {
      Alert.alert("Erro", "O campo nome não pode ficar vazio.");
      return;
    }
    if (!telefone) {
      Alert.alert("Erro", "O campo telefone não pode ficar vazio.");
      return;
    }

    setLoadingPerfil(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.patch(
        `${BASE_URL}/users/me`,
        { nome, email, telefone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Alert.alert("Sucesso", "Informações atualizadas com sucesso!");
      }
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
    } finally {
      setLoadingPerfil(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja encerrar a sua sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userRole');
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert("Erro", "Não foi possível encerrar a sessão.");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Aviso Crítico",
      "Tem certeza que deseja apagar sua conta de profissional permanentemente? Esta ação removerá seus vínculos e não poderá ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('userToken');
              const response = await axios.delete(`${BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.status === 204 || response.status === 200) {
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userRole');
                router.replace('/(auth)/login');
              }
            } catch (error: any) {
              Alert.alert("Erro", "Falha ao remover a conta do profissional.");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Gerencie suas informações e preferências de acesso.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Meus Dados</Text>

        <Text style={styles.label}>NOME</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          keyboardType="default"
          autoCapitalize="none"
        />

        <Text style={styles.label}>E-MAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>TELEFONE</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.button, loadingPerfil && styles.buttonDisabled]}
          onPress={handleSalvarAlteracoes}
          disabled={loadingPerfil}
        >
          <Text style={styles.buttonText}>{loadingPerfil ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>
      </View>

      <AcoesConta
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
    paddingTop: 80,
    paddingHorizontal: 25
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 25
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E6151',
    marginBottom: 15,
    textTransform: 'uppercase'
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C8C8C',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F0F2F0',
    height: 55, borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#1A1A1A', marginBottom: 15
  },
  button: {
    backgroundColor: '#4E6151',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5
  },
  buttonDisabled: {
    backgroundColor: '#8C9A8E'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
});