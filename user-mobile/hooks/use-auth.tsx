import { onAuthStateChanged, signOut, User } from '@firebase/auth';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { firebaseConfigError, getFirebaseAuth, hasFirebaseConfig } from '@/services/firebase';
import { syncUserProfile } from '@/services/api';

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

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);
      setInitializing(false);

      // Sync to PostgreSQL on every login (new session or app restart).
      // Silently ignore sync errors so the app still works if the backend is down.
      if (nextUser) {
        try {
          await syncUserProfile();
        } catch {
          // backend may not be running locally — that's fine, just skip
        }
      }
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
