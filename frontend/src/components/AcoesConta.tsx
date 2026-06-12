import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface AcoesContaProps {
  onLogout: () => void;
  
  onDeleteAccount?: () => void; 
}

export default function AcoesConta({ onLogout, onDeleteAccount }: AcoesContaProps) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.buttonLogout} onPress={onLogout}>
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>

      {onDeleteAccount && (
        <TouchableOpacity style={styles.buttonDelete} onPress={onDeleteAccount}>
          <Text style={styles.buttonDeleteText}>Excluir Minha Conta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 10,
    marginBottom: 40, 
  },
  buttonLogout: {
    backgroundColor: '#A3B19B',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDelete: {
    backgroundColor: 'transparent',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D98888',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDeleteText: {
    color: '#C25C5C',
    fontSize: 15,
    fontWeight: '600',
  },
});