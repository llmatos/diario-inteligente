import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
const BASE_URL = `http://${API_IP}:8000`;

type ModalTrocarSenhaProps = {
    visivel: boolean;
    onClose: () => void;
};

export default function ModalTrocarSenha({ visivel, onClose }: ModalTrocarSenhaProps) {
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTrocarSenha = async () => {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert("Atenção", "A nova senha e a confirmação não batem.");
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.patch(
                `${BASE_URL}/auth/trocar-senha`,
                { senha_atual: senhaAtual, nova_senha: novaSenha },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                Alert.alert("Sucesso", "Sua senha foi alterada.");
                setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
                onClose();
            }
        } catch (error: any) {
            const msgErro = error.response?.data?.detail || "Não foi possível alterar a senha.";
            Alert.alert("Erro", msgErro);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visivel} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Alterar Senha</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>SENHA ATUAL</Text>
                    <TextInput style={styles.input} secureTextEntry value={senhaAtual} onChangeText={setSenhaAtual} />

                    <Text style={styles.label}>NOVA SENHA</Text>
                    <TextInput style={styles.input} secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />

                    <Text style={styles.label}>CONFIRMAR NOVA SENHA</Text>
                    <TextInput style={styles.input} secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

                    <TouchableOpacity style={styles.button} onPress={handleTrocarSenha} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Nova Senha</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 },
    modalCard: { 
        backgroundColor: '#FFF', 
        width: '100%', 
        borderRadius: 20, 
        padding: 25, ...Platform.select({ 
            ios: { 
            shadowColor: '#000', 
            shadowOffset: { 
                width: 0, 
                height: 4 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 10 }, 
                android: { 
                    elevation: 5 } }) },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 },
    title: { 
        fontSize: 20, 
        fontWeight: '700', 
        color: '#1A1A1A' },
    label: { 
        fontSize: 11, 
        fontWeight: '700', 
        color: '#4E6151', 
        marginBottom: 5, 
        letterSpacing: 1 },
    input: { 
        backgroundColor: '#F0F2F0', 
        borderRadius: 10, 
        height: 50, 
        paddingHorizontal: 15, 
        marginBottom: 15, 
        fontSize: 15 },
    button: { 
        backgroundColor: '#4E6151', 
        borderRadius: 30, 
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10 },
    buttonText: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: '600' }
});