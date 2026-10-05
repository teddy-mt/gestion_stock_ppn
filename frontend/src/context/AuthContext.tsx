import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Utilisateur } from "@/types";
import { loginRequest, registerRequest } from "@/api/services";

interface AuthContextType {
  utilisateur: Utilisateur | null;
  login: (nom: string, mot_de_passe: string) => Promise<void>;
  register: (nom: string, mot_de_passe: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("utilisateur");
    if (stored) {
      setUtilisateur(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (nom: string, mot_de_passe: string) => {
    const data = await loginRequest(nom, mot_de_passe);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    navigate("/");
  };

  const register = async (nom: string, mot_de_passe: string) => {
    const data = await registerRequest(nom, mot_de_passe);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setUtilisateur(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ utilisateur, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
