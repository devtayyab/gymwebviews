import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
  Share,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation, WebViewProgressEvent } from 'react-native-webview/lib/WebViewTypes';
import { ChevronLeft, ChevronRight, RotateCw, Share2, Hop as Home, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface AdvancedWebViewProps {
  url: string;
}

export default function AdvancedWebView({ url }: AdvancedWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  const progress = useSharedValue(0);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleLoadProgress = ({ nativeEvent }: WebViewProgressEvent) => {
    progress.value = withTiming(nativeEvent.progress, { duration: 100 });
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(false);
    progress.value = 0;
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    progress.value = withTiming(1, { duration: 200 }, () => {
      progress.value = 0;
    });
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  };

  const handleGoForward = () => {
    if (canGoForward) {
      webViewRef.current?.goForward();
    }
  };

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  const handleGoHome = () => {
    webViewRef.current?.injectJavaScript(`window.location.href = '${url}';`);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: currentUrl, url: currentUrl });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const handleRetry = () => {
    setError(false);
    webViewRef.current?.reload();
  };

  const injectedJavaScript = `
    (function() {
      // Smooth scrolling
      document.documentElement.style.scrollBehavior = 'smooth';

      // Enhanced touch interactions
      document.addEventListener('touchstart', function(e) {
        e.target.style.transition = 'opacity 0.1s';
      }, { passive: true });

      // Prevent zoom on double tap (optional)
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      true;
    })();
  `;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>Unable to load the page. Please check your internet connection.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <RotateCw size={20} color="#fff" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {progress.value > 0 && progress.value < 1 && (
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.webviewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadProgress={handleLoadProgress}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onScroll={(e) => {
              const y = e.nativeEvent.contentOffset.y;
              setIsAtTop(y <= 0);
            }}
            injectedJavaScript={injectedJavaScript}
            startInLoadingState={true}
            // renderLoading={() => (
            //   <View style={styles.loadingContainer}>
            //     <ActivityIndicator size="large" color="#007AFF" />
            //     <Text style={styles.loadingText}>Loading...</Text>
            //   </View>
            // )}
            allowsBackForwardNavigationGestures
            // decelerationRate="normal"
            bounces={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            mixedContentMode="compatibility"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
          />
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      {/* <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <ChevronLeft size={24} color={canGoBack ? '#007AFF' : '#ccc'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <ChevronRight size={24} color={canGoForward ? '#007AFF' : '#ccc'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleReload}>
          <RotateCw size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleGoHome}>
          <Home size={24} color="#007AFF" />
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.navButton} onPress={handleShare}>
            <Share2 size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  webviewWrapper: {
    flex: 1,
    minHeight: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
