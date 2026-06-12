import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState, useCallback } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import CardVinculo from '@/components/CardVinculo';
import AcoesConta from '@/components/AcoesConta';
import RemoverVinculo from '@/components/RemoverVinculo';

export default function Perfil() {
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loadingPerfil, setLoadingPerfil] = useState(false);
    const [vinculoAtivo, setVinculoAtivo] = useState<any>(null);

    const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
    const BASE_URL = `http://${API_IP}:8000`;

    const buscarVinculoAtivo = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${BASE_URL}/vinculos/meu-vinculo`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.vinculo_id) {
                setVinculoAtivo(response.data);
            } else {
                setVinculoAtivo(null);
            }
        } catch (error) {
            setVinculoAtivo(null);
        }
    };

    useFocusEffect(
        useCallback(() => {
            buscarVinculoAtivo();
            const carregarPerfil = async () => {
                try {
                    const token = await SecureStore.getItemAsync('userToken');
                    const response = await axios.get(`${BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data) {
                        setNome(response.data.nome || '');
                        setTelefone(response.data.telefone || '');
                    }
                } catch (error) {
                    console.error("Erro ao carregar dados do paciente", error);
                }
            };

            carregarPerfil();
        }, [])
    );

    const handleUpdateProfile = async () => {
        if (!nome) {
            Alert.alert("Erro", "O campo Nome não pode ficar vazio.");
            return;
        }
        setLoadingPerfil(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.patch(
                `${BASE_URL}/users/me`,
                { nome, telefone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
            }
        } catch (error: any) {
            Alert.alert("Erro", "Não foi possível atualizar o perfil.");
        } finally {
            setLoadingPerfil(false);
        }
    };

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            router.replace('/(auth)/login');
        } catch (error) {
            Alert.alert("Erro", "Não foi possível encerrar a sessão no momento.");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Aviso Crítico",
            "Tem certeza que deseja apagar sua conta permanentemente? Esta ação não pode ser desfeita.",
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
                                router.replace('/(auth)/login');
                            }
                        } catch (error: any) {
                            Alert.alert("Erro", "Falha ao remover a conta.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Ajustes</Text>


            {vinculoAtivo ? (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Meu Terapeuta</Text>
                    <View style={styles.vinculoAtivoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.description}>Psic. {vinculoAtivo.psicologo_nome}</Text>
                            <Text style={styles.crpText}>CRP {vinculoAtivo.psicologo_crp}</Text>
                        </View>

                        <RemoverVinculo
                            vinculoId={vinculoAtivo.vinculo_id}
                            nomePaciente={`Dr(a). ${vinculoAtivo.psicologo_nome}`}
                            onSuccess={() => {
                                setVinculoAtivo(null);
                                Alert.alert("Vínculo Removido", "O acesso aos seus diários foi revogado.");
                            }}
                        />
                    </View>
                </View>
            ) : (
                <CardVinculo />
            )}


            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>NOME</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Atualize seu nome completo"
                        placeholderTextColor="#A0A0A0"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>TELEFONE</Text>
                    <TextInput
                        style={styles.input}
                        value={telefone}
                        onChangeText={setTelefone}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        placeholderTextColor="#A0A0A0"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.buttonSave, loadingPerfil && styles.buttonDisabled]}
                    onPress={handleUpdateProfile}
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
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 80,
        paddingBottom: 120,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4E6151',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    vinculoAtivoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    description: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
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
    crpText: {
        fontSize: 13,
        color: '#8C8C8C',
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
    },
});