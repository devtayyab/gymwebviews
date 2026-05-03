import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, ActivityIndicator, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AdvancedWebView from '@/components/AdvancedWebView';
import Calculator from '@/components/Calculator';

export default function HomeScreen() {
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplashImage, setShowSplashImage] = useState(true);

  useEffect(() => {
    fetchWebviewUrl();
    
    const timer = setTimeout(() => {
      setShowSplashImage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const fetchWebviewUrl = async () => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      console.log("SUPABASE_URL:", supabaseUrl);
      console.log("SUPABASE_ANON_KEY:", supabaseKey ? "✅ Present" : "❌ MISSING");

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase environment variables missing");
      }

      const apiUrl = `${supabaseUrl}/functions/v1/get-webview-url`;
      console.log("Fetching from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log("Supabase Response:", data);

      if (data.url) {
        setWebviewUrl(data.url);
      } else {
        setWebviewUrl(null);
      }
    } catch (err: any) {
      console.error('Error fetching webview URL:', err.message || err);
      setError('Failed to fetch URL');
      setWebviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  if (showSplashImage) {
    return (
      <View style={styles.fullScreenSplashContainer}>
        <StatusBar style="light" />
        <Image 
          source={require('../assets/smarty-gym/splash screens/14-15-pro-max.jpg')} 
          style={styles.fullScreenSplashImage} 
        />
      </View>
    );
  }

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
    paddingTop: Platform.OS === 'android' ? 45 : 0,
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
  fullScreenSplashContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenSplashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

