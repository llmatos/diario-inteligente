import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RemoverVinculo from '@/components/RemoverVinculo';

const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
const BASE_URL = `http://${API_IP}:8000`;

type Paciente = {
  vinculo_id: string;
  paciente_id: string;
  paciente_nome: string;
};

export default function HomePsicologo() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async (isActive: boolean) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const [resAtivos, resPendentes] = await Promise.all([
        axios.get(`${BASE_URL}/vinculos/ativos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/vinculos/pendentes`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (isActive) {
        if (resAtivos.data && Array.isArray(resAtivos.data.pacientes)) {
          setPacientes(resAtivos.data.pacientes);
        }
        if (resPendentes.data && Array.isArray(resPendentes.data.pendentes)) {
          setSolicitacoes(resPendentes.data.pendentes);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do psicólogo:", error);
    } finally {
      if (isActive) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      carregarDados(isActive);
      return () => { isActive = false; };
    }, [])
  );

  const handleAceitarSolicitacao = async (vinculoId: string) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.patch(`${BASE_URL}/vinculos/${vinculoId}/aceitar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarDados(true);
    } catch (error) {
      console.error("Erro ao aceitar vínculo:", error);
    }
  };

  const handleRecusarSolicitacao = async (vinculoId: string) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${BASE_URL}/vinculos/${vinculoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarDados(true);
    } catch (error) {
      console.error("Erro ao recusar vínculo:", error);
    }
  };

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(tabs_psi)/${item.paciente_id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconWrapper}>
          <Ionicons name="person" size={24} color="#4E6151" />
        </View>
        <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
      </View>
      <RemoverVinculo 
        vinculoId={item.vinculo_id} 
        nomePaciente={item.paciente_nome} 
        onSuccess={() => carregarDados(true)} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color="#4E6151" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.vinculo_id}
        renderItem={renderPaciente}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Meus Pacientes</Text>
            <Text style={styles.subtitle}>Selecione um paciente para visualizar os diários compartilhados.</Text>

            {solicitacoes.length > 0 && (
              <View style={styles.sectionPendentes}>
                <Text style={styles.sectionTitle}>Solicitações de Vínculo ({solicitacoes.length})</Text>
                {solicitacoes.map((sol) => (
                  <View key={sol.vinculo_id} style={styles.solicitacaoCard}>
                    <Text style={styles.solicitacaoNome}>{sol.paciente_nome}</Text>
                    <View style={styles.solicitacaoBotoes}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.acceptButton]} 
                        onPress={() => handleAceitarSolicitacao(sol.vinculo_id)}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]} 
                        onPress={() => handleRecusarSolicitacao(sol.vinculo_id)}
                      >
                        <Ionicons name="close" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitleAtivos}>Pacientes Ativos</Text>
            {pacientes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#C4C4C4" />
                <Text style={styles.emptyText}>Você ainda não possui pacientes vinculados.</Text>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5', paddingTop: 80, paddingHorizontal: 25 },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '600', color: '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 25 },
  listContent: { paddingBottom: 120 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { backgroundColor: '#F0F2F0', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  pacienteNome: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: '#8C8C8C', marginTop: 15, textAlign: 'center' },
  sectionPendentes: { backgroundColor: '#E5E5DE', borderRadius: 20, padding: 15, marginBottom: 25 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#4E6151', marginBottom: 10, textTransform: 'uppercase' },
  sectionTitleAtivos: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 15, textTransform: 'uppercase' },
  solicitacaoCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  solicitacaoNome: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  solicitacaoBotoes: { flexDirection: 'row' },
  actionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  acceptButton: { backgroundColor: '#4E6151' },
  rejectButton: { backgroundColor: '#E74C3C' },
});