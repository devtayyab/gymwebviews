import { StyleSheet, View, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { QrCode, Timer, Bell, Menu } from 'lucide-react-native';
import AdvancedWebView from '@/components/AdvancedWebView';

const WEBVIEW_URL = 'https://smartygym.com/';

export default function HomeScreen() {
  const router = useRouter();

  const go = (path: '/checkin' | '/timer' | '/reminders' | '/more') => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => go('/checkin')} hitSlop={8}>
            <QrCode size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => go('/timer')} hitSlop={8}>
            <Timer size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => go('/reminders')} hitSlop={8}>
            <Bell size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => go('/more')} hitSlop={8}>
            <Menu size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <AdvancedWebView url={WEBVIEW_URL} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 45 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  iconButton: {
    padding: 2,
  },
  contentContainer: {
    flex: 1,
  },
});
