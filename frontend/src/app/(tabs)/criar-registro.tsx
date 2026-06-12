import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function criarRegistro() {
    const router = useRouter();
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).toUpperCase();

    const [registro, setRegistro] = useState("");
    const [loading, setLoading] = useState(false);


    const API_IP = '10.0.2.2';
    const BASE_URL = `http://${API_IP}:8000`;


    const handleRegistro = async () => {
        if (!registro.trim()) {
            alert("Escreva algo antes de tentar salvar");
            Alert.alert("Aviso", "Escreva algo antes de tentar salvar");
            return;
        }

        setLoading(true);


        let token = null;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('userToken');
        } else {
            token = await SecureStore.getItemAsync('userToken');
        }

        const formData = new FormData();
        formData.append('conteudo', registro);
        console.log("Enviado conteúdo", registro);


        try {
            const response = await axios.post(`${BASE_URL}/registros/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });

            if (response.status === 201) {
                Alert.alert("Sucesso", "Novo registro salvo");
                setRegistro("");
                router.back();
            }

        } catch (error: any) {

            if (error.response) {

                console.error("Erro do Servidor:", error.response.data);
                Alert.alert("Erro no Servidor", JSON.stringify(error.response.data));
            } else if (error.request) {

                console.error("Erro de Rede: O servidor não foi alcançado.");
                Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor. Verifique o IP.");
            } else {
                console.error("Erro desconhecido:", error.message);
            }
        } finally {
            setLoading(false);
        }




    }




    return (

        <SafeAreaView style={styles.safeArea}>


            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="arrow-back" size={28} color="#4E6151" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Clareza</Text>

                <TouchableOpacity
                    style={[styles.saveButtonTop, loading && styles.saveButtonDisabled]}
                    onPress={handleRegistro}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonTextTop}>Salvar</Text>
                    )}
                </TouchableOpacity>
            </View>


            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#A0A0A0" />
                    <Text style={styles.dateText}>{currentDate}</Text>
                </View>



                <TextInput
                    style={styles.input}
                    placeholder="Comece a escrever aqui. Este é o seu espaço seguro..."
                    placeholderTextColor="#D1D1CB"
                    value={registro}
                    onChangeText={setRegistro}
                    multiline={true}
                    textAlignVertical="top"
                    autoFocus={true}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9F5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9F5',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    headerTitle: {
        fontSize: 18,
        color: '#4E6151',
        fontWeight: '500',
    },
    saveButtonTop: {
        backgroundColor: '#4E6151',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    saveButtonDisabled: {
        backgroundColor: '#8C9A8E',
    },
    saveButtonTextTop: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },

    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 40,
        flexGrow: 1,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dateText: {
        fontSize: 10,
        color: '#A0A0A0',
        marginLeft: 8,
        letterSpacing: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        lineHeight: 28,
        minHeight: 300,
    },
});