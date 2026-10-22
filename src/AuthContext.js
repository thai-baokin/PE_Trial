import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  // While a fresh registration is celebrating its "Registration successful"
  // banner, navigation is held so the List screen does not take over at once.
  const [holdNav, setHoldNav] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setInitializing(false);
      },
      () => setInitializing(false)
    );
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, initializing, holdNav, setHoldNav }),
    [user, initializing, holdNav]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
