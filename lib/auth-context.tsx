"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * PLACEHOLDER AUTHENTICATION SYSTEM
 * 
 * TODO: Replace with real authentication provider:
 * 
 * Option 1: Supabase Auth
 * - Install: @supabase/supabase-js
 * - Use: supabase.auth.signInWithPassword()
 * - Session: supabase.auth.getSession()
 * 
 * Option 2: Clerk
 * - Install: @clerk/nextjs
 * - Wrap app with <ClerkProvider>
 * - Use: useAuth(), useUser() hooks
 * 
 * Option 3: NextAuth.js
 * - Install: next-auth
 * - Configure: app/api/auth/[...nextauth]/route.ts
 * - Use: useSession() hook
 * 
 * This placeholder uses localStorage for demo purposes only.
 * DO NOT use this in production.
 */

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials - REPLACE WITH REAL AUTH
const DEMO_ADMIN = {
  email: "admin@dudenetwork.com",
  password: "taverntour2024",
  user: {
    id: "1",
    email: "admin@dudenetwork.com",
    name: "Admin User",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      /**
       * TODO: Replace with real session check
       * 
       * Supabase:
       * const { data: { session } } = await supabase.auth.getSession()
       * if (session?.user) setUser(session.user)
       * 
       * Clerk:
       * const { isLoaded, isSignedIn, user } = useUser()
       * 
       * NextAuth:
       * const { data: session } = useSession()
       */
      try {
        const storedUser = localStorage.getItem("admin_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // localStorage not available (SSR)
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    /**
     * TODO: Replace with real authentication
     * 
     * Supabase:
     * const { data, error } = await supabase.auth.signInWithPassword({
     *   email,
     *   password,
     * })
     * if (error) return { success: false, error: error.message }
     * setUser(data.user)
     * return { success: true }
     * 
     * Clerk:
     * Use <SignIn /> component or signIn.create()
     * 
     * NextAuth:
     * await signIn("credentials", { email, password })
     */
    
    // Demo login - check against hardcoded credentials
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      setUser(DEMO_ADMIN.user);
      try {
        localStorage.setItem("admin_user", JSON.stringify(DEMO_ADMIN.user));
      } catch {
        // localStorage not available
      }
      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    /**
     * TODO: Replace with real logout
     * 
     * Supabase:
     * await supabase.auth.signOut()
     * 
     * Clerk:
     * await signOut()
     * 
     * NextAuth:
     * await signOut()
     */
    setUser(null);
    try {
      localStorage.removeItem("admin_user");
    } catch {
      // localStorage not available
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protecting pages
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect handled by the component
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
