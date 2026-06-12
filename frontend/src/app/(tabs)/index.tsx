import RegistroCard from '@/components/RegistrosCard';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";

type Registro = {
    id: string;
    sentimento: string;
    resumo: string;
    data_criacao: string;
    relato: string;
}

export default function ListarRegistros() {
    const API_IP = '10.0.2.2';
    const BASE_URL = `http://${API_IP}:8000`;
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [carregando, setCarregando] = useState(false);

    const loadRegistros = async () => {
        let token = null;

        token = await SecureStore.getItemAsync('userToken');
        

        try {
            const response = await axios.get(`${BASE_URL}/registros/listar_registros`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const registrosRaw = response.data.registros;
            setRegistros(registrosRaw);
        } catch (error) {
            console.error("Erro ao carregar os registros: ", error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadRegistros();
        }, []),
    )

    const carregarNovosRegistros = async () => {
        try {
            setCarregando(true);
            await loadRegistros();
        } catch (error) {
            console.error(error);
        } finally {
            setCarregando(false);
        }
    }

    const handleDeletarDiario = (idDoRegistro: string) => {
        Alert.alert(
            "Apagar Registro",
            "Tem certeza que deseja descartar este registro? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            
                            const token = await SecureStore.getItemAsync('userToken');

                            const response = await axios.delete(`${BASE_URL}/registros/${idDoRegistro}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (response.status === 200) {
                                setRegistros(prevRegistros => prevRegistros.filter(reg => reg.id !== idDoRegistro));
                            }
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível apagar este registro.");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const handleCompartilharDiario = (idDoRegistro: string) => {
        Alert.alert(
            "Compartilhar Relato",
            "Tem certeza que deseja liberar este relato para a leitura do seu psicólogo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Compartilhar",
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('userToken');
                            const response = await axios.post(
                                `${BASE_URL}/vinculos/compartilhar/${idDoRegistro}`,
                                {}, 
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (response.status === 201) {
                                Alert.alert("Sucesso", "Relato compartilhado com segurança!");
                            }
                        } catch (error: any) {                
                            const msgErro = error.response?.data?.detail || "Erro ao compartilhar registro.";
                            Alert.alert("Atenção", msgErro);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={registros}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Seu Diário</Text>
                        <Text style={styles.headerSubtitle}>Reveja seus pensamentos e clareie a mente.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <RegistroCard
                        id={item.id} 
                        dataCriacao={item.data_criacao}
                        resumo={item.resumo}
                        sentimento={item.sentimento}
                        textoCompleto={item.relato}
                        onDelete={handleDeletarDiario}
                        onShare={handleCompartilharDiario} 
                    />
                )}
                refreshing={carregando}
                onRefresh={carregarNovosRegistros}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/criar-registro')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2EB',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 120,
    },
    header: {
        marginBottom: 30,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 32,
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: Platform.OS === 'ios' ? 110 : 90, // Fica flutuando acima da barra de navegação nova!
        backgroundColor: '#4E6151', 
        width: 60, 
        height: 60,
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    fabIcon: {
        color: '#FFFFFF', 
        fontSize: 32, 
        fontWeight: '700', 
        textAlign: 'center',
        marginTop: -3, 
    },
});