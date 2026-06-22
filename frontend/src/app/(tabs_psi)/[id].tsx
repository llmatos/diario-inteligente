import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GraficoBarras from '@/components/GraficoBarras';
import GraficoPizza from '@/components/GraficoPizza';
import RemoverVinculo from '@/components/RemoverVinculo';
import SeletorFiltro from '@/components/SeletorFiltro';

const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
const BASE_URL = `http://${API_IP}:8000`;

const coresEmocoes: Record<string, string> = {
    Alegria: '#F4D03F', Tristeza: '#5DADE2', Raiva: '#E74C3C', Medo: '#1E8449',
    Confianca: '#82E0AA', Aversao: '#AF7AC5', Surpresa: '#48C9B0', Antecipacao: '#F5B041',
};

type DadoEmocao = { sentimento: string; porcentagem: number; };

export default function ProntuarioPaciente() {
    const { id, vinculo_id } = useLocalSearchParams(); 
    const router = useRouter();

    const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'pizza'>('pizza');
    const [filtroTempo, setFiltroTempo] = useState<'semana' | 'mes' | 'ano'>('semana');

    const [loading, setLoading] = useState(true);
    

    const [panoramaOriginal, setPanoramaOriginal] = useState<any[]>([]); 
    const [compartilhadosOriginais, setCompartilhadosOriginais] = useState<any[]>([]); 

   
    const [relatosDadosGrafico, setRelatosDadosGrafico] = useState<DadoEmocao[]>([]); 


    const processarEstatisticas = (panorama: any[], compartilhados: any[], filtro: 'semana' | 'mes' | 'ano') => {
        const agora = new Date();
        
        const panoramaFiltrado = panorama.filter(reg => {
            const dataReg = new Date(reg.data_criacao);
            const diasDiff = (agora.getTime() - dataReg.getTime()) / (1000 * 3600 * 24);
            if (filtro === 'semana') return diasDiff <= 7;
            if (filtro === 'mes') return diasDiff <= 30;
            return diasDiff <= 365; 
        });

        
        if (panoramaFiltrado.length > 0) {
            const contagem: Record<string, number> = {};
            panoramaFiltrado.forEach((reg: any) => {
                const sent = reg.sentimento || 'Outros';
                contagem[sent] = (contagem[sent] || 0) + 1;
            });

            const formatados = Object.keys(contagem).map(key => ({
                sentimento: key,
                porcentagem: Math.round((contagem[key] / panoramaFiltrado.length) * 100)
            })).sort((a, b) => b.porcentagem - a.porcentagem);

            setRelatosDadosGrafico(formatados); 
        } else {
            setRelatosDadosGrafico([]);
        }
    };

    React.useEffect(() => {
        processarEstatisticas(panoramaOriginal, compartilhadosOriginais, filtroTempo);
    }, [filtroTempo, panoramaOriginal, compartilhadosOriginais]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchProntuario = async () => {
                setLoading(true);
                try {
                    const token = await SecureStore.getItemAsync('userToken');
                    
                    
                    const [resCompartilhados, resPanorama] = await Promise.all([
                        axios.get(`${BASE_URL}/registros/compartilhados/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${BASE_URL}/registros/panorama_paciente/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                    ]);

                    if (isActive) {
                        const compartilhados = resCompartilhados.data.registros || [];
                        const panorama = resPanorama.data.registros || [];
                        
                        setCompartilhadosOriginais(compartilhados);
                        setPanoramaOriginal(panorama);
                        
                        processarEstatisticas(panorama, compartilhados, filtroTempo);
                    }
                } catch (error) {
                    console.error("Erro ao buscar prontuário:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchProntuario();
            return () => { isActive = false; };
        }, [id])
    );

    const formatarData = (dataStr: string) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerAll]}>
                <ActivityIndicator size="large" color="#4E6151" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Ionicons name="arrow-back" size={28} color="#4E6151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prontuário</Text>
                
                {vinculo_id ? (
                    <RemoverVinculo 
                        vinculoId={vinculo_id as string} 
                        nomePaciente="este paciente" 
                        onSuccess={() => router.back()} 
                    />
                ) : (
                    <View style={{ width: 28 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <SeletorFiltro 
                    opcoes={[{ label: 'Semana', valor: 'semana' }, { label: 'Mês', valor: 'mes' }, { label: 'Ano', valor: 'ano' }]}
                    valorAtivo={filtroTempo}
                    onChange={(valor) => setFiltroTempo(valor)}
                />
                
                
                <SeletorFiltro 
                    opcoes={[{ label: 'Barras', valor: 'barras' }, { label: 'Pizza', valor: 'pizza' }]}
                    valorAtivo={tipoGrafico}
                    onChange={(valor) => setTipoGrafico(valor)}
                />

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Frequência Emocional</Text>
                    <Text style={styles.cardSubtitle}>Panorama geral do humor neste período</Text>

                    {relatosDadosGrafico.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#8C8C8C', marginVertical: 20 }}>Nenhum relato neste período.</Text>
                    ) : tipoGrafico === 'barras' ? (
                        <GraficoBarras dados={relatosDadosGrafico} cores={coresEmocoes} />
                    ) : (
                        <GraficoPizza dados={relatosDadosGrafico} cores={coresEmocoes} />
                    )}
                </View>

                
                <Text style={styles.sectionTitle}>Diários Compartilhados</Text>
                
                {compartilhadosOriginais.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#8C8C8C', marginTop: 10 }}>O paciente ainda não compartilhou relatos.</Text>
                ) : (
                
                    [...compartilhadosOriginais]
                        .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
                        .map((reg) => (
                            <View key={reg.id} style={styles.registroCard}>
                                <View style={styles.registroHeader}>
                                    <Text style={styles.registroData}>{formatarData(reg.data_criacao)}</Text>
                                    <View style={[styles.tagSentimento, { backgroundColor: coresEmocoes[reg.sentimento] || '#666' }]}>
                                        <Text style={styles.tagText}>{reg.sentimento}</Text>
                                    </View>
                                </View>
                                <Text style={styles.registroTexto}>{reg.relato}</Text>
                            </View>
                        ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9F5' },
    centerAll: { 
        justifyContent: 'center', 
        alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingTop: 60, 
        paddingHorizontal: 25, 
        paddingBottom: 15, 
        backgroundColor: '#FFFFFF', 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 5, 
        shadowOffset: { width: 0, height: 2 } },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1A1A1A', 
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    scrollContent: { 
        paddingHorizontal: 25, 
        paddingTop: 25, 
        paddingBottom: 100 },
    card: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: 25, 
        padding: 25, 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 10, 
        shadowOffset: { 
            width: 0, 
            height: 4 }, 
        marginBottom: 25, 
        marginTop: 10 },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1A1A1A', 
        marginBottom: 4 },
    cardSubtitle: { 
        fontSize: 12, 
        color: '#8C8C8C', 
        marginBottom: 20 },
    sectionTitle: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: '#4E6151', 
        marginBottom: 15, 
        textTransform: 'uppercase' },
    registroCard: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 15, 
        borderLeftWidth: 4, 
        borderLeftColor: '#E5E5DE', 
        elevation: 1 },
    registroHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 },
    registroData: { 
        fontSize: 12, 
        color: '#8C8C8C', 
        fontWeight: '500', 
        textTransform: 'uppercase' },
    tagSentimento: { 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 12 },
    tagText: { 
        color: '#FFF', 
        fontSize: 11, 
        fontWeight: '700' },
    registroTexto: { 
        fontSize: 15, 
        color: '#333', 
        lineHeight: 24 },
    emptyContainer: { 
        alignItems: 'center', 
        marginTop: 80 },
    emptyText: { 
        fontSize: 15, 
        color: '#8C8C8C', 
        marginTop: 15, 
        textAlign: 'center' },
});