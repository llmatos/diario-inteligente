import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Opcao {
  label: string;
  valor: string;
}

interface SeletorFiltroProps {
  opcoes: Opcao[];
  valorAtivo: string;
  onChange: (valor: any) => void;
}

export default function SeletorFiltro({ opcoes, valorAtivo, onChange }: SeletorFiltroProps) {
  return (
    <View style={styles.toggleContainer}>
      {opcoes.map((opcao) => (
        <TouchableOpacity 
          key={opcao.valor}
          style={[styles.toggleButton, valorAtivo === opcao.valor && styles.toggleButtonActive]} 
          onPress={() => onChange(opcao.valor)}
        >
          <Text style={[styles.toggleText, valorAtivo === opcao.valor && styles.toggleTextActive]}>
            {opcao.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: { flexDirection: 'row', backgroundColor: '#E5E5DE', borderRadius: 15, padding: 4, marginBottom: 15 },
  toggleButton: { flex: 1, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  toggleButtonActive: { backgroundColor: '#4E6151' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  toggleTextActive: { color: '#FFFFFF' },
});