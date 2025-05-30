import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, type User, type Group } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  group: Group | null;
  login: (username: string, password: string, groupCode: string) => Promise<void>;
  logout: () => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await auth.getCurrentUser();
        if (data) {
          setUser(data.user);
          setGroup(data.group);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, groupCode: string) => {
    const data = await auth.login(username, password, groupCode);
    setUser(data.user);
    setGroup(data.group);
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
    setGroup(null);
  };

  const createGroup = async (name: string) => {
    const newGroup = await auth.createGroup(name);
    setGroup(newGroup);
    return newGroup;
  };

  return (
    <AuthContext.Provider value={{ user, group, login, logout, createGroup, isLoading }}>
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
