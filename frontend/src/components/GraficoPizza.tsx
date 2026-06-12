import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

type DadoEmocao = {
    sentimento: string;
    porcentagem: number;
};

interface GraficoPizzaProps {
    dados: DadoEmocao[];
    cores: Record<string, string>;
}

export default function GraficoPizza({ dados, cores }: GraficoPizzaProps) {
    const raio = 80;
    const centroX = 100;
    const centroY = 100;
    let anguloAcumulado = 0;

    const gerarCaminhoPizza = (porcentagem: number) => {
        if (porcentagem >= 100) return `M ${centroX} ${centroY - raio} A ${raio} ${raio} 0 1 1 ${centroX - 0.01} ${centroY - raio} Z`;
        const anguloDesejado = (porcentagem / 100) * 360;
        const radianInicio = ((anguloAcumulado - 90) * Math.PI) / 180;
        const radianFim = ((anguloAcumulado + anguloDesejado - 90) * Math.PI) / 180;
        const x1 = centroX + raio * Math.cos(radianInicio);
        const y1 = centroY + raio * Math.sin(radianInicio);
        const x2 = centroX + raio * Math.cos(radianFim);
        const y2 = centroY + raio * Math.sin(radianFim);
        const grandeArco = anguloDesejado > 180 ? 1 : 0;
        const caminhoD = `M ${centroX} ${centroY} L ${x1} ${y1} A ${raio} ${raio} 0 ${grandeArco} 1 ${x2} ${y2} Z`;
        anguloAcumulado += anguloDesejado;
        return caminhoD;
    };

    return (
        <View style={styles.pizzaContainer}>
            <View style={styles.svgWrapper}>
                <Svg width="200" height="200">
                    <G>
                        {dados.map((item, index) => (
                            <Path
                                key={index}
                                d={gerarCaminhoPizza(item.porcentagem)}
                                fill={cores[item.sentimento] || '#666'}
                            />
                        ))}
                    </G>
                </Svg>
            </View>

            <View style={styles.legendContainer}>
                {dados.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendIndicator, { backgroundColor: cores[item.sentimento] || '#666' }]} />
                        <Text style={styles.legendText}>{item.sentimento}: {item.porcentagem}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pizzaContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: 10 
    },
    svgWrapper: { 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    legendContainer: { 
        flex: 1, marginLeft: 20, 
        justifyContent: 'center' 
    },
    legendItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    legendIndicator: { 
        width: 12, 
        height: 12, 
        borderRadius: 4, 
        marginRight: 8 
    },
    legendText: { 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#333' 
    },
});