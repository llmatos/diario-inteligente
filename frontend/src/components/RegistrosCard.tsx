import { useState } from "react";
import { View, Text, Platform, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons'; 

type RegistroCardProps = {
    id: string; 
    sentimento: string;
    resumo: string;
    dataCriacao: string;
    onDelete: (id: string) => void; 
    onShare: (id: string) => void;
    textoCompleto: string;
}


const coresBackground: Record<string, string> = {
    Alegria: '#F4D03F',      
    Tristeza: '#5DADE2',     
    Raiva: '#E74C3C',        
    Medo: '#1E8449',         
    Confianca: '#82E0AA',    
    Aversao: '#AF7AC5',      
    Surpresa: '#48C9B0',     
    Antecipacao: '#F5B041',  
};

const coresTexto: Record<string, string> = {
    Alegria: '#333333',      
    Tristeza: '#FFFFFF',     
    Raiva: '#FFFFFF',        
    Medo: '#FFFFFF',         
    Confianca: '#333333',    
    Aversao: '#FFFFFF',      
    Surpresa: '#333333',     
    Antecipacao: '#333333',  
};

export default function RegistroCard({
    id,
    sentimento,
    resumo,
    dataCriacao,
    textoCompleto,
    onDelete,
    onShare
}: RegistroCardProps) {
    
    const [modalVisivel, setModalVisivel] = useState(false);

    const formatarData = (dataIso: string): string => {
        if (!dataIso) return "Data indisponível";
        try {
            const dataObjeto = new Date(dataIso);
            return dataObjeto.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return "Erro na data";
        }
    };

    const chaveEmocao = sentimento ? sentimento.trim() : '';
    const backgroundColor = coresBackground[chaveEmocao] || '#DAE8D9';
    const color = coresTexto[chaveEmocao] || '#4E6151';

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.dateText}>{formatarData(dataCriacao)}</Text>
                
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        onPress={() => onShare(id)} 
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
                        style={styles.iconButton}
                    >
                        <Ionicons name="share-outline" size={20} color="#4E6151" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => onDelete(id)} 
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
                        style={styles.iconButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#D98888" />
                    </TouchableOpacity>
                </View>
            </View>

           
            <TouchableOpacity 
                activeOpacity={0.6} 
                onPress={() => setModalVisivel(true)}
            >
                <Text style={styles.resumoText} numberOfLines={5}>{resumo}</Text>
                
                {resumo.length > 150 && (
                    <Text style={styles.readMoreText}>Ler relato completo...</Text>
                )}
                
                <View style={styles.tagContainer}>
                    <View style={[styles.tag, { backgroundColor }]}>
                        <Text style={[styles.tagText, { color }]}>{sentimento}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisivel}
                onRequestClose={() => setModalVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        
                       
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalDate}>{formatarData(dataCriacao)}</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisivel(false)}
                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            >
                                <Ionicons name="close-circle" size={28} color="#A0A0A0" />
                            </TouchableOpacity>
                        </View>

                       
                        <View style={[styles.tag, { backgroundColor, alignSelf: 'flex-start', marginBottom: 20 }]}>
                            <Text style={[styles.tagText, { color }]}>{sentimento}</Text>
                        </View>

                       
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalFullText}>{textoCompleto}</Text>
                        </ScrollView>

                    </View>
                </View>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        width: '100%',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
        }),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 15, 
    },
    dateText: {
        fontSize: 11,
        color: '#8C8C8C',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    resumoText: {
        fontSize: 18,
        color: '#1A1A1A',
        lineHeight: 24,
        marginBottom: 8,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    readMoreText: {
        fontSize: 12,
        color: '#A3B19B',
        marginBottom: 16,
        fontWeight: '600',
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    
    // ==========================================
    // ESTILOS DO MODAL
    // ==========================================
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo escuro semi-transparente
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#F8F9F5', // Mesmo bege claro do fundo do app
        width: '100%',
        maxHeight: '80%', // Evita que o modal ocupe a tela inteira
        borderRadius: 25,
        padding: 25,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalDate: {
        fontSize: 12,
        color: '#8C8C8C',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    modalFullText: {
        fontSize: 18,
        color: '#1A1A1A',
        lineHeight: 28, // Um pouco mais de espaço entre linhas para leitura longa
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        paddingBottom: 20,
    }
});