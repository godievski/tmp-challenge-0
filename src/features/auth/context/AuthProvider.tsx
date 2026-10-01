import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { secureStorage } from "@/services/storage/secureStorage";
import type { AuthService } from "../api/authService";
import { mockAuthService } from "../api/mockAuthService";
import type { AuthSession, LoginCredentials } from "../types";

const SESSION_KEY = "auth.session";

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal("Bearer"),
  email: z.email(),
});

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  restoreError: string | null;
  signIn: (credentials: LoginCredentials) => Promise<AuthSession>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  authService = mockAuthService,
  onSignOut,
}: {
  children: ReactNode;
  authService?: AuthService;
  onSignOut?: () => void | Promise<void>;
}) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const stored = await secureStorage.getJSON<unknown>(SESSION_KEY);
        if (!stored) return;

        const result = sessionSchema.safeParse(stored);
        if (result.success && active) {
          setSession(result.data);
        } else {
          await secureStorage.removeItem(SESSION_KEY);
        }
      } catch {
        if (active) {
          setRestoreError("No se pudo recuperar tu sesión. Inicia sesión nuevamente.");
        }
      } finally {
        if (active) setIsRestoring(false);
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async ({ email, password }: LoginCredentials): Promise<AuthSession> => {
      setRestoreError(null);
      const nextSession = await authService.login(email, password);
      try {
        await secureStorage.setJSON(SESSION_KEY, nextSession);
      } catch {
        throw new Error("No se pudo guardar tu sesión. Inténtalo nuevamente.");
      }
      setSession(nextSession);
      return nextSession;
    },
    [authService],
  );

  const signOut = useCallback(async () => {
    await secureStorage.removeItem(SESSION_KEY);
    try {
      await onSignOut?.();
    } finally {
      setSession(null);
    }
  }, [onSignOut]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        isRestoring,
        restoreError,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
