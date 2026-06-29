import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import {
  Globe,
  ShieldCheck,
  Mail,
  Share2,
  ChevronRight,
  Info,
} from 'lucide-react-native';

const WEBSITE = 'https://smartygym.com/';
const PRIVACY = 'https://smartygym.com/privacy';
const CONTACT = 'https://smartygym.com/contact';

export default function MoreScreen() {
  const openBrowser = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Smarty Gym! ' + WEBSITE,
        url: WEBSITE,
      });
    } catch {
      // user cancelled
    }
  };

  const rows = [
    { icon: Globe, label: 'Visit Website', onPress: () => openBrowser(WEBSITE) },
    { icon: ShieldCheck, label: 'Privacy Policy', onPress: () => openBrowser(PRIVACY) },
    { icon: Mail, label: 'Contact Support', onPress: () => openBrowser(CONTACT) },
    { icon: Share2, label: 'Share Smarty Gym', onPress: shareApp },
  ];

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <TouchableOpacity
              key={r.label}
              style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
              onPress={r.onPress}
            >
              <Icon size={22} color="#007AFF" />
              <Text style={styles.rowLabel}>{r.label}</Text>
              <ChevronRight size={20} color="#c7c7cc" />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.aboutRow}>
        <Info size={16} color="#8e8e93" />
        <Text style={styles.aboutText}>Smarty Gym · Version {version}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0' },
  rowLabel: { flex: 1, fontSize: 16, color: '#1c1c1e' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28 },
  aboutText: { fontSize: 13, color: '#8e8e93' },
});
