import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PharmacyMap from '../components/PharmacyMap';
const GREEN = '#16A34A';
const DARK_GREEN = '#14532D';
const LIGHT_GREEN = '#DCFCE7';
const DEFAULT_POS = { latitude: 34.6867, longitude: -1.9114 };

type Pharmacy = {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  hours: string;
  onDuty: boolean;
};

const PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'Pharmacie Al Amal',
    address: 'Bd Mohammed V, Oujda',
    phone: '+212536000001',
    latitude: 34.6867,
    longitude: -1.9114,
    hours: "Garde jusqu'à 08:00",
    onDuty: true,
  },
  {
    id: '2',
    name: 'Pharmacie Centrale',
    address: 'Rue de Marrakech, Oujda',
    phone: '+212536000002',
    latitude: 34.6895,
    longitude: -1.9075,
    hours: "Garde jusqu'à 22:00",
    onDuty: true,
  },
  {
    id: '3',
    name: 'Pharmacie Hay Al Qods',
    address: 'Hay Al Qods, Oujda',
    phone: '+212536000003',
    latitude: 34.6791,
    longitude: -1.9203,
    hours: 'Ouverte 09:00 - 20:00',
    onDuty: false,
  },
];

type Coords = { latitude: number; longitude: number };

// Distance en km entre deux points
function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type View_ = 'liste' | 'carte';
type Mode = 'garde' | 'toutes';

export default function HomeScreen() {
  const mapRef = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View_>('liste');
  const [mode, setMode] = useState<Mode>('garde');
  const [position, setPosition] = useState<Coords | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {
        // on garde la position par défaut
      }
    })();
  }, []);

  const data = useMemo(() => {
    const origin = position ?? DEFAULT_POS;
    const q = search.toLowerCase();
    return PHARMACIES.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
      const matchMode = mode === 'toutes' || p.onDuty;
      return matchSearch && matchMode;
    })
      .map((p) => ({ ...p, distance: distanceKm(origin, p) }))
      .sort((a, b) => a.distance - b.distance);
  }, [search, mode, position]);

  const recenter = () => {
    const target = position ?? DEFAULT_POS;
    mapRef.current?.animateToRegion?.(
      { ...target, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      500
    );
  };

  const call = (phone: string) => Linking.openURL(`tel:${phone}`);
  const directions = (p: Pharmacy) =>
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
    );

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Pharmacies de garde</Text>
        <Text style={styles.subtitle}>Oujda · {today}</Text>
        <TextInput
          style={styles.search}
          placeholder="Rechercher une pharmacie"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        {(['garde', 'toutes'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.pill, mode === m && styles.pillActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.pillText, mode === m && styles.pillTextActive]}>
              {m === 'garde' ? 'De garde' : 'Toutes'}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        {(['liste', 'carte'] as View_[]).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.pill, view === v && styles.pillActive]}
            onPress={() => setView(v)}
          >
            <Text style={[styles.pillText, view === v && styles.pillTextActive]}>
              {v === 'liste' ? 'Liste' : 'Carte'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu */}
      {view === 'liste' ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Aucune pharmacie trouvée.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={[styles.badge, !item.onDuty && styles.badgeGrey]}>
                  {item.onDuty ? 'De garde' : 'Ouverte'}
                </Text>
              </View>
              <Text style={styles.info}>{item.address}</Text>
              <Text style={styles.info}>{item.hours}</Text>
              <Text style={styles.distance}>
                {item.distance.toFixed(1).replace('.', ',')} km
              </Text>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => call(item.phone)}>
                  <Text style={styles.btnPrimaryText}>Appeler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnOutline} onPress={() => directions(item)}>
                  <Text style={styles.btnOutlineText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.mapFull}>
          <PharmacyMap ref={mapRef} pharmacies={data} />
          <TouchableOpacity style={styles.locateBtn} onPress={recenter}>
            <Text style={styles.locateText}>◎</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { backgroundColor: GREEN, padding: 16, paddingBottom: 14 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: LIGHT_GREEN, fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    fontSize: 15,
    color: '#111827',
  },

  filters: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pillActive: { backgroundColor: LIGHT_GREEN, borderColor: GREEN },
  pillText: { color: '#4B5563', fontWeight: '600', fontSize: 13 },
  pillTextActive: { color: DARK_GREEN },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: LIGHT_GREEN,
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  badgeGrey: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  info: { fontSize: 14, color: '#4B5563', marginTop: 6 },
  distance: { fontSize: 13, color: GREEN, fontWeight: '700', marginTop: 6 },

  buttons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btnPrimary: {
    flex: 1,
    backgroundColor: GREEN,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnOutlineText: { color: GREEN, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 30 },

  // Carte plein écran
  mapFull: { flex: 1 },
  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  locateText: { fontSize: 24, color: GREEN },
});