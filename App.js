import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';
import { BooksProvider } from './src/BooksContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors } from './src/theme';

// One account's inner app: List screen with optional Detail screen.
// Mounted with key={uid}, so a different account starts everything fresh.
function Shell({ onLogout }) {
  const [bookId, setBookId] = useState(null);

  if (bookId) {
    return <DetailScreen bookId={bookId} onBack={() => setBookId(null)} onReselect={setBookId} />;
  }
  return <ListScreen onOpenBook={setBookId} onLogout={onLogout} />;
}

function Root() {
  const { user, initializing, holdNav, setHoldNav } = useAuth();
  const [flow, setFlow] = useState('home'); // home | login | register

  // While the app is still checking whether someone is already logged in,
  // nothing is rendered — no flash of content, no wrong navigation.
  if (initializing) return null;

  // A fresh registration shows its success banner before entering the app.
  if (user && holdNav) {
    return <RegisterScreen registered onFinish={() => setHoldNav(false)} onBack={() => setFlow('home')} />;
  }

  if (user) {
    return <Shell key={user.uid} onLogout={() => setFlow('home')} />;
  }

  if (flow === 'login') {
    return <LoginScreen onBack={() => setFlow('home')} onRegister={() => setFlow('register')} />;
  }
  if (flow === 'register') {
    return <RegisterScreen onBack={() => setFlow('home')} onFinish={() => setHoldNav(false)} />;
  }

  return <HomeScreen onLogin={() => setFlow('login')} onRegister={() => setFlow('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BooksProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <Root />
        </View>
      </BooksProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
