import { onAuthStateChanged, signOut, User } from '@firebase/auth';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { firebaseConfigError, getFirebaseAuth, hasFirebaseConfig } from '@/services/firebase';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  hasFirebaseConfig: boolean;
  configError: string | null;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(hasFirebaseConfig);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        hasFirebaseConfig,
        configError: firebaseConfigError,
        signOutUser: () => signOut(getFirebaseAuth()),
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
