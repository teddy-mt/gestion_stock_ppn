import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Produits from "@/pages/Produits";
import Categories from "@/pages/Categories";
import Fournisseurs from "@/pages/Fournisseurs";
import Approvisionnements from "@/pages/Approvisionnements";
import Sorties from "@/pages/Sorties";
import Ventes from "@/pages/Ventes";
import Statistiques from "@/pages/Statistiques";
import Utilisateurs from "@/pages/Utilisateurs";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/produits" element={<Produits />} />
          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "GESTIONNAIRE"]}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fournisseurs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "GESTIONNAIRE"]}>
                <Fournisseurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvisionnements"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "GESTIONNAIRE"]}>
                <Approvisionnements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sorties"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "GESTIONNAIRE"]}>
                <Sorties />
              </ProtectedRoute>
            }
          />
          <Route path="/ventes" element={<Ventes />} />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route
            path="/utilisateurs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Utilisateurs />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
