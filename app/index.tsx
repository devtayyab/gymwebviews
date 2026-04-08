import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AdvancedWebView from '@/components/AdvancedWebView';
import Calculator from '@/components/Calculator';

export default function HomeScreen() {
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebviewUrl();
  }, []);

  const fetchWebviewUrl = async () => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-webview-url`;
      const headers = {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, { headers });
      const data = await response.json();

      if (data.url) {
        setWebviewUrl(data.url);
      } else {
        setWebviewUrl(null);
      }
    } catch (err) {
      console.error('Error fetching webview URL:', err);
      setError('Failed to fetch URL');
      setWebviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        {webviewUrl ? (
          <AdvancedWebView url={webviewUrl} />
        ) : (
          <Calculator />
        )}
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
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
});
