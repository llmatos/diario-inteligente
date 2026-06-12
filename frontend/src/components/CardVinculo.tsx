import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CardVinculo() {
  const [crp, setCrp] = useState('');
  const [loading, setLoading] = useState(false);

  const API_IP = '10.0.2.2';
  const BASE_URL = `http://${API_IP}:8000`;

  const handleConectarPsicologo = async () => {
    if (!crp.trim()) {
      Alert.alert("Aviso", "Por favor, digite o CRP do seu terapeuta.");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.post(
        `${BASE_URL}/vinculos/conectar`,
        { crp_psicologo: crp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        
        Alert.alert("Solicitação Enviada", "Aguarde o seu psicólogo aceitar o vínculo no sistema.");
        setCrp('');
      }
    } catch (error: any) {
      const mensagemErro = error.response?.data?.detail || "Não foi possível enviar a solicitação.";
      Alert.alert("Erro", typeof mensagemErro === 'string' ? mensagemErro : JSON.stringify(mensagemErro));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Meu Terapeuta</Text>
      <Text style={styles.description}>
        Envie uma solicitação para o seu psicólogo. Após ele aceitar, você poderá compartilhar registros de forma segura.
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>CRP DO PROFISSIONAL</Text>
        <TextInput 
          style={styles.input}
          value={crp}
          onChangeText={setCrp}
          placeholder="Ex: 00/00000"
          placeholderTextColor="#A0A0A0"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={[styles.buttonSave, loading && styles.buttonDisabled]} 
        onPress={handleConectarPsicologo} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Solicitar Vínculo'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4E6151',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F0F2F0',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#1A1A1A',
  },
  buttonSave: {
    backgroundColor: '#4E6151',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#8C9A8E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});