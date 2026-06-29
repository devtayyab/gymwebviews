import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import OfflineBanner from '@/components/OfflineBanner';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [showSplashImage, setShowSplashImage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplashImage(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplashImage) {
    return (
      <SafeAreaView style={styles.splashSafeArea}>
        <StatusBar style="light" />
        <View style={styles.fullScreenSplashContainer}>
          <Image
            source={require('../assets/smarty-gym/splash screens/14-15-pro-max.jpg')}
            style={styles.fullScreenSplashImage}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="checkin" options={{ title: 'Gym Check-In' }} />
        <Stack.Screen name="timer" options={{ title: 'Workout Timer' }} />
        <Stack.Screen name="reminders" options={{ title: 'Workout Reminders' }} />
        <Stack.Screen name="more" options={{ title: 'More' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <OfflineBanner />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  splashSafeArea: {
    flex: 1,
    backgroundColor: '#000',
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
