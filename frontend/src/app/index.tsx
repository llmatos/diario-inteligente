import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SvgComponent from '@/components/LogoIndex';
import SvgIcon from '@/components/LogoProject';


export default function WelcomeScreen() {
  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      
      
      <View style={styles.header}>
       
        <Text style={styles.brandText}> <SvgIcon/> Clareza</Text>
      </View>

      
      <View style={styles.centerContent}>
        
        <View style={styles.iconContainer}>
          <SvgIcon/>
        </View>

        
        <View style={styles.textSection}>
          <Text style={styles.title}>
            Seu refúgio para o{"\n"}
            <Text style={styles.titleItalic}>bem-estar mental.</Text>
          </Text>
          
          <Text style={styles.description}>
            Um espaço seguro para explorar suas emoções, cultivar o autoconhecimento e encontrar clareza em sua jornada terapêutica.
          </Text>
        </View>
      </View>

      
      <View style={styles.bottomContent}>
        
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.buttonPrimary}>
              <Text style={styles.buttonTextPrimary}>Criar Conta</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.buttonSecondary}>
              <Text style={styles.buttonTextSecondary}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>

       
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9F5',
  },
  contentContainer: {
    
    flexGrow: 1, 
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 100,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
    paddingHorizontal: 30,    
    paddingBottom: 40,
    paddingTop: 100, 
  },
  header: {
    
    position: 'absolute',
    top: 60, 
    left: 0,
    right: 0,
    alignItems: 'center', 
    zIndex: 10,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4E6151',
    letterSpacing: 1,
    },
  centerContent: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 40, 
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  abstractIconPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    color: '#1A1A1A',
    lineHeight: 40,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#4E6151',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomContent: {
    gap: 30, 
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#4E6151',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1CB',
  },
  buttonTextSecondary: {
    color: '#4E6151',
    fontSize: 16,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1CB',
  },
  dotActive: {
    backgroundColor: '#4E6151',
    width: 8,
  },
});