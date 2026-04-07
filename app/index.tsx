import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AdvancedWebView from '@/components/AdvancedWebView';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.webviewContainer}>
        <AdvancedWebView url="https://smartygym.com/" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webviewContainer: {
    flex: 1,
  },
});
