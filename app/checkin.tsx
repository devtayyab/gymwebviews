import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { QrCode, CheckCircle2, RotateCcw, Camera as CameraIcon, Flame, History } from 'lucide-react-native';
import { addCheckIn, getCheckIns, computeStreak, CheckIn } from '@/lib/checkins';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function CheckInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<CheckIn[]>([]);

  const loadHistory = useCallback(async () => {
    setHistory(await getCheckIns());
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Only keep the camera mounted while this screen is focused.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const handleScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(result.data);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    const updated = await addCheckIn(result.data);
    setHistory(updated);
  };

  const reset = () => setScanned(null);

  const streak = computeStreak(history);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Preparing camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Once the system prompt can no longer be shown, the only way back is Settings.
    const mustUseSettings = !permission.canAskAgain;
    return (
      <View style={styles.center}>
        <CameraIcon size={64} color="#007AFF" />
        <Text style={styles.title}>Gym Check-In</Text>
        <Text style={styles.subtitle}>
          {mustUseSettings
            ? 'Camera access is turned off, so the QR scanner cannot read your membership code. You can turn it back on in Settings.'
            : 'Scanning your membership QR code at the gym entrance uses the camera.'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={mustUseSettings ? () => Linking.openSettings().catch(() => {}) : requestPermission}
        >
          <Text style={styles.primaryButtonText}>{mustUseSettings ? 'Open Settings' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scanned) {
    return (
      <ScrollView contentContainerStyle={styles.successScroll}>
        <CheckCircle2 size={80} color="#34c759" />
        <Text style={styles.title}>Checked In!</Text>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Flame size={18} color="#ff9500" />
            <Text style={styles.streakText}>{streak}-day streak</Text>
          </View>
        )}
        <Text style={styles.subtitle}>Scanned code:</Text>
        <Text style={styles.code} numberOfLines={2}>
          {scanned}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={reset}>
          <RotateCcw size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Scan Again</Text>
        </TouchableOpacity>

        {history.length > 0 && (
          <View style={styles.historyBlock}>
            <View style={styles.historyHeader}>
              <History size={18} color="#8e8e93" />
              <Text style={styles.historyTitle}>Recent visits</Text>
            </View>
            {history.slice(0, 8).map((c, i) => (
              <View key={`${c.timestamp}-${i}`} style={styles.historyRow}>
                <Text style={styles.historyDate}>{formatDate(c.timestamp)}</Text>
                <Text style={styles.historyTime}>{formatTime(c.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hintBar}>
        <Text style={styles.hintText}>Point your camera at the QR code</Text>
        {streak > 0 && (
          <View style={styles.streakPillDark}>
            <Flame size={14} color="#ff9500" />
            <Text style={styles.streakTextDark}>{streak}-day streak</Text>
          </View>
        )}
      </View>
      <View style={styles.cameraWrapper}>
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128', 'pdf417'] }}
            onBarcodeScanned={handleScanned}
          />
        )}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frame}>
            <QrCode size={48} color="rgba(255,255,255,0.6)" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#fff',
  },
  successScroll: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#fff',
  },
  hintBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintText: { color: '#bbb', fontSize: 14 },
  cameraWrapper: { flex: 1, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1c1e', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  code: { fontSize: 15, color: '#007AFF', fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff4e5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  streakText: { color: '#ff9500', fontSize: 14, fontWeight: '700' },
  streakPillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,149,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakTextDark: { color: '#ff9500', fontSize: 13, fontWeight: '700' },
  historyBlock: { alignSelf: 'stretch', marginTop: 32 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  historyDate: { fontSize: 15, color: '#1c1c1e', fontWeight: '500' },
  historyTime: { fontSize: 15, color: '#8e8e93' },
});
