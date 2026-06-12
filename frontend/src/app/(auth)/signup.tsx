import SvgIcon from "@/components/LogoProject";
import axios from "axios";
import { Link, router } from 'expo-router';
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Signup() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState<'paciente' | 'psicologo'>('paciente');
    const [crp, setCrp] = useState('');

    const API_IP = '10.0.2.2';
    const BASE_URL = `http://${API_IP}:8000`;

    const handleSignup = async () => {

        if (!email || !senha || !nome || !cpf) {
            Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        if (tipoUsuario === 'psicologo' && !crp) {
            Alert.alert("Erro", "O preenchimento do CRP é obrigatório para psicólogos.");
            return;
        }

        const userData: any = {
            "email": email,
            "password": senha,
            "nome": nome,
            "cpf": cpf,
            "telefone": telefone,
            "is_active": true,
            "is_superuser": false,
            "is_verified": false
        };

        if (tipoUsuario === 'psicologo') {
            userData.crp = crp;
        }

        const endpoint = tipoUsuario === 'psicologo' ? '/auth/register/psicologo' : '/auth/register/paciente';

        try {
            const response = await axios.post(`${BASE_URL}${endpoint}`, userData);

            if (response.status === 201) {
                Alert.alert("Cadastro Realizado", "Novo usuário cadastrado com sucesso!");
                router.replace('/(auth)/login');
            }
        } catch (error: any) {
            if (error.response) {
                const mensagemErro = error.response.data.detail || "Erro ao realizar cadastro.";
                Alert.alert("Erro no servidor", typeof mensagemErro === 'string' ? mensagemErro : JSON.stringify(mensagemErro));
            } else if (error.request) {
                Alert.alert("Erro de Rede", "Servidor não alcançado.");
            } else {
                console.error("Erro desconhecido: ", error.message);
            }
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    <View style={styles.logoContainer}><SvgIcon /></View>
                    <View>
                        <Text style={styles.title}>Clareza</Text>
                        <Text style={styles.subtitle}>Sua caminhada em busca de clareza começa aqui. Um lugar calmo para as suas ideias, sempre protegido e só seu.</Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.roleSelectorContainer}>
                        <TouchableOpacity 
                            style={[styles.roleButton, tipoUsuario === 'paciente' && styles.roleButtonActive]}
                            onPress={() => setTipoUsuario('paciente')}
                        >
                            <Text style={[styles.roleText, tipoUsuario === 'paciente' && styles.roleTextActive]}>Paciente</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.roleButton, tipoUsuario === 'psicologo' && styles.roleButtonActive]}
                            onPress={() => setTipoUsuario('psicologo')}
                        >
                            <Text style={[styles.roleText, tipoUsuario === 'psicologo' && styles.roleTextActive]}>Psicólogo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>NOME</Text>
                        <TextInput style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Como devemos chamar você?"
                            placeholderTextColor="#A0A0A0" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL</Text>
                        <TextInput style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#A0A0A0" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CPF</Text>
                        <TextInput
                            style={styles.input}
                            value={cpf}
                            onChangeText={setCpf}
                            placeholder="000.000.000-00"
                            keyboardType="numeric"
                            placeholderTextColor="#A0A0A0" />
                    </View>

                    {tipoUsuario === 'psicologo' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CRP</Text>
                            <TextInput
                                style={styles.input}
                                value={crp}
                                onChangeText={setCrp}
                                placeholder="Seu registro profissional"
                                placeholderTextColor="#A0A0A0" />
                        </View>
                    )}

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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>SENHA</Text>
                        <TextInput
                            style={styles.input}
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Crie uma senha segura"
                            secureTextEntry
                            placeholderTextColor="#A0A0A0"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CONFIRME A SENHA</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            placeholder="Repita sua senha"
                            secureTextEntry
                            placeholderTextColor="#A0A0A0"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Já possui uma conta?{' '}
                        <Link href={'/(auth)/login'} style={styles.footerLink}>
                            Entrar
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
        paddingHorizontal: 25,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    roleSelectorContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F0',
        borderRadius: 15,
        marginBottom: 25,
        padding: 4,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    roleButtonActive: {
        backgroundColor: '#4E6151',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A0A0A0',
    },
    roleTextActive: {
        color: '#FFFFFF',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4E6151',
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
    button: {
        backgroundColor: '#4E6151',
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    footerLink: {
        color: '#4E6151',
        fontWeight: '700',
        textDecorationLine: 'underline',
    }
});