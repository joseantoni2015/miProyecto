import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  // Estados de la calculadora
  const [mode, setMode] = useState('loan'); // 'loan' | 'simple' | 'compound' | 'savings'
  const [currency, setCurrency] = useState('DOP'); // 'DOP' | 'USD'
  const exchangeRate = 59.20;

  const [capital, setCapital] = useState('100,000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('2');

  const [result, setResult] = useState({
    heroAmount: 4707.35,
    totalAmount: 112976.40,
    interestAmount: 12976.40,
    principal: 100000,
  });

  // Cálculo de meses
  const parsedYears = parseFloat(years) || 0;
  const months = Math.round(parsedYears * 12);

  // Función de cálculo financiero
  const handleCalculate = () => {
    const P_raw = parseFloat(capital.replace(/,/g, '')) || 0;
    const r_raw = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;

    const P = currency === 'USD' ? P_raw * exchangeRate : P_raw;

    if (P <= 0 || r_raw < 0 || t <= 0) return;

    let hero = 0;
    let total = 0;
    let interest = 0;

    if (mode === 'loan') {
      const monthlyRate = r_raw / 12;
      const totalMonths = Math.max(1, Math.round(t * 12));
      if (monthlyRate === 0) {
        hero = P / totalMonths;
        total = P;
        interest = 0;
      } else {
        hero = (P * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
        total = hero * totalMonths;
        interest = total - P;
      }
    } else if (mode === 'simple') {
      interest = P * r_raw * t;
      total = P + interest;
      hero = interest;
    } else if (mode === 'compound' || mode === 'savings') {
      const n = 12;
      total = P * Math.pow(1 + r_raw / n, n * t);
      interest = Math.max(0, total - P);
      hero = total;
    }

    setResult({
      heroAmount: hero,
      totalAmount: total,
      interestAmount: interest,
      principal: P,
    });
  };

  const formatMoney = (val: number) => {
    const factor = currency === 'USD' ? 1 / exchangeRate : 1;
    const converted = val * factor;
    const sym = currency === 'DOP' ? 'RD$' : '$';
    return `${sym} ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Porcentajes para la barra visual
  const factor = currency === 'USD' ? 1 / exchangeRate : 1;
  const currentPrincipal = result.principal * factor;
  const currentInterest = result.interestAmount * factor;
  const safeTotal = Math.max(0.01, currentPrincipal + currentInterest);
  const pctP = Math.min(100, Math.max(0, (currentPrincipal / safeTotal) * 100));
  const pctI = 100 - pctP;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Nativo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoText}>FinanCalc</Text>
          <Text style={styles.subLogoText}>Calculadora Préstamos</Text>
        </View>
        <TouchableOpacity
          style={styles.currencyButton}
          onPress={() => setCurrency(currency === 'DOP' ? 'USD' : 'DOP')}
        >
          <Text style={styles.currencyButtonText}>{currency === 'DOP' ? 'RD$' : 'USD'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pestañas de Modalidad */}
        <View style={styles.tabContainer}>
          {[
            { key: 'loan', label: 'Préstamo' },
            { key: 'simple', label: 'Int. Simple' },
            { key: 'compound', label: 'Compuesto' },
            { key: 'savings', label: 'Ahorro' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.tab, mode === item.key && styles.activeTab]}
              onPress={() => {
                setMode(item.key);
                handleCalculate();
              }}
            >
              <Text style={[styles.tabText, mode === item.key && styles.activeTabText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.label}>Capital Inicial</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={capital}
            onChangeText={setCapital}
          />

          <Text style={styles.label}>Tasa de Interés Anual (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
          />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Plazo (Años)</Text>
            <Text style={styles.badgeText}>{months} meses</Text>
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={years}
            onChangeText={setYears}
          />

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Calcular Ahora</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Resultados */}
        <View style={styles.card}>
          <Text style={styles.resultTitle}>Proyección en Tiempo Real</Text>
          
          <View style={styles.heroBox}>
            <Text style={styles.heroLabel}>
              {mode === 'loan' ? 'Cuota Mensual' : mode === 'simple' ? 'Interés Generado' : 'Monto Final Acumulado'}
            </Text>
            <Text style={styles.heroValue}>{formatMoney(result.heroAmount)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Monto Total</Text>
              <Text style={styles.statValue}>{formatMoney(result.totalAmount)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Intereses</Text>
              <Text style={styles.statValue}>{formatMoney(result.interestAmount)}</Text>
            </View>
          </View>

          {/* Barra Proporcional */}
          <View style={styles.barContainer}>
            <View style={[styles.barPrincipal, { width: `${pctP}%` }]} />
            <View style={[styles.barInterest, { width: `${pctI}%` }]} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.smallText}>Principal: {pctP.toFixed(1)}%</Text>
            <Text style={styles.smallText}>Intereses: {pctI.toFixed(1)}%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8ff' },

  header: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#faf8ff', borderBottomWidth: 1, borderBottomColor: '#eaedff' },
  headerLeft: { justifyContent: 'center' },

  logoText: { fontSize: 18, fontWeight: '700', color: '#006948' },


  subLogoText: { fontSize: 12, color: '#3d4a42' },

  currencyButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eaedff', borderRadius: 16 },

  currencyButtonText: { color: '#006948', fontWeight: '700', fontSize: 12 },

  scrollContent: { padding: 16 },

  tabContainer: { flexDirection: 'row', backgroundColor: '#eaedff', borderRadius: 24, padding: 4, marginBottom: 16 },

  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 },
  tabText: { fontSize: 12, color: '#3d4a42', fontWeight: '600' },
  activeTabText: { color: '#006948', fontWeight: '700' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#131b2e', marginBottom: 6 },
  input: { height: 50, backgroundColor: '#f2f3ff', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#131b2e', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeText: { fontSize: 12, backgroundColor: '#e2e7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, color: '#131b2e' },
  calculateButton: { height: 50, backgroundColor: '#006948', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  calculateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  resultTitle: { fontSize: 12, fontWeight: '700', color: '#3d4a42', textTransform: 'uppercase', marginBottom: 10 },
  heroBox: { backgroundColor: '#f2f3ff', borderRadius: 10, padding: 16, marginBottom: 12 },
  heroLabel: { fontSize: 12, color: '#3d4a42', fontWeight: '600', textTransform: 'uppercase' },
  heroValue: { fontSize: 26, fontWeight: '800', color: '#006948', marginTop: 4 },
  statBox: { flex: 1, backgroundColor: '#f2f3ff', borderRadius: 8, padding: 12, marginHorizontal: 2 },
  statLabel: { fontSize: 11, color: '#3d4a42' },
  statValue: { fontSize: 13, fontWeight: '700', color: '#131b2e', marginTop: 2 },
  barContainer: { height: 12, backgroundColor: '#eaedff', borderRadius: 6, flexDirection: 'row', overflow: 'hidden', marginVertical: 12 },
  barPrincipal: { backgroundColor: '#006948', height: '100%' },
  barInterest: { backgroundColor: '#6bd8cb', height: '100%' },
  smallText: { fontSize: 11, color: '#6d7a72' }
});