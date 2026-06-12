import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator } from 'react-native';

import GraficoBarras from '@/components/GraficoBarras';
import GraficoPizza from '@/components/GraficoPizza';
import SeletorFiltro from '@/components/SeletorFiltro';

const API_IP = process.env.EXPO_PUBLIC_API_IP || '10.0.2.2';
const BASE_URL = `http://${API_IP}:8000`;

const coresEmocoes: Record<string, string> = {
    Alegria: '#F4D03F', Tristeza: '#5DADE2', Raiva: '#E74C3C', Medo: '#1E8449',
    Confianca: '#82E0AA', Aversao: '#AF7AC5', Surpresa: '#48C9B0', Antecipacao: '#F5B041',
};

type DadoEmocao = { sentimento: string; porcentagem: number; };

export default function Refletir() {
    const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'pizza'>('barras');
    const [filtroTempo, setFiltroTempo] = useState<'semana' | 'mes' | 'ano'>('semana');

    const [loading, setLoading] = useState(true);
    const [registrosOriginais, setRegistrosOriginais] = useState<any[]>([]); 
    const [relatosDados, setRelatosDados] = useState<DadoEmocao[]>([]);
    const [totalRelatos, setTotalRelatos] = useState(0);
    const [sentimentoPredominante, setSentimentoPredominante] = useState("Nenhum");
    const [porcentagemPredominante, setPorcentagemPredominante] = useState(0);

    const processarEstatisticas = (registros: any[], filtro: 'semana' | 'mes' | 'ano') => {
        const agora = new Date();

        const registrosFiltrados = registros.filter(reg => {
            const dataReg = new Date(reg.data_criacao);
            const diffTempo = agora.getTime() - dataReg.getTime();
            const diasDiff = diffTempo / (1000 * 3600 * 24);

            if (filtro === 'semana') return diasDiff <= 7;
            if (filtro === 'mes') return diasDiff <= 30;
            return diasDiff <= 365; 
        });

        setTotalRelatos(registrosFiltrados.length);

        if (registrosFiltrados.length > 0) {
            const contagem: Record<string, number> = {};
            registrosFiltrados.forEach((reg: any) => {
                const sent = reg.sentimento || 'Outros';
                contagem[sent] = (contagem[sent] || 0) + 1;
            });

            const dadosFormatados = Object.keys(contagem).map(key => ({
                sentimento: key,
                porcentagem: Math.round((contagem[key] / registrosFiltrados.length) * 100)
            })).sort((a, b) => b.porcentagem - a.porcentagem);

            setRelatosDados(dadosFormatados);
            setSentimentoPredominante(dadosFormatados[0].sentimento);
            setPorcentagemPredominante(dadosFormatados[0].porcentagem);
        } else {
            setRelatosDados([]);
            setSentimentoPredominante("Nenhum");
            setPorcentagemPredominante(0);
        }
    };

    React.useEffect(() => {
        processarEstatisticas(registrosOriginais, filtroTempo);
    }, [filtroTempo, registrosOriginais]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchEstatisticas = async () => {
                setLoading(true);
                try {
                    const token = await SecureStore.getItemAsync('userToken');
                    const response = await axios.get(`${BASE_URL}/registros/listar_registros`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (isActive && response.data) {
                        const registros = response.data.registros;
                        setRegistrosOriginais(registros); 
                        processarEstatisticas(registros, filtroTempo); 
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do gráfico:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchEstatisticas();
            return () => { isActive = false; };
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4E6151" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Refletir</Text>
            <Text style={styles.subtitle}>Acompanhe a distribuição das suas emoções ao longo do tempo.</Text>

            <SeletorFiltro 
                opcoes={[{ label: 'Semana', valor: 'semana' }, { label: 'Mês', valor: 'mes' }, { label: 'Ano', valor: 'ano' }]}
                valorAtivo={filtroTempo}
                onChange={setFiltroTempo}
            />
            
            <SeletorFiltro 
                opcoes={[{ label: 'Barras', valor: 'barras' }, { label: 'Pizza', valor: 'pizza' }]}
                valorAtivo={tipoGrafico}
                onChange={setTipoGrafico}
            />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribuição Emocional</Text>
                <Text style={styles.cardSubtitle}>Com base em {totalRelatos} relatos neste período</Text>

                {totalRelatos === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#8C8C8C', marginVertical: 20 }}>Nenhum relato neste período.</Text>
                ) : tipoGrafico === 'barras' ? (
                    <GraficoBarras dados={relatosDados} cores={coresEmocoes} />
                ) : (
                    <GraficoPizza dados={relatosDados} cores={coresEmocoes} />
                )}
            </View>

            {totalRelatos > 0 && (
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Insight Predominante</Text>
                    <Text style={styles.insightDescription}>
                        O seu sentimento mais frequente neste período foi{' '}
                        <Text style={[styles.insightHighlight, { color: coresEmocoes[sentimentoPredominante] || '#1A1A1A' }]}>
                            {sentimentoPredominante}
                        </Text>
                        , aparecendo em {porcentagemPredominante}% das suas reflexões.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9F5'
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 80,
        paddingBottom: 120
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 25
    },
    card: { 
        backgroundColor: '#FFFFFF', borderRadius: 25, padding: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 25 
    },
    cardTitle: { 
        fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 
    },
    cardSubtitle: { 
        fontSize: 12, color: '#8C8C8C', marginBottom: 25 
    },
    insightCard: { 
        backgroundColor: '#FFFFFF', borderRadius: 25, borderLeftWidth: 5, borderLeftColor: '#4E6151', padding: 25, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } 
    },
    insightTitle: { 
        fontSize: 15, 
        fontWeight: '700', color: '#4E6151', 
        marginBottom: 10 
    },
    insightDescription: { 
        fontSize: 14, 
        color: '#444', 
        lineHeight: 22 
    },
    insightHighlight: {
        fontWeight: '700',
        backgroundColor: '#F0F2F0',
        paddingHorizontal: 4
    },
});