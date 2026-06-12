import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface RemoverVinculoProps {
  vinculoId: string;
  nomePaciente: string;
  onSuccess: () => void;
  color?: string;
}

export default function RemoverVinculo({ vinculoId, nomePaciente, onSuccess, color = "#E74C3C" }: RemoverVinculoProps) {
  const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
  const BASE_URL = `http://${API_IP}:8000`;

  const handleRomper = () => {
    Alert.alert(
      "Encerrar Vínculo",
      `Tem certeza que deseja encerrar o vínculo com ${nomePaciente}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('userToken');
              await axios.delete(`${BASE_URL}/vinculos/${vinculoId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              onSuccess(); 
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover o vínculo.");
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleRomper} style={{ padding: 5 }}>
      <Ionicons name="trash-outline" size={20} color={color} />
    </TouchableOpacity>
  );
}