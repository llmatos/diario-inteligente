import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type DadoEmocao = {
    sentimento: string;
    porcentagem: number;
};

interface GraficoBarrasProps {
    dados: DadoEmocao[];
    cores: Record<string, string>;
}

export default function GraficoBarras({ dados, cores }: GraficoBarrasProps) {
    return (
        <View style={styles.chartContainer}>
            {dados.map((item, index) => (
                <View key={index} style={styles.barGroup}>
                    <View style={styles.barLabelRow}>
                        <Text style={styles.emotionName}>{item.sentimento}</Text>
                        <Text style={styles.emotionPercentage}>{item.porcentagem}%</Text>
                    </View>
                    <View style={styles.barBackground}>
                        <View
                            style={[
                                styles.barFill,
                                { width: `${item.porcentagem}%`, backgroundColor: cores[item.sentimento] || '#666' }
                            ]}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: { 
        marginTop: 5 
    },
    barGroup: { 
        marginBottom: 18 
    },
    barLabelRow: { 
        flexDirection: 'row',
        justifyContent: 'space-between', 
        marginBottom: 6 
    },
    emotionName: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#333' 
    },
    emotionPercentage: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#1A1A1A' 
    },
    barBackground: { 
        height: 10, 
        backgroundColor: '#F0F2F0', 
        borderRadius: 10, 
        overflow: 'hidden' 
    },
    barFill: { 
        height: '100%', 
        borderRadius: 10 
    },
});