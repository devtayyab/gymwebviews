import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
    });
    return () => unsubscribe();
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 0 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    zIndex: 9999,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
